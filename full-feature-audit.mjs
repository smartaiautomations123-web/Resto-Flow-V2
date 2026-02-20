#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const dbFile = fs.readFileSync('./server/db.ts', 'utf-8');
const routersFile = fs.readFileSync('./server/routers.ts', 'utf-8');
const schemaFile = fs.readFileSync('./drizzle/schema.ts', 'utf-8');

const features = {
  'Module 5.1: POS & Order Management': {
    'POS System': ['createOrder', 'updateOrder', 'getOrders', 'voidOrder'],
    'Split Bills': ['createSplitBill', 'updateSplitBill', 'getSplitBills'],
    'Table Merges': ['mergeTable', 'unmergeTable'],
    'Payments': ['createPayment', 'updatePayment', 'getPayments', 'refundPayment'],
    'Disputes': ['createDispute', 'updateDispute', 'getDisputes'],
    'Void & Refunds': ['voidOrder', 'refundOrder', 'getVoidReasons'],
    'Barcode Scanner': ['scanBarcode', 'processBarcodeItem'],
    'Offline Mode': ['syncOfflineOrders', 'getOfflineOrders'],
    'Aggregators': ['getAggregatorOrders', 'updateAggregatorOrder'],
    'Digital Wallets': ['processApplePay', 'processGooglePay'],
  },
  'Module 5.2: Inventory & Supply Chain': {
    'Inventory Management': ['getInventory', 'updateInventory', 'createInventoryItem'],
    'Recipes': ['createRecipe', 'updateRecipe', 'getRecipes', 'calculateRecipeCost'],
    'Suppliers': ['createSupplier', 'updateSupplier', 'getSuppliers'],
    'Purchase Orders': ['createPurchaseOrder', 'updatePurchaseOrder', 'getPurchaseOrders'],
    'Waste Tracking': ['createWaste', 'getWaste', 'getWasteReports'],
    'Stock Rotation': ['getStockRotation', 'updateStockRotation'],
    'Batch Tracking': ['createBatch', 'getBatches', 'trackBatchExpiry'],
    '3-Way Matching': ['validateThreeWayMatch', 'getMatchingStatus'],
    'Auto-Receive QR': ['processQRReceive', 'autoReceiveDelivery'],
    'EDI Integration': ['getEDIStatus', 'syncEDI'],
  },
  'Module 5.3: Labour & Staff Management': {
    'Staff Management': ['createStaff', 'updateStaff', 'getStaff', 'deleteStaff'],
    'Time Clock': ['clockIn', 'clockOut', 'getTimeClock', 'getTimesheet'],
    'Shifts': ['createShift', 'updateShift', 'getShifts', 'assignShift'],
    'Labour Costs': ['calculateLabourCost', 'getLabourCostReport'],
    'Overtime': ['calculateOvertime', 'getOvertimeAlerts'],
    'Biometric Tracking': ['recordBiometric', 'verifyBiometric'],
    'GPS Verification': ['recordGPS', 'verifyGPSLocation'],
    'Geofencing': ['setGeofence', 'verifyGeofence'],
    'PTO Management': ['createPTO', 'approvePTO', 'getPTO'],
    'Certifications': ['addCertification', 'trackCertificationExpiry'],
  },
  'Module 5.4: Financial Management': {
    'Profitability': ['getProfitability', 'getProfitabilityByItem', 'getProfitabilityByShift'],
    'Revenue Tracking': ['getRevenue', 'getRevenueByCategory', 'getRevenueByServer'],
    'Cost Analysis': ['getCOGS', 'getLabourCost', 'getTotalCost'],
    'Prime Cost': ['calculatePrimeCost', 'getPrimeCostTrend'],
    'Invoices': ['createInvoice', 'updateInvoice', 'getInvoices'],
    'Expenses': ['createExpense', 'categorizeExpense', 'getExpenses'],
    'Depreciation': ['calculateDepreciation', 'trackDepreciation'],
  },
  'Module 5.5: Customer Management': {
    'Customer Database': ['createCustomer', 'updateCustomer', 'getCustomers'],
    'Loyalty Points': ['addPoints', 'redeemPoints', 'getPoints'],
    'Segmentation': ['createSegment', 'updateSegment', 'getSegments'],
    'SMS Campaigns': ['createSMSCampaign', 'sendSMS', 'getSMSCampaigns'],
    'Email Campaigns': ['createEmailCampaign', 'sendEmail', 'getEmailCampaigns'],
    'Churn Prediction': ['predictChurn', 'getChurnRisk'],
    'CLV Prediction': ['predictCLV', 'getCLVScore'],
  },
  'Module 5.6: Reservations & Seating': {
    'Reservations': ['createReservation', 'updateReservation', 'getReservations', 'cancelReservation'],
    'Waitlist': ['addToWaitlist', 'removeFromWaitlist', 'promoteFromWaitlist'],
    'Floor Plan': ['getFloorPlan', 'updateFloorPlan', 'getTableStatus'],
    'QR Codes': ['generateQRCode', 'getQRCode'],
    'Group Reservations': ['createGroupReservation', 'manageGroupReservation'],
  },
  'Module 5.7: Reports & Analytics': {
    'Z-Reports': ['createZReport', 'getZReports', 'reconcileZReport'],
    'Sales Reports': ['getSalesReport', 'getSalesByItem', 'getSalesByCategory'],
    'Labour Reports': ['getLabourReport', 'getLabourCostReport'],
    'Inventory Reports': ['getInventoryReport', 'getWasteReport'],
    'Custom Reports': ['createCustomReport', 'getCustomReports'],
    'Export Features': ['exportToCSV', 'exportToExcel', 'exportToPDF'],
  },
  'Module 5.8: Integrations & API': {
    'Aggregators': ['integrateUberEats', 'integrateDoorDash', 'integrateDeliveroo'],
    'Payment Gateways': ['integrateStripe', 'integrateSquare', 'integratePayPal'],
    'SMS': ['integrateTwilio', 'sendSMS'],
    'Email': ['integrateEmailService', 'sendEmail'],
    'Slack': ['integrateSlack', 'sendSlackMessage'],
    'Teams': ['integrateTeams', 'sendTeamsMessage'],
    'QuickBooks': ['integrateQuickBooks', 'syncQuickBooks'],
    'Multi-Language': ['setLanguage', 'translateUI'],
    'Multi-Currency': ['setCurrency', 'convertCurrency'],
  },
  'Module 5.9: Settings & Configuration': {
    'System Settings': ['getSystemSettings', 'updateSystemSettings'],
    'User Preferences': ['getUserPreferences', 'updateUserPreferences'],
    'Email Settings': ['getEmailSettings', 'updateEmailSettings'],
    'Payment Settings': ['getPaymentSettings', 'updatePaymentSettings'],
    'Delivery Settings': ['getDeliverySettings', 'updateDeliverySettings'],
    'Receipt Settings': ['getReceiptSettings', 'updateReceiptSettings'],
    'Security Settings': ['getSecuritySettings', 'updateSecuritySettings'],
    'API Keys': ['createAPIKey', 'revokeAPIKey', 'getAPIKeys'],
    'Audit Logging': ['getAuditLog', 'updateAuditLogSettings'],
    'Backup Settings': ['getBackupSettings', 'updateBackupSettings'],
  },
};

