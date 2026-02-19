#!/usr/bin/env node

/**
 * Feature Audit Script
 * Analyzes the codebase to determine which PRD features are actually implemented
 */

const fs = require('fs');
const path = require('path');

// Read all source files
const routersContent = fs.readFileSync(path.join(__dirname, 'server/routers.ts'), 'utf-8');
const dbContent = fs.readFileSync(path.join(__dirname, 'server/db.ts'), 'utf-8');
const schemaContent = fs.readFileSync(path.join(__dirname, 'drizzle/schema.ts'), 'utf-8');

// Extract table names
const tableMatches = schemaContent.match(/export const (\w+) = mysqlTable/g) || [];
const tables = tableMatches.map(m => m.replace(/export const (\w+) = mysqlTable/, '$1'));

// Extract router procedures
const routerMatches = routersContent.match(/(\w+):\s*(?:public|protected|admin)?Procedure\.(query|mutation)/g) || [];
const procedures = routerMatches.map(m => m.split(':')[0].trim());

// Extract database functions
const dbMatches = dbContent.match(/export (?:async )?(?:function|const) (\w+)/g) || [];
const dbFunctions = dbMatches.map(m => m.replace(/export (?:async )?(?:function|const) (\w+)/, '$1'));

// Feature checklist
const features = {
  'Module 5.1: POS & Order Management': {
    'Offline Mode': { tables: ['orders'], functions: ['offlineService'], files: ['client/src/lib/offlineService.ts'] },
    'Barcode Scanner': { tables: [], functions: [], files: ['client/src/lib/barcodeScanner.ts'] },
    'Third-party Aggregators': { tables: [], functions: [], files: ['server/aggregators.ts', 'server/aggregator-routers.ts'] },
    'Digital Wallets': { tables: ['paymentTransactions'], functions: ['createPayment'], procedures: ['payment.create'] },
    'Card Payments': { tables: ['paymentTransactions'], functions: ['createPayment'], procedures: ['payment.create'] },
    'Split Bills': { tables: ['splitBills', 'splitBillParts'], functions: ['createSplitBill'], procedures: ['order.splitBill'] },
    'Discounts': { tables: ['discounts', 'orderDiscounts'], functions: ['applyDiscount'], procedures: ['order.applyDiscount'] },
    'Void/Refunds': { tables: ['orderItemVoidReasons', 'orderVoidReasons'], functions: ['voidItem'], procedures: ['order.voidItem'] },
    'KDS': { tables: ['orders', 'orderItems'], functions: ['getKDSOrders'], procedures: ['kds.getOrders'] },
    'Menu Management': { tables: ['menuItems', 'menuCategories', 'menuModifiers'], functions: ['createMenuItem'], procedures: ['menu.create'] },
  },
  'Module 5.2: Inventory Management': {
    'Stock Tracking': { tables: ['ingredients'], functions: ['getInventoryLevels'], procedures: ['inventory.list'] },
    'Waste Tracking': { tables: ['wasteLogs', 'wasteReports'], functions: ['logWaste'], procedures: ['waste.logWaste'] },
    'Recipe Management': { tables: ['recipes', 'recipeCostHistory'], functions: ['createRecipe'], procedures: ['recipe.create'] },
    'Supplier Management': { tables: ['suppliers', 'vendorProducts'], functions: ['createSupplier'], procedures: ['supplier.create'] },
    'Purchase Orders': { tables: ['purchaseOrders', 'purchaseOrderItems'], functions: ['createPurchaseOrder'], procedures: ['purchaseOrder.create'] },
    'Low Stock Alerts': { tables: ['ingredients'], functions: ['getLowStockItems'], procedures: ['inventory.lowStock'] },
  },
  'Module 5.3: Labour Management': {
    'Staff Directory': { tables: ['staff'], functions: ['createStaff'], procedures: ['staff.create'] },
    'Scheduling': { tables: ['shifts'], functions: ['createShift'], procedures: ['shift.create'] },
    'Time Tracking': { tables: ['timeClock'], functions: ['clockIn'], procedures: ['staff.clockIn'] },
    'Payroll': { tables: ['timeClock'], functions: ['getPayrollData'], procedures: ['payroll.export'] },
    'Overtime Tracking': { tables: ['overtimeAlerts', 'labourCompliance'], functions: ['checkOvertime'], procedures: ['labour.checkOvertime'] },
    'Time Off Requests': { tables: ['timeOffRequests'], functions: ['createTimeOffRequest'], procedures: ['timeOff.create'] },
  },
  'Module 5.4: Financial Management': {
    'Invoice Management': { tables: [], functions: [], procedures: [] },
    'Cost Tracking': { tables: ['recipes', 'paymentTransactions'], functions: ['calculateCOGS'], procedures: [] },
    'Prime Cost Dashboard': { tables: [], functions: ['calculatePrimeCost'], procedures: ['profitability.getPrimeCost'] },
    'Profitability Reports': { tables: ['zReports'], functions: ['getProfitabilityReport'], procedures: ['reports.profitability'] },
  },
  'Module 5.5: Customer Management': {
    'Customer Profiles': { tables: ['customers'], functions: ['createCustomer'], procedures: ['customer.create'] },
    'Loyalty Program': { tables: ['customers'], functions: [], procedures: [] },
    'Segmentation': { tables: ['customerSegments', 'segmentMembers'], functions: ['createSegment'], procedures: ['segment.create'] },
    'SMS Notifications': { tables: ['smsSettings', 'smsMessages'], functions: ['sendSMS'], procedures: ['sms.send'] },
    'Email Campaigns': { tables: ['emailCampaigns', 'emailCampaignRecipients'], functions: ['createCampaign'], procedures: ['campaign.create'] },
  },
  'Module 5.6: Multi-Location': {
    'Location Management': { tables: ['locations'], functions: ['createLocation'], procedures: ['location.create'] },
    'Location-based Pricing': { tables: ['locationMenuPrices'], functions: ['getLocationPrice'], procedures: ['location.getPrice'] },
    'Consolidated Reporting': { tables: [], functions: ['getConsolidatedReport'], procedures: [] },
  },
  'Module 5.7: Analytics & BI': {
    'Sales Analytics': { tables: ['zReports'], functions: ['getSalesAnalytics'], procedures: ['analytics.sales'] },
    'Profitability Dashboard': { tables: [], functions: ['calculateProfitability'], procedures: ['analytics.profitability'] },
    'Custom Reports': { tables: [], functions: [], procedures: ['reports.custom'] },
  },
};

