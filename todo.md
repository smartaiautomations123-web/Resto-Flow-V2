# RestoFlow - Restaurant Management Platform TODO

## Phase 1 - Core Features
- [x] Database schema design & migrations
- [x] POS & Order Flow (dine-in, takeaway, delivery, collection)
- [x] Kitchen Display System (KDS) with station routing & timers
- [x] Menu Management (categories, items, modifiers, combos, dayparts, pricing)
- [x] Basic Inventory & Recipe Costing (ingredients, recipes, stock deduction)
- [x] Staff Accounts & Permissions (roles, PIN login, role-based access)
- [x] Real-Time Sales & Reporting Dashboard
- [x] Payments (card, cash, split bill, tips, service charge)
- [x] Discounts, voids, comps with permission control

## Phase 2 - Back-Office & Automation
- [x] Advanced Inventory & Supplier Management
- [x] Cost & Profitability Engine (prime cost, food cost variance, P&L)
- [x] Smarter Labour Management (rota builder, overtime, availability)
- [x] Owner/Manager Web Dashboard (alerts, consolidated reports)

## Phase 3 - Customer, Channels & Experience
- [x] Online Ordering (branded web page, menu sync, online payments)
- [x] QR Code Table Ordering (order-at-table)
- [x] Reservations & Table Management (floor plan, waitlist)
- [x] CRM & Loyalty (customer profiles, points, campaigns)

## Infrastructure
- [x] Elegant dark theme with sophisticated design
- [x] Dashboard layout with sidebar navigation
- [x] Responsive design for tablet/mobile POS use
- [x] Vitest tests for core procedures

## Bugs
- [x] Fix SQL query error in getDailySales - DATE() function failing on orders table
- [x] Fix persistent getDailySales SQL error - GROUP BY alias mismatch with only_full_group_by mode

## Vendor Price Uploads Feature
- [x] Database schema: vendor_products, vendor_product_mappings, price_uploads, price_upload_items, price_history tables
- [x] Backend: PDF upload endpoint with S3 storage
- [x] Backend: LLM-powered PDF parsing to extract vendor product data
- [x] Backend: Vendor auto-detection from PDF header
- [x] Backend: Price normalization (pack size parsing, per-unit calculation)
- [x] Backend: Vendor code → internal ingredient mapping CRUD
- [x] Backend: Apply prices flow (update ingredient costPerUnit + price_history)
- [x] Frontend: Price Uploads page with upload, review, and apply workflow
- [x] Frontend: Vendor Product Catalog tab with mapping UI
- [x] Frontend: Price history view with trend indicators
- [x] Tests for price upload procedures

## Bugs (continued)
- [x] Fix OAuth callback error - {"error":"OAuth callback failed"} when signing in (ECONNRESET from stale DB connections, fixed with mysql2 connection pool)

## Dashboard Redesign
- [x] KPI cards: Today's Revenue, Orders Today, Staff On Duty, Low Stock Items with colored icons and sub-labels
- [x] Quick Actions grid: New Order, Check Inventory, Staff Schedule, View Reports
- [x] Alerts & Notifications section with Low Stock Alert and Shift Ending Soon
- [x] Staff On Duty section showing currently clocked-in staff
- [x] Low Stock Items section showing ingredients below minimum
- [x] Recent Orders table with Order ID, Location, Items, Total, Status
- [x] Dark theme styling matching existing app theme
