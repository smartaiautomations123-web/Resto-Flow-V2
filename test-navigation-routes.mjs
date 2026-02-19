#!/usr/bin/env node

/**
 * Navigation Routes Verification Script
 * Verifies that all routes defined in DashboardLayout are properly configured in App.tsx
 */

import fs from 'fs';
import path from 'path';

const dashboardLayoutPath = './client/src/components/DashboardLayout.tsx';
const appTsxPath = './client/src/App.tsx';

console.log('🔍 Navigation Routes Verification\n');

// Extract routes from DashboardLayout
const dashboardContent = fs.readFileSync(dashboardLayoutPath, 'utf-8');
const routeMatches = dashboardContent.match(/path:\s*"([^"]+)"/g) || [];
const dashboardRoutes = routeMatches.map(m => m.replace(/path:\s*"|"/g, '')).sort();

// Extract routes from App.tsx
const appContent = fs.readFileSync(appTsxPath, 'utf-8');
const appRouteMatches = appContent.match(/path="([^"]+)"/g) || [];
const appRoutes = appRouteMatches.map(m => m.replace(/path="|"/g, '')).sort();

console.log(`📍 Routes in DashboardLayout: ${dashboardRoutes.length}`);
dashboardRoutes.forEach(route => console.log(`   ✓ ${route}`));

console.log(`\n📍 Routes in App.tsx: ${appRoutes.length}`);
appRoutes.forEach(route => console.log(`   ✓ ${route}`));

// Find missing routes
const missingInApp = dashboardRoutes.filter(route => !appRoutes.includes(route));
const extraInApp = appRoutes.filter(route => !dashboardRoutes.includes(route) && route !== '/404');

console.log('\n📊 Verification Results:');

if (missingInApp.length === 0) {
  console.log('✅ All routes in DashboardLayout are defined in App.tsx');
} else {
  console.log('❌ Missing routes in App.tsx:');
  missingInApp.forEach(route => console.log(`   - ${route}`));
}

if (extraInApp.length === 0) {
  console.log('✅ No extra routes in App.tsx');
} else {
  console.log('⚠️  Extra routes in App.tsx (public routes):');
  extraInApp.forEach(route => console.log(`   - ${route}`));
}

// Extract menu groups
const groupMatches = dashboardContent.match(/id:\s*"([^"]+)"/g) || [];
const groups = groupMatches.map(m => m.replace(/id:\s*"|"/g, '')).sort();

console.log(`\n📂 Navigation Groups: ${groups.length}`);
groups.forEach(group => console.log(`   ✓ ${group}`));

// Count items per group
const groupItemMatches = dashboardContent.match(/items:\s*\[([\s\S]*?)\]/g) || [];
console.log(`\n📋 Items per Group:`);

groups.forEach((group, index) => {
  if (groupItemMatches[index]) {
    const itemCount = (groupItemMatches[index].match(/path:/g) || []).length;
    console.log(`   ${group}: ${itemCount} items`);
  }
});

// Summary
console.log('\n✨ Navigation Reorganization Summary:');
console.log(`   Total Routes: ${dashboardRoutes.length}`);
console.log(`   Total Groups: ${groups.length}`);
console.log(`   Status: ${missingInApp.length === 0 ? '✅ READY' : '❌ NEEDS FIXES'}`);

process.exit(missingInApp.length === 0 ? 0 : 1);
