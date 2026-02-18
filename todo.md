# RestoFlow - Restaurant Management Platform TODO

## Completed Features ✓

### Phase 1 - Core Features
- [x] Database schema design & migrations
- [x] POS & Order Flow (dine-in, takeaway, delivery, collection)
- [x] Kitchen Display System (KDS) with station routing & timers
- [x] Menu Management (categories, items, modifiers, pricing)
- [x] Basic Inventory & Recipe Costing (ingredients, recipes, stock tracking)
- [x] Staff Accounts & Permissions (roles, PIN login, role-based access)
- [x] Real-Time Sales & Reporting Dashboard
- [x] Payments (card, cash, split bill, tips, service charge)
- [x] Vendor Price Uploads with LLM-powered PDF parsing
- [x] Dashboard redesign with KPI cards, quick actions, alerts

### Phase 2 - Back-Office & Automation
- [x] Advanced Inventory & Supplier Management
- [x] Purchase orders system
- [x] Labour Management (time clock, shift scheduling, labour cost tracking)
- [x] Owner/Manager Web Dashboard

### Phase 3 - Customer, Channels & Experience
- [x] Online Ordering (branded web page, menu sync)
- [x] QR Code Table Ordering (order-at-table)
- [x] Reservations system
- [x] CRM & Loyalty (customer profiles, points system)

### Infrastructure
- [x] Elegant dark theme with sophisticated design
- [x] Dashboard layout with sidebar navigation
- [x] Responsive design for tablet/mobile POS use
- [x] Vitest tests for core procedures
- [x] OAuth authentication with role-based access
- [x] MySQL connection pool with proper error handling

### Phase 4 - Floor Plan & Operations
- [x] Floor Plan Visualization (drag-and-drop canvas, multi-section support)
- [x] Table status indicators (free=green, occupied=red, reserved=yellow, cleaning=gray)
- [x] Real-time table status updates with 3-second polling
- [x] Section management (create, rename, delete sections)
- [x] Table detail modal with active orders display
- [x] Backend: sections table, floor plan CRUD endpoints
- [x] 6 tRPC routers for floor plan operations

---

## HIGH PRIORITY - Missing Core Features

### 1. End-of-Day (Z) Reports (Completed)
- [x] Create Z-report page/modal showing daily summary
- [x] Include: total revenue, total orders, cash vs card breakdown, discounts, voids
- [x] Show by-shift summary if multiple shifts
- [x] Export Z-report as TXT
- [x] Store Z-report history for audit trail
- [x] Add Z-report endpoint to backend

### 2. Void & Refund Management UI (Completed)
- [x] Create dedicated void/refund management page
- [x] Show pending voids/refunds with reason and staff member
- [x] Implement permission-based approval (admin only)
- [x] Add void reason tracking (customer request, mistake, damage, comp, other)
- [x] Track refund method (original payment, store credit, cash)
- [x] Add audit trail for all voids/refunds
- [x] Backend: Add void/refund reason enum to orders table

### 3. QR Code Generation for Managers (Completed)
- [x] Create QR code generation UI in Settings or Reservations page
- [x] Generate QR codes for each table linking to `/table/:tableId`
- [x] Display QR codes in a print-friendly format (8x8 grid for all tables)
- [x] Allow customization of QR code size and format
- [x] Store QR code URLs in database for easy reprint
- [x] Add QR code library (qr-code-styling)

### 4. Customer Order History Detail View (Completed)
- [x] Create customer detail page showing full profile
- [x] Display customer's complete order history with dates, items, totals
- [x] Show order details modal (items, modifiers, notes)
- [x] Display loyalty points balance and history
- [x] Show birthday and notes
- [x] Add "repeat order" quick action
- [x] Link from Customers list to detail view
- [x] Write tests for customer detail procedures (7 tests, all passing)

### 5. Automatic Plate Cost Calculation (Completed)
- [x] Backend: Add procedure to calculate menu item cost from linked recipes
- [x] Calculate cost = sum(ingredient.costPerUnit * recipe.quantity)
- [x] Update menu item's `cost` field when recipes change
- [x] Add cost calculation to menu management UI
- [x] Show calculated cost vs manual cost in menu editor
- [x] Add cost margin % display (price - cost) / price * 100
- [x] Display recipe breakdown with ingredient costs
- [x] Write tests for cost calculation procedures (8 tests, all passing)

---

## MEDIUM PRIORITY - Enhanced Features

