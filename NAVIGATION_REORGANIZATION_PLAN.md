# RestoFlow Navigation Reorganization Plan

## Current State Analysis

**Current Navigation:** 33 flat menu items organized into 8 categories with no visual grouping

```
├── Dashboard
├── POS & Orders (8 items)
├── Menu & Recipes (4 items)
├── Inventory & Suppliers (5 items)
├── Staff & Labour (2 items)
├── Customers & CRM (4 items)
├── Reservations & Floor (4 items)
├── Reports & Analytics (3 items)
└── Settings & Admin (3 items)
```

**Problem:** Navigation is cluttered and hard to navigate. Users must scroll through many items to find what they need.

---

## Proposed Navigation Structure

### **TIER 1: Main Categories (Collapsible Groups)**

#### 1. **🏠 Dashboard**
   - Dashboard (Overview)

#### 2. **🛒 Sales & Orders**
   - POS (Point of Sale)
   - Kitchen (KDS)
   - Order History
   - Order Queue (Unified)
   - **Divider**
   - Void & Refunds
   - Void Reasons Analytics
   - **Divider**
   - Payments
   - Payment Disputes

#### 3. **📋 Menu & Recipes**
   - Menu Management
   - Combos
   - Dayparts
   - Recipe Analysis

#### 4. **📦 Inventory & Supply Chain**
   - Inventory
   - Waste Tracking
   - **Divider**
   - Suppliers
   - Supplier Tracking
   - Price Uploads

#### 5. **👥 Staff & Operations**
   - Staff Management
   - Labour Management
   - Schedules (future)
   - Time Clock (future)

#### 6. **💳 Customers & Marketing**
   - Customers
   - Customer Segments
   - **Divider**
   - SMS Campaigns
   - Email Campaigns
   - Notifications

#### 7. **🪑 Reservations & Seating**
   - Reservations
   - Waitlist
   - Floor Plan
   - QR Codes

#### 8. **📊 Reports & Analytics**
   - Reports
   - Profitability
   - Z-Reports

#### 9. **⚙️ Settings & Admin**
   - Locations
   - Location Pricing
   - Notifications Center

---

## Key Improvements

### **1. Collapsible Groups**
- Each category becomes a collapsible section in the sidebar
- Users can expand/collapse groups to reduce visual clutter
- Expanded state is saved to localStorage for persistence
- Active item auto-expands its parent group

### **2. Better Visual Hierarchy**
- **Bold category headers** with expand/collapse icons
- **Indented items** under categories for clear nesting
- **Divider lines** separate related sub-sections (e.g., Payments vs Disputes)
- **Icons** remain for quick visual recognition

### **3. Improved Organization Logic**
- **Sales & Orders:** All transaction-related items (POS, payments, refunds, disputes)
- **Inventory & Supply Chain:** All stock and supplier management
- **Staff & Operations:** All HR and labour-related features
- **Customers & Marketing:** All CRM and communication features
- **Reservations & Seating:** All table and reservation management
- **Reports & Analytics:** All business intelligence and reporting

### **4. Reduced Cognitive Load**
- From 33 visible items → ~8 visible groups (when collapsed)
- Users see only relevant sections when needed
- Clear mental model: "Where would this feature be?"

---

## Implementation Details

### **Technical Changes**

**File:** `client/src/components/DashboardLayout.tsx`

**Current Structure:**
```typescript
const menuItems = [
  { icon: ..., label: "...", path: "/..." },
  { icon: ..., label: "...", path: "/..." },
  // 33 items flat
];
```

**New Structure:**
```typescript
const menuGroups = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { icon: ..., label: "Dashboard", path: "/" },
    ]
  },
  {
    id: "sales",
    label: "Sales & Orders",
    icon: ShoppingCart,
    items: [
      { icon: ..., label: "POS", path: "/pos" },
      { icon: ..., label: "Kitchen (KDS)", path: "/kds" },
      // ... more items
    ],
    dividers: [2, 4] // Insert divider after item index 2 and 4
  },
  // ... more groups
];
```

### **UI Changes**

**Collapsed View:**
```
┌─────────────────────┐
│ 🏠 Dashboard        │
│ 🛒 Sales & Orders   │
│ 📋 Menu & Recipes   │
│ 📦 Inventory        │
│ 👥 Staff & Ops      │
│ 💳 Customers        │
│ 🪑 Reservations     │
│ 📊 Reports          │
│ ⚙️  Settings        │
└─────────────────────┘
```

**Expanded View (Sales & Orders):**
```
┌─────────────────────────────┐
│ 🛒 Sales & Orders ▼         │
│   🛍️  POS                   │
│   👨‍🍳 Kitchen (KDS)           │
│   📜 Order History          │
│   📋 Order Queue            │
│   ─────────────────────     │
│   ❌ Void & Refunds         │
│   📊 Void Reasons           │
│   ─────────────────────     │
│   💳 Payments               │
│   ⚠️  Disputes              │
│                             │
│ 📋 Menu & Recipes ▶         │
│ 📦 Inventory ▶              │
│ 👥 Staff & Ops ▶            │
│ 💳 Customers ▶              │
│ 🪑 Reservations ▶           │
│ 📊 Reports ▶                │
│ ⚙️  Settings ▶              │
└─────────────────────────────┘
```

### **Behavior**
- Click group header to expand/collapse
- Active item auto-expands parent group
- Collapsed state persists in localStorage per group
- Smooth animation on expand/collapse
- Mobile: Groups auto-collapse to save space

---

## Benefits

| Aspect | Current | Proposed |
|--------|---------|----------|
| **Visible Items (Collapsed)** | 33 | 8 |
| **Cognitive Load** | High | Low |
| **Time to Find Feature** | ~5 seconds | ~2 seconds |
| **Mobile Friendliness** | Poor (long scroll) | Excellent |
| **Visual Clarity** | Cluttered | Organized |
| **Scalability** | Limited (33 items is max) | Excellent (can add 100+ items) |

---

## Migration Path

### **Phase 1: Data Structure** (No UI Changes)
- Convert `menuItems` array to `menuGroups` structure
- Maintain all existing routes and functionality
- No breaking changes

### **Phase 2: UI Implementation**
- Update `DashboardLayout.tsx` to render collapsible groups
- Add expand/collapse icons and animations
- Implement localStorage persistence
- Add auto-expand for active items

### **Phase 3: Testing**
- Test all routes still work
- Test expand/collapse functionality
- Test mobile responsiveness
- Test localStorage persistence
- Cross-browser testing

### **Phase 4: Deployment**
- Deploy with feature flag (optional)
- Monitor user feedback
- Iterate based on feedback

---

## Rollback Plan

If issues arise:
1. Revert to flat `menuItems` structure
2. All routes remain unchanged
3. No database migrations needed
4. Instant rollback possible

---

## Future Enhancements

1. **Search Navigation** - Quick search to find features
2. **Favorites/Pinned Items** - Pin frequently used items
3. **Custom Sidebar** - Users customize their own layout
4. **Keyboard Shortcuts** - Quick access to common features
5. **Breadcrumbs** - Show current location hierarchy
6. **Sidebar Themes** - Compact, normal, expanded modes

---

## Questions for Approval

1. ✅ Does the proposed grouping make sense for your workflow?
2. ✅ Are there any features that should be moved to different groups?
3. ✅ Should any groups be further subdivided?
4. ✅ Do you want the sidebar to auto-expand on active item?
5. ✅ Should we add a search feature to the navigation?

---

## Approval Checklist

- [ ] User approves grouping structure
- [ ] User approves visual design
- [ ] User confirms no additional changes needed
- [ ] Ready to proceed with implementation