// Check if files exist
function fileExists(filePath) {
  return fs.existsSync(path.join(__dirname, filePath));
}

// Generate report
console.log('📊 FEATURE AUDIT REPORT\n');
console.log('='.repeat(80));

let totalFeatures = 0;
let builtFeatures = 0;
let partialFeatures = 0;

for (const [module, moduleFeatures] of Object.entries(features)) {
  console.log(`\n${module}`);
  console.log('-'.repeat(80));

  for (const [feature, requirements] of Object.entries(moduleFeatures)) {
    totalFeatures++;
    
    let isBuilt = false;
    let isPartial = false;
    let evidence = [];

    // Check tables
    if (requirements.tables.length > 0) {
      const tablesFound = requirements.tables.filter(t => tables.includes(t));
      if (tablesFound.length > 0) {
        evidence.push(`Tables: ${tablesFound.join(', ')}`);
        isBuilt = true;
      }
    }

    // Check functions
    if (requirements.functions.length > 0) {
      const functionsFound = requirements.functions.filter(f => dbFunctions.includes(f));
      if (functionsFound.length > 0) {
        evidence.push(`Functions: ${functionsFound.join(', ')}`);
        isBuilt = true;
      }
    }

    // Check procedures
    if (requirements.procedures.length > 0) {
      const proceduresFound = requirements.procedures.filter(p => routersContent.includes(p));
      if (proceduresFound.length > 0) {
        evidence.push(`Procedures: ${proceduresFound.join(', ')}`);
        isBuilt = true;
      }
    }

    // Check files
    if (requirements.files && requirements.files.length > 0) {
      const filesFound = requirements.files.filter(f => fileExists(f));
      if (filesFound.length > 0) {
        evidence.push(`Files: ${filesFound.join(', ')}`);
        isBuilt = true;
      }
    }

    if (isBuilt) {
      builtFeatures++;
      console.log(`  ✅ ${feature}`);
      if (evidence.length > 0) console.log(`     ${evidence.join(' | ')}`);
    } else {
      console.log(`  ❌ ${feature}`);
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n📈 SUMMARY`);
console.log(`Total Features Checked: ${totalFeatures}`);
console.log(`Built: ${builtFeatures} (${Math.round(builtFeatures/totalFeatures*100)}%)`);
console.log(`Missing: ${totalFeatures - builtFeatures} (${Math.round((totalFeatures-builtFeatures)/totalFeatures*100)}%)`);
console.log(`\n📦 Database Tables: ${tables.length}`);
console.log(`🔧 Database Functions: ${dbFunctions.length}`);
console.log(`📡 Router Procedures: ${procedures.length}`);