### 6. Waitlist Management
- [ ] Add waitlist table to schema (name, phone, partySize, estimatedWaitTime, notes)
- [ ] Create waitlist page showing queue
- [ ] Add "Add to Waitlist" button on Reservations page
- [ ] Show estimated wait time based on current orders
- [ ] SMS notification when table is ready (requires SMS integration)
- [ ] Move from waitlist to reservation when table available
- [ ] Backend: Create waitlist CRUD endpoints

### 7. Profitability Analysis Dashboard
- [ ] Create profitability page with tabs: by-item, by-category, by-shift
- [ ] Show: revenue, COGS, labour cost, gross profit, profit margin %
- [ ] Identify top 10 most/least profitable items
- [ ] Show profit trends over time (daily/weekly)
- [ ] Compare actual vs target margins
- [ ] Export profitability report as PDF
- [ ] Backend: Add profit calculation queries

### 8. Customer Segmentation & Communication
- [ ] Add customer tags/segments (VIP, frequent, new, inactive, etc.)
- [ ] Create customer segment management page
- [ ] Build email/SMS campaign builder (basic)
- [ ] Export customer lists by segment
- [ ] Track campaign performance (send date, open rate, etc.)
- [ ] Backend: Add customer_segments table and segment_members table

### 9. Order History & Receipt Printing
- [ ] Create order history page with search/filter by date, customer, status
- [ ] Show order details modal with full item breakdown
- [ ] Print receipt (thermal printer format or PDF)
- [ ] Email receipt to customer
- [ ] Reprint old receipts
- [ ] Backend: Ensure all order data is properly stored for retrieval

### 10. Real-Time Order Status Tracking (for Online Orders)
- [ ] Create public order status page (no login required)
- [ ] Customer enters order number to view status
- [ ] Show: pending → preparing → ready → completed
- [ ] Estimated time remaining
- [ ] Push notification when order status changes
- [ ] Backend: Ensure online orders are properly tracked

### 11. Timesheet CSV Export
- [ ] Add export button on Staff page
- [ ] Export timesheet for selected date range
- [ ] Include: staff name, date, clock-in, clock-out, hours, rate, total cost
- [ ] Format suitable for payroll processing
- [ ] Support filtering by staff member or role

### 12. Daypart/Dynamic Pricing
- [ ] Add daypart management (breakfast, lunch, dinner, happy hour, etc.)
- [ ] Link dayparts to menu items
- [ ] Set different prices per daypart
- [ ] Auto-apply daypart pricing based on time of day
- [ ] Show active daypart on POS
- [ ] Backend: Add dayparts table and menu_item_dayparts table

### 13. Void/Refund Reason Tracking
- [ ] Add void_reasons enum: customer_request, mistake, damage, comp, other
- [ ] Track reason for each void/refund
- [ ] Report on void reasons (identify patterns)
- [ ] Backend: Add reason field to order items/orders

---

## LOWER PRIORITY - Advanced Features

### 14. SMS Notifications
- [ ] Integrate Twilio or similar SMS service
- [ ] Send SMS for: reservation confirmations, waitlist ready, order ready
- [ ] Allow customers to opt-in/out
- [ ] Track SMS delivery status
- [ ] Backend: Add SMS service integration

### 15. Email Campaigns
- [ ] Build email template builder
- [ ] Send campaigns to customer segments
- [ ] Track opens, clicks, conversions
- [ ] Schedule campaigns for future send
- [ ] Backend: Integrate with email service (SendGrid, Mailgun, etc.)

### 16. Inventory Waste Tracking
- [ ] Add waste log page
- [ ] Track: ingredient, quantity, reason (spoilage, damage, theft, etc.)
- [ ] Calculate waste cost impact
- [ ] Report on waste trends
- [ ] Backend: Add waste_logs table

### 17. Multi-Location Support
- [ ] Add locations table to schema
- [ ] Modify all tables to support location_id
- [ ] Create location management page
- [ ] Build consolidated reporting across locations
- [ ] Support location-specific inventory
- [ ] Support location-specific staff management
- [ ] Backend: Major refactor to add location filtering

### 18. Combo/Bundle Management
- [ ] Create combo builder UI
- [ ] Link multiple items to create bundles
- [ ] Set combo price (with discount vs individual items)
- [ ] Show combos on POS menu
- [ ] Backend: Add combos table and combo_items table

### 19. Advanced Labour Management
- [ ] Overtime tracking and alerts
- [ ] Compliance rules (max hours, break requirements)
- [ ] Staff availability calendar
- [ ] Time-off request system
- [ ] Labour budget vs actual tracking
- [ ] Backend: Extend shifts table with overtime fields