console.log('='.repeat(80));
console.log('COMPREHENSIVE FEATURE AUDIT');
console.log('='.repeat(80));
console.log();

let totalFeatures = 0;
let builtFeatures = 0;
const results = {};

for (const [module, categories] of Object.entries(features)) {
  results[module] = {};
  let moduleBuilt = 0;
  let moduleTotal = 0;

  for (const [category, funcs] of Object.entries(categories)) {
    results[module][category] = {};
    let categoryBuilt = 0;
    let categoryTotal = funcs.length;
    moduleTotal += categoryTotal;

    for (const func of funcs) {
      const isBuilt = dbFile.includes(`${func}`) || routersFile.includes(`${func}`);
      if (isBuilt) {
        categoryBuilt++;
        moduleBuilt++;
        builtFeatures++;
        results[module][category][func] = '✅';
      } else {
        results[module][category][func] = '❌';
      }
      totalFeatures++;
    }

    const percent = Math.round((categoryBuilt / categoryTotal) * 100);
    console.log(`${module} > ${category}: ${categoryBuilt}/${categoryTotal} (${percent}%)`);
  }

  const percent = Math.round((moduleBuilt / moduleTotal) * 100);
  console.log(`  → ${module}: ${moduleBuilt}/${moduleTotal} (${percent}%)`);
  console.log();
}

console.log('='.repeat(80));
console.log(`OVERALL: ${builtFeatures}/${totalFeatures} features (${Math.round((builtFeatures / totalFeatures) * 100)}%)`);
console.log('='.repeat(80));

// Detailed missing features
console.log();
console.log('MISSING FEATURES BY MODULE:');
console.log('='.repeat(80));

for (const [module, categories] of Object.entries(results)) {
  const missing = [];
  for (const [category, funcs] of Object.entries(categories)) {
    for (const [func, status] of Object.entries(funcs)) {
      if (status === '❌') {
        missing.push(`  - ${category}: ${func}`);
      }
    }
  }
  if (missing.length > 0) {
    console.log(`\n${module}:`);
    console.log(missing.join('\n'));
  }
}
