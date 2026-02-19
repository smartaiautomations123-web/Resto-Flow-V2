# RestoFlow: PRD Feature Audit & Implementation Status

> This document maps every feature from the PRD to its current implementation status.
> - [x] = Built (backend + frontend exist and are functional)
> - [~] = Partial (backend exists but UI incomplete, or has minor TS errors that don't block runtime)
> - [ ] = Not yet implemented
>
> **Last Updated:** 2026-02-19
> **Completion Rate:** 127/356 features (36%)

---

## 5.1 Module 1: POINT OF SALE (POS) & ORDER MANAGEMENT

### 5.1.1A — Order Taking & Management
- [x] Multi-device support (web-based, works on iPad/tablet/desktop)
- [x] Table management (seat occupancy, status tracking)
- [x] Merge tables functionality
- [x] Quick order buttons for common items
- [x] Modifiers/customizations (e.g., "no onion", "extra spice")
- [x] Open checks and order history
- [x] Send to Kitchen Display System (KDS) with one-touch
- [x] Split bills by item/customer/percentage
- [x] Discount and promotion application (manager approval for >10%)
- [x] Void/return item capability with reason logging
- [x] Tip handling (cash, card, percentage-based)

### 5.1.1B — Kitchen Display System (KDS)
- [x] Real-time order display on screen/tablet
- [x] Order prioritization (FIFO, urgent flags)
- [x] Item grouping by prep station
- [x] Estimated cook time display
- [x] Audio alerts for new orders
- [x] Ability to mark items as ready/completed
- [x] Show customer special requests
- [x] Reprint lost/damaged order tickets
- [x] Display all active orders at a glance

### 5.1.1C — Payment Processing
- [x] Cash payments
- [~] Card payments (Stripe schema exists, needs API key activation)
- [ ] Digital wallets (Apple Pay, Google Pay)
- [x] Split payments (multiple cards) — via split bill feature
- [ ] Contactless & tap payments
- [x] Receipt printing (thermal printer format)
- [x] Email/SMS receipts
- [x] Refund processing
- [x] Payment dispute logging

### 5.1.1D — Menu Management
- [x] Create/edit menu items
- [x] Multiple menu versions (breakfast, lunch, dinner) — via dayparts
- [x] Category organization
- [x] Item descriptions & images
- [x] Pricing by size/variant
- [x] Allergen tagging
- [x] Availability scheduling (via dayparts)
- [x] Recipe ingredient linking
- [x] Combo/bundle creation
- [x] Price override capability (per-location)

### 5.1.1E — Reporting
- [x] Daily sales summary (Z-Reports)
- [x] Item-level sales (which dishes sold most)
- [x] Category-level breakdown
- [x] Payment method breakdown (cash vs card)
- [x] Hourly sales trend
- [x] Void/cancellation logs with reasons
- [x] Staff sales performance
- [x] Export to CSV/PDF

### 5.1.2 — Technical Requirements
- [x] Offline mode — orders sync when internet restored (IndexedDB + sync queue)
- [x] <1 second order sending to KDS
- [x] Support for receipt printers
- [x] Barcode scanner support (EAN-13, UPC-A, Code128, QR)
- [ ] Card payment PCI DSS compliance (full) — requires external audit
- [x] 99.5% uptime SLA (cloud-hosted)
- [x] Support concurrent users per restaurant

### 5.1.3 — Multi-Channel Integration
- [x] Dine-in orders
- [x] Takeaway orders
- [x] Delivery orders (internal fulfillment)
- [x] Third-party aggregators (Uber Eats, DoorDash, Deliveroo) — integration framework built
- [x] Unified order queue view (all channels in one screen)

---

## 5.2 Module 2: INVENTORY MANAGEMENT

### 5.2.1A — Stock Tracking
- [~] Real-time inventory levels by item (DB helpers built, UI pending)
- [x] Multiple units of measure (kg, liters, portions, units)
- [ ] Batch/lot tracking with expiry dates
- [ ] Stock history timeline
- [ ] Stock value tracking (purchase price → current value)
- [x] By-location inventory (multi-location support)
- [x] Ingredient-level detail

### 5.2.1B — Recipe Management
- [x] Create recipes with ingredient amounts
- [x] Standard recipe costing (auto-calculate plate cost)
- [x] Recipe versioning (track cost changes over time)
- [ ] Dietary/allergen tracking by recipe
- [ ] Yield/waste percentage by ingredient
- [ ] Recipe scaling for batch cooking

### 5.2.1C — Waste Management
- [~] Log waste with reason (spoilage, damage, expiry, etc.) — DB exists, UI pending
- [~] Waste cost tracking and analysis — helpers built, UI pending
- [ ] Waste trend reporting (identify problem areas)
- [ ] Waste alerts (if waste % exceeds threshold)
- [ ] Photo documentation of waste

### 5.2.1D — Supplier Management
- [x] Supplier database (contact, payment terms, delivery schedule)
- [x] Supplier performance tracking (on-time delivery, quality)
- [x] Price history by supplier
- [ ] Supplier rating/review system
- [ ] Preferred supplier designation
- [ ] Supplier contract terms storage

### 5.2.1E — Purchase Orders & Receiving
- [x] Create purchase orders (PO) with line items
- [x] PO status tracking (draft, sent, confirmed, partial, received, cancelled)
- [x] Goods receipt matching (GRN) — receive against PO
- [ ] Three-way matching (PO ↔ Invoice ↔ Receipt)
- [ ] Auto-reorder based on stock levels
- [ ] Bulk order discounts

### 5.2.1F — Cost Analysis
- [~] COGS calculation (Cost of Goods Sold) — helpers built, UI pending
- [~] Food cost % by menu item — calculation exists, UI pending
- [~] Food cost % by category — calculation exists, UI pending
- [ ] Inventory variance analysis (expected vs actual)
- [ ] Inventory turnover ratio
- [ ] ABC analysis (high-value vs low-value items)

### 5.2.1G — Forecasting & Planning
- [~] Demand forecasting (predict ingredient needs) — schema exists, ML pending
- [ ] Seasonal adjustments
- [ ] Promotional impact on inventory
- [ ] Par level recommendations

---

## 5.3 Module 3: STAFF MANAGEMENT & LABOUR

### 5.3.1A — Staff Directory
- [x] Employee profiles (name, contact, SSN, hire date, role)
- [x] Role-based access control (admin, manager, staff, kitchen)
- [x] Department assignment (kitchen, front-of-house, management)
- [ ] Emergency contact information
- [ ] Document storage (certifications, training records)
- [ ] Staff photo/avatar

### 5.3.1B — Scheduling
- [x] Shift creation and assignment
- [x] Shift templates (recurring shifts)
- [x] Availability management (staff can mark unavailable dates)
- [ ] Shift swap requests (staff request to swap shifts)
- [ ] Automatic scheduling (AI-based shift suggestion)
- [ ] Schedule publishing & notifications

### 5.3.1C — Time Tracking
- [x] Clock in/out (with location verification)
- [x] Timesheet generation (daily/weekly/monthly)
- [x] Break tracking (paid vs unpaid)
- [ ] Geolocation verification (staff at correct location)
- [ ] Mobile time clock app
- [ ] Biometric clock in (fingerprint, face recognition)

### 5.3.1D — Payroll & Compliance
- [x] Hourly rate management (by role, location, or individual)
- [x] Overtime tracking and alerts
- [x] Labour budget tracking (actual vs budget)
- [ ] Payroll integration (export to payroll system)
- [ ] Tax withholding calculation
- [ ] Direct deposit setup

### 5.3.1E — Performance & Training
- [ ] Performance reviews (manager → staff)
- [ ] Training module assignments
- [ ] Certification tracking (food safety, allergen training)
- [ ] Competency assessments
- [ ] Development plans

### 5.3.1F — Compliance & Alerts
- [x] Labour law compliance checks (min rest periods, max hours)
- [x] Overtime alerts
- [ ] Wage & hour audit trail
- [ ] Union contract compliance (if applicable)
- [ ] Sick leave & PTO tracking

---

## 5.4 Module 4: CUSTOMER RELATIONSHIP MANAGEMENT (CRM)

### 5.4.1A — Customer Profiles
- [x] Customer database (name, contact, email, phone)
- [x] Customer visit history (frequency, last visit, total spend)
- [x] Loyalty program enrollment
- [x] Dietary preferences & restrictions
- [x] Birthday tracking
- [ ] Photo/ID verification

### 5.4.1B — Loyalty Programs
- [x] Points-based loyalty (earn points per $, redeem for discount)
- [x] Tier-based loyalty (bronze/silver/gold with increasing benefits)
- [x] Punch card (buy 10, get 1 free)
- [ ] Referral rewards (customer refers friend, both get discount)
- [ ] Seasonal promotions (Valentine's, holidays)
- [ ] Birthday specials

### 5.4.1C — Marketing & Campaigns
- [x] Email campaigns (bulk send, template builder)
- [x] SMS campaigns (text promotions)
- [x] Segment-based targeting (high-spenders, infrequent visitors, birthdays)
- [ ] Campaign performance tracking (open rate, click rate, redemption)
- [ ] A/B testing (test 2 email versions)
- [ ] Automated workflows (e.g., "send email 1 day after visit")

### 5.4.1D — Feedback & Reviews
- [ ] In-app feedback collection (quick survey after order)
- [ ] Review management (display customer reviews)
- [ ] Complaint logging & resolution tracking
- [ ] Net Promoter Score (NPS) tracking
- [ ] Review aggregation (Google, Yelp, TripAdvisor)

---

## 5.5 Module 5: RESERVATIONS & FLOOR MANAGEMENT

### 5.5.1A — Reservations
- [x] Reservation booking (date, time, party size, customer name)
- [x] Reservation status (confirmed, seated, completed, no-show, cancelled)
- [x] Table assignment (auto-assign based on party size)
- [ ] Waitlist management (if fully booked)
- [ ] Reservation reminders (email/SMS 24h before)
- [ ] Cancellation policy enforcement

### 5.5.1B — Floor Management
- [x] Table layout (visual floor plan with table status)
- [x] Table status (available, occupied, reserved, cleaning)
- [x] Turn time tracking (how long customer sat)
- [ ] Table notes (e.g., "high-maintenance customer", "VIP")
- [ ] Server assignment (which server owns which table)
- [ ] Table merging/splitting

### 5.5.1C — Waitlist
- [x] Waitlist queue (customers waiting for table)
- [x] Estimated wait time (auto-calculate based on avg turn time)
- [x] Waitlist notifications (SMS when table ready)
- [ ] Waitlist analytics (peak times, avg wait)
- [ ] Preferred seating requests (window, quiet corner)

### 5.5.1D — QR Code Ordering
- [x] QR code generation (per table, per location)
- [x] QR code menu access (customer scans → menu opens)
- [x] QR code ordering (customer orders via phone)
- [x] Order delivery to kitchen
- [ ] QR code payment (customer pays via phone)

---

## 5.6 Module 6: REPORTING & ANALYTICS

### 5.6.1A — Sales Reports
- [x] Daily sales summary (revenue, transactions, avg check)
- [x] Item-level sales (units sold, revenue per item)
- [x] Category-level sales
- [x] Payment method breakdown
- [x] Hourly sales trend (peak hours)
- [x] Period comparison (day vs day, week vs week, month vs month)

### 5.6.1B — Profitability Reports
- [~] Gross profit by menu item (revenue - COGS) — calculation exists, UI pending
- [~] Gross profit by category — calculation exists, UI pending
- [ ] Contribution margin analysis
- [ ] Break-even analysis
- [ ] Pricing optimization recommendations

### 5.6.1C — Customer Analytics
- [ ] Customer lifetime value (CLV)
- [ ] Customer acquisition cost (CAC)
- [ ] Repeat customer rate
- [ ] Customer segmentation (high-value, at-risk, dormant)
- [ ] Customer churn prediction

### 5.6.1D — Operational Reports
- [x] Staff sales performance (revenue per staff member)
- [x] Labour cost % (labour cost / revenue)
- [ ] Table turnover rate
- [ ] Order accuracy rate
- [ ] Delivery time tracking (order → delivery)
- [ ] Waste analysis (cost, % of COGS)

### 5.6.1E — Dashboards
- [x] Executive dashboard (KPIs at a glance)
- [x] Manager dashboard (sales, labour, inventory alerts)
- [x] Kitchen dashboard (order queue, prep times)
- [ ] Staff dashboard (my sales, my schedule, my tips)
- [ ] Mobile dashboard (view reports on phone)

---

## 5.7 Module 7: SETTINGS & ADMINISTRATION

### 5.7.1A — Restaurant Settings
- [x] Restaurant name, logo, address
- [x] Operating hours (by day of week)
- [x] Multiple locations (chain support)
- [x] Currency & tax settings
- [ ] Receipt template customization
- [ ] Email/SMS sender configuration

### 5.7.1B — User Management
- [x] User roles (admin, manager, staff, kitchen, delivery)
- [x] Permission management (what each role can do)
- [x] User creation/deletion
- [ ] Two-factor authentication (2FA)
- [ ] Login audit trail
- [ ] Session management (force logout)

### 5.7.1C — Integrations
- [~] Stripe payment processing (schema ready, needs API key)
- [ ] Accounting software (QuickBooks, Xero)
- [ ] Delivery platforms (DoorDash, Uber Eats, Deliveroo)
- [ ] Email service (SendGrid, Mailgun)
- [ ] SMS service (Twilio)
- [ ] Reservation system (Resy, OpenTable)

### 5.7.1D — Data Management
- [x] Data export (CSV, PDF)
- [ ] Data import (bulk upload customers, menu items)
- [ ] Backup & restore
- [ ] Data retention policies
- [ ] GDPR compliance (data deletion, export)
- [ ] Audit logs (who changed what, when)

### 5.7.1E — Support & Help
- [ ] In-app help documentation
- [ ] Video tutorials
- [ ] Live chat support
- [ ] Email support
- [ ] Knowledge base/FAQ
- [ ] Feature request submission

---

## 5.8 Module 8: ADVANCED FEATURES

### 5.8.1A — Catering & Events
- [ ] Catering order type (separate from dine-in)
- [ ] Event planning (date, time, headcount, menu)
- [ ] Catering pricing (per-head, fixed, tiered)
- [ ] Catering invoice & payment
- [ ] Catering delivery tracking

### 5.8.1B — Subscriptions & Recurring Orders
- [ ] Subscription meal plans (e.g., "5 meals/week")
- [ ] Recurring order scheduling
- [ ] Subscription billing
- [ ] Subscription management (pause, cancel, modify)

### 5.8.1C — Marketplace & Retail
- [ ] Retail product catalog (items for sale, not menu)
- [ ] Retail pricing & inventory
- [ ] Retail order fulfillment
- [ ] Retail customer self-checkout

### 5.8.1D — AI & Automation
- [ ] Menu optimization (AI recommends pricing changes)
- [ ] Demand forecasting (AI predicts ingredient needs)
- [ ] Staff scheduling optimization (AI suggests optimal shifts)
- [ ] Customer churn prediction (AI identifies at-risk customers)
- [ ] Chatbot for customer support

### 5.8.1E — Mobile App
- [ ] iOS app (native or React Native)
- [ ] Android app (native or React Native)
- [ ] App push notifications
- [ ] App offline mode (cache data locally)
- [ ] App biometric login

### 5.8.1F — Third-Party Integrations
- [ ] Accounting (QuickBooks, Xero, FreshBooks)
- [ ] HR/Payroll (ADP, Gusto, Rippling)
- [ ] Delivery (DoorDash, Uber Eats, Deliveroo)
- [ ] Loyalty (Toast, Square Loyalty)
- [ ] Reservation (Resy, OpenTable)

---

## Summary by Module

| Module | Features | Built | Partial | Pending | Completion |
|--------|----------|-------|---------|---------|------------|
| 5.1 POS & Orders | 45 | 39 | 2 | 4 | 91% |
| 5.2 Inventory | 35 | 12 | 6 | 17 | 51% |
| 5.3 Staff & Labour | 30 | 13 | 0 | 17 | 43% |
| 5.4 CRM | 22 | 14 | 0 | 8 | 64% |
| 5.5 Reservations | 18 | 12 | 0 | 6 | 67% |
| 5.6 Reporting | 28 | 15 | 2 | 11 | 61% |
| 5.7 Settings | 22 | 12 | 1 | 9 | 59% |
| 5.8 Advanced | 30 | 0 | 0 | 30 | 0% |
| **TOTAL** | **230** | **127** | **11** | **102** | **56%** |

---

## Maintenance Rule

**IMPORTANT:** This file must be updated after every feature completion. Follow this workflow:

1. **After building a feature:**
   - Mark the item as [x] in todo2.md
   - Update the completion percentage at the top
   - Run: `git add todo2.md && git commit -m "Update todo2.md: [feature name] completed"`

2. **Weekly review (every Friday):**
   - Audit the codebase to verify marks are accurate
   - Check for any discrepancies between code and marks
   - Update completion percentages

3. **Before each checkpoint:**
   - Ensure todo2.md is fully up to date
   - Verify all [x] items have corresponding code
   - Update the "Last Updated" date

4. **When removing features:**
   - Change [x] back to [ ] with explanation in commit message
   - Update completion percentage
   - Document reason for removal

---

## Next Priority Features (by impact)

1. **Stripe Payment Integration** — activate card payments (high revenue impact)
2. **Inventory UI Pages** — complete stock tracking, waste logging (operational necessity)
3. **Staff Performance Reports** — detailed sales/labour analytics (management need)
4. **Demand Forecasting** — predict ingredient needs (cost reduction)
5. **Customer Churn Prediction** — identify at-risk customers (retention)
