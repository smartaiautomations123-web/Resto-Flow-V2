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