### 20. Payment Integration (Stripe/Square)
- [ ] Integrate Stripe or Square for online payments
- [ ] Support card payments in online ordering
- [ ] Support card payments in POS (if hardware available)
- [ ] Reconcile payments with orders
- [ ] Handle refunds through payment gateway
- [ ] Backend: Add payment_transactions table

### 21. Real-Time Notifications System
- [ ] Build notification center/bell icon
- [ ] Implement WebSocket or polling for real-time updates
- [ ] Notify on: new orders, low stock, staff alerts, system events
- [ ] Allow users to dismiss/archive notifications
- [ ] Notification preferences per user
- [ ] Backend: Add notifications table and service

### 22. Recipe Costing Analysis
- [ ] Show ingredient cost breakdown per recipe
- [ ] Identify cost changes when ingredient prices update
- [ ] Compare recipe cost vs menu item price
- [ ] Suggest price adjustments based on cost changes
- [ ] Track recipe cost history

### 23. Supplier Performance Tracking
- [ ] Track on-time delivery rate per supplier
- [ ] Monitor price trends per supplier
- [ ] Quality ratings and notes
- [ ] Identify best suppliers for each ingredient
- [ ] Generate supplier scorecards

---

## FUTURE PHASES (Not Started)

### Phase 4 - Multi-Location & Enterprise
- [ ] Multi-location support (see #18)
- [ ] Centralized reporting and analytics
- [ ] Location-specific inventory management
- [ ] Location-based staff management
- [ ] Consolidated P&L by location
- [ ] Inter-location transfers

### Phase 5 - Advanced Automation
- [ ] Automatic reorder suggestions based on usage
- [ ] Predictive inventory management
- [ ] AI-powered demand forecasting
- [ ] Automated pricing optimization
- [ ] Customer churn prediction
- [ ] Anomaly detection (unusual discounts, voids, etc.)

---

## Summary

**Total Items:** 23 major features + sub-tasks (Floor Plan completed)
**High Priority (5 features):** Z-reports, void/refund UI, QR generation, customer history, plate cost calculation
**Medium Priority (8 features):** Waitlist, profitability, segmentation, order history, status tracking, CSV export, dayparts, reason tracking
**Lower Priority (10 features):** SMS, email, waste tracking, multi-location, combos, labour, payments, notifications, recipe analysis, supplier tracking

**Recommended Implementation Order:**
1. Z-reports (quick win, high value)
2. Void/refund UI (high value, medium effort)
3. QR code generation (quick win)
4. Customer order history (quick win)
5. Plate cost calculation (quick win)
6. Waitlist (medium effort)
7. Profitability dashboard (medium effort)
8. Order history page (medium effort)
9. Timesheet export (quick win)



## Z-Reports Feature (Completed)
- [x] Add z_reports table to schema for storing daily summaries
- [x] Add z_report_items table for detailed breakdown by category/payment method
- [x] Create DB helpers for Z-report generation and retrieval
- [x] Build tRPC routers for Z-report endpoints
- [x] Create Z-Reports page with date picker and report list
- [x] Implement daily summary display (revenue, orders, discounts, voids)
- [x] Add payment breakdown (cash, card, split, etc.)
- [x] Add shift-by-shift summary view
- [x] Implement TXT export functionality
- [x] Add Z-report history with filtering and search
- [x] Write tests for Z-report procedures (10 tests, all passing)


## Void & Refund Management Feature (Completed)
- [x] Add voidReason enum to schema (customer_request, mistake, damage, comp, other)
- [x] Add refundMethod enum to schema (original_payment, store_credit, cash)
- [x] Add voidReason and refundMethod fields to orders table
- [x] Add voidApprovedBy and voidApprovedAt fields to orders table
- [x] Create void_audit_log table for tracking all void/refund changes
- [x] Create DB helpers for void/refund management
- [x] Build tRPC routers for void/refund endpoints
- [x] Create Void & Refund Management page
- [x] Implement pending voids/refunds list with filtering
- [x] Add void/refund detail modal with reason and method selection
- [x] Implement approval workflow (admin only)
- [x] Add audit trail display showing all void/refund history
- [x] Write tests for void/refund procedures (6 tests, all passing)


## Customer Order History Detail View (Completed)
- [x] Add DB helper to get customer with complete order history
- [x] Add DB helper to get loyalty points history
- [x] Build tRPC routers for customer detail endpoint
- [x] Create CustomerDetail page component
- [x] Display customer profile (name, phone, email, birthday, notes)
- [x] Display complete order history with dates, items, totals
- [x] Add order details modal showing items, modifiers, notes
- [x] Display loyalty points balance and history
- [x] Implement repeat order quick action
- [x] Link from Customers list to detail view
- [x] Write tests for customer detail procedures (7 tests, all passing)
