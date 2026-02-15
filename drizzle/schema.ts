import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, json } from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Staff ───────────────────────────────────────────────────────────
export const staff = mysqlTable("staff", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  pin: varchar("pin", { length: 10 }),
  role: mysqlEnum("role", ["owner", "manager", "server", "bartender", "kitchen"]).default("server").notNull(),
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Time Clock ──────────────────────────────────────────────────────
export const timeClock = mysqlTable("time_clock", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  clockIn: timestamp("clockIn").notNull(),
  clockOut: timestamp("clockOut"),
  breakMinutes: int("breakMinutes").default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Shifts / Schedules ─────────────────────────────────────────────
export const shifts = mysqlTable("shifts", {
  id: int("id").autoincrement().primaryKey(),
  staffId: int("staffId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM
  endTime: varchar("endTime", { length: 5 }).notNull(),
  role: varchar("role", { length: 32 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Menu Categories ─────────────────────────────────────────────────
export const menuCategories = mysqlTable("menu_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  sortOrder: int("sortOrder").default(0),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Menu Items ──────────────────────────────────────────────────────
export const menuItems = mysqlTable("menu_items", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0"),
  taxRate: decimal("taxRate", { precision: 5, scale: 2 }).default("0"),
  imageUrl: text("imageUrl"),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isPopular: boolean("isPopular").default(false).notNull(),
  prepTime: int("prepTime").default(10), // minutes
  station: mysqlEnum("station", ["grill", "fryer", "salad", "dessert", "bar", "general"]).default("general"),
  sortOrder: int("sortOrder").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Menu Modifiers ──────────────────────────────────────────────────
export const menuModifiers = mysqlTable("menu_modifiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  groupName: varchar("groupName", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Item-Modifier link ──────────────────────────────────────────────
export const itemModifiers = mysqlTable("item_modifiers", {
  id: int("id").autoincrement().primaryKey(),
  menuItemId: int("menuItemId").notNull(),
  modifierId: int("modifierId").notNull(),
});

// ─── Tables / Floor Plan ─────────────────────────────────────────────
export const tables = mysqlTable("tables", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  seats: int("seats").default(4),
  status: mysqlEnum("status", ["free", "occupied", "reserved", "cleaning"]).default("free").notNull(),
  positionX: int("positionX").default(0),
  positionY: int("positionY").default(0),
  section: varchar("section", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Orders ──────────────────────────────────────────────────────────
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull(),
  type: mysqlEnum("type", ["dine_in", "takeaway", "delivery", "collection", "online"]).default("dine_in").notNull(),
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served", "completed", "cancelled"]).default("pending").notNull(),
  tableId: int("tableId"),
  staffId: int("staffId"),
  customerId: int("customerId"),
  customerName: varchar("customerName", { length: 255 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).default("0"),
  taxAmount: decimal("taxAmount", { precision: 10, scale: 2 }).default("0"),
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).default("0"),
  serviceCharge: decimal("serviceCharge", { precision: 10, scale: 2 }).default("0"),
  tipAmount: decimal("tipAmount", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).default("0"),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "cash", "split", "online", "unpaid"]).default("unpaid"),
  paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "paid", "refunded", "partial"]).default("unpaid"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

// ─── Order Items ─────────────────────────────────────────────────────
export const orderItems = mysqlTable("order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  menuItemId: int("menuItemId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: decimal("unitPrice", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  modifiers: json("modifiers"), // [{name, price}]
  status: mysqlEnum("status", ["pending", "preparing", "ready", "served", "voided"]).default("pending").notNull(),
  station: varchar("station", { length: 32 }),
  notes: text("notes"),
  sentToKitchenAt: timestamp("sentToKitchenAt"),
  readyAt: timestamp("readyAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Ingredients ─────────────────────────────────────────────────────
export const ingredients = mysqlTable("ingredients", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  unit: varchar("unit", { length: 32 }).notNull(), // kg, L, pcs, etc.
  currentStock: decimal("currentStock", { precision: 10, scale: 3 }).default("0"),
  minStock: decimal("minStock", { precision: 10, scale: 3 }).default("0"),
  costPerUnit: decimal("costPerUnit", { precision: 10, scale: 4 }).default("0"),
  supplierId: int("supplierId"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Recipes (menu item → ingredient link) ──────────────────────────
export const recipes = mysqlTable("recipes", {
  id: int("id").autoincrement().primaryKey(),
  menuItemId: int("menuItemId").notNull(),
  ingredientId: int("ingredientId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
});

// ─── Suppliers ───────────────────────────────────────────────────────
export const suppliers = mysqlTable("suppliers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Purchase Orders ─────────────────────────────────────────────────
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").autoincrement().primaryKey(),
  supplierId: int("supplierId").notNull(),
  status: mysqlEnum("status", ["draft", "sent", "received", "cancelled"]).default("draft").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  orderedAt: timestamp("orderedAt"),
  receivedAt: timestamp("receivedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Purchase Order Items ────────────────────────────────────────────
export const purchaseOrderItems = mysqlTable("purchase_order_items", {
  id: int("id").autoincrement().primaryKey(),
  purchaseOrderId: int("purchaseOrderId").notNull(),
  ingredientId: int("ingredientId").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitCost: decimal("unitCost", { precision: 10, scale: 4 }).notNull(),
  totalCost: decimal("totalCost", { precision: 10, scale: 2 }).notNull(),
});

// ─── Customers ───────────────────────────────────────────────────────
export const customers = mysqlTable("customers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 32 }),
  loyaltyPoints: int("loyaltyPoints").default(0),
  totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0"),
  visitCount: int("visitCount").default(0),
  notes: text("notes"),
  birthday: varchar("birthday", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Reservations ────────────────────────────────────────────────────
export const reservations = mysqlTable("reservations", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId"),
  guestName: varchar("guestName", { length: 255 }).notNull(),
  guestPhone: varchar("guestPhone", { length: 32 }),
  guestEmail: varchar("guestEmail", { length: 320 }),
  tableId: int("tableId"),
  partySize: int("partySize").notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  time: varchar("time", { length: 5 }).notNull(),
  status: mysqlEnum("status", ["confirmed", "seated", "completed", "cancelled", "no_show"]).default("confirmed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Type exports ────────────────────────────────────────────────────
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = typeof staff.$inferInsert;
export type MenuCategory = typeof menuCategories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type MenuModifier = typeof menuModifiers.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Ingredient = typeof ingredients.$inferSelect;
export type Recipe = typeof recipes.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
