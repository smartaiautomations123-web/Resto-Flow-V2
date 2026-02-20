#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ============================================================================
// BACKEND AUDIT
// ============================================================================

console.log('\n========== BACKEND AUDIT ==========\n');

// Read db.ts
const dbPath = path.join(__dirname, 'server/db.ts');
const dbContent = fs.readFileSync(dbPath, 'utf-8');

// Extract all exported functions
const dbFunctions = dbContent.match(/export async function (\w+)/g) || [];
const dbFunctionNames = dbFunctions.map(f => f.replace('export async function ', ''));

console.log(`Total Database Helper Functions: ${dbFunctionNames.length}`);
console.log('Sample functions:', dbFunctionNames.slice(0, 10).join(', '));

// Read routers.ts
const routersPath = path.join(__dirname, 'server/routers.ts');
const routersContent = fs.readFileSync(routersPath, 'utf-8');

// Extract all router modules
const routerModules = routersContent.match(/(\w+):\s*router\({/g) || [];
const routerNames = routerModules.map(r => r.replace(/:\s*router\({/, ''));

console.log(`\nTotal Router Modules: ${routerNames.length}`);
console.log('Router modules:', routerNames.join(', '));

// Count procedures in each router
const proceduresByRouter = {};
for (const router of routerNames) {
  const pattern = new RegExp(`${router}:\\s*router\\({([^}]+)}\\)`, 's');
  const match = routersContent.match(pattern);
  if (match) {
    const procedures = match[1].match(/(\w+):\s*(public|protected)/g) || [];
    proceduresByRouter[router] = procedures.length;
  }
}

console.log('\nProcedures by Router:');
Object.entries(proceduresByRouter).forEach(([router, count]) => {
  console.log(`  ${router}: ${count} procedures`);
});

// ============================================================================
// FRONTEND AUDIT
// ============================================================================

console.log('\n========== FRONTEND AUDIT ==========\n');

// Find all page components
const pagesDir = path.join(__dirname, 'client/src/pages');
const pages = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.tsx'))
  .map(f => f.replace('.tsx', ''));

console.log(`Total Frontend Pages: ${pages.length}`);
console.log('Pages:', pages.join(', '));

// Find all components
const componentsDir = path.join(__dirname, 'client/src/components');
const components = fs.readdirSync(componentsDir)
  .filter(f => f.endsWith('.tsx') && !f.includes('.test'))
  .map(f => f.replace('.tsx', ''));

console.log(`\nTotal Frontend Components: ${components.length}`);
console.log('Sample components:', components.slice(0, 15).join(', '));

// ============================================================================
// FEATURE MAPPING
// ============================================================================

console.log('\n========== FEATURE MAPPING ==========\n');

const featureMap = {
  'Dashboard': { backend: ['getDashboardMetrics'], frontend: ['Dashboard'] },
  'POS': { backend: ['createOrder', 'updateOrder', 'getOrders'], frontend: ['POS'] },
  'Kitchen (KDS)': { backend: ['getOrdersByStatus'], frontend: ['KDS'] },
  'Menu Management': { backend: ['getMenuItems', 'createMenuItem', 'updateMenuItem'], frontend: ['MenuManagement'] },
  'Inventory': { backend: ['getInventory', 'updateInventory'], frontend: ['Inventory'] },
  'Suppliers': { backend: ['getSuppliers', 'createSupplier'], frontend: ['Suppliers'] },
  'Staff Management': { backend: ['getStaff', 'createStaff'], frontend: ['StaffManagement'] },
  'Labour Management': { backend: ['getLabourCosts', 'getShifts'], frontend: ['LabourManagement'] },
  'Customers': { backend: ['getCustomers', 'createCustomer'], frontend: ['Customers'] },
  'Reservations': { backend: ['getReservations', 'createReservation'], frontend: ['Reservations'] },
  'Reports': { backend: ['getReports', 'generateReport'], frontend: ['Reports'] },
  'Profitability': { backend: ['getProfitability', 'getProfitabilityByItem'], frontend: ['Profitability'] },
  'Z-Reports': { backend: ['getZReports', 'createZReport'], frontend: ['ZReports'] },
  'Settings': { backend: ['getSystemSettings', 'updateSystemSettings'], frontend: ['Settings'] },
};

console.log('Feature Coverage Analysis:\n');
let builtFeatures = 0;
let missingFeatures = 0;

for (const [feature, required] of Object.entries(featureMap)) {
  const backendBuilt = required.backend.some(fn => dbFunctionNames.includes(fn));
  const frontendBuilt = required.frontend.some(page => pages.includes(page));
  
  if (backendBuilt && frontendBuilt) {
    console.log(`✅ ${feature}: COMPLETE (Backend ✓, Frontend ✓)`);
    builtFeatures++;
  } else if (backendBuilt && !frontendBuilt) {
    console.log(`🟡 ${feature}: PARTIAL (Backend ✓, Frontend ✗)`);
    missingFeatures++;
  } else if (!backendBuilt && frontendBuilt) {
    console.log(`🟡 ${feature}: PARTIAL (Backend ✗, Frontend ✓)`);
    missingFeatures++;
  } else {
    console.log(`❌ ${feature}: MISSING (Backend ✗, Frontend ✗)`);
    missingFeatures++;
  }
}

console.log(`\nBuilt Features: ${builtFeatures}/${builtFeatures + missingFeatures}`);

// ============================================================================
// MISSING FRONTEND PAGES
// ============================================================================

console.log('\n========== MISSING FRONTEND PAGES ==========\n');

const expectedPages = [
  'Dashboard', 'POS', 'KDS', 'MenuManagement', 'ComboBuilder', 'DaypartManagement',
  'Inventory', 'WasteTracking', 'RecipeAnalysis', 'Suppliers', 'SupplierTracking',
  'StaffManagement', 'LabourManagement', 'Customers', 'CustomerDetail', 'CustomerSegments',
  'Reservations', 'Waitlist', 'FloorPlan', 'Reports', 'Profitability', 'ZReports',
  'PaymentManagement', 'PaymentDisputes', 'VoidRefunds', 'QRCodeGenerator', 'Settings',
  'LocationManagement', 'LocationPricing', 'SmsSettings', 'EmailCampaigns', 'NotificationCenter',
  'OnlineOrdering', 'TableOrdering', 'OrderHistory', 'OrderQueue', 'VoidReasonAnalytics'
];

const missingPages = expectedPages.filter(page => !pages.includes(page));
if (missingPages.length > 0) {
  console.log('Missing Frontend Pages:');
  missingPages.forEach(page => console.log(`  ❌ ${page}`));
} else {
  console.log('✅ All expected frontend pages are built!');
}

// ============================================================================
// MISSING BACKEND FUNCTIONS
// ============================================================================

console.log('\n========== MISSING BACKEND FUNCTIONS ==========\n');

const expectedFunctions = [
  'getDashboardMetrics', 'createOrder', 'updateOrder', 'getOrders', 'voidOrder',
  'getMenuItems', 'createMenuItem', 'updateMenuItem', 'deleteMenuItem',
  'getInventory', 'updateInventory', 'getWaste', 'createWaste',
  'getSuppliers', 'createSupplier', 'updateSupplier',
  'getStaff', 'createStaff', 'updateStaff', 'deleteStaff',
  'getLabourCosts', 'getShifts', 'createShift', 'updateShift',
  'getCustomers', 'createCustomer', 'updateCustomer',
  'getReservations', 'createReservation', 'updateReservation', 'cancelReservation',
  'getReports', 'generateReport', 'getProfitability', 'getZReports',
  'getSystemSettings', 'updateSystemSettings', 'getUserPreferences', 'updateUserPreferences'
];

const missingFunctions = expectedFunctions.filter(fn => !dbFunctionNames.includes(fn));
if (missingFunctions.length > 0) {
  console.log('Missing Backend Functions:');
  missingFunctions.forEach(fn => console.log(`  ❌ ${fn}`));
} else {
  console.log('✅ All expected backend functions are built!');
}

console.log('\n========== AUDIT COMPLETE ==========\n');
