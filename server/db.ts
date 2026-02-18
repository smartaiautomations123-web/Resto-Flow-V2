import { eq, desc, asc, and, gte, lte, sql, isNull, ne, like, gt } from "drizzle-orm";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { or } from "drizzle-orm";
import {
  InsertUser, users,
  staff, timeClock, shifts,
  menuCategories, menuItems, menuModifiers, itemModifiers,
  sections, tables, orders, orderItems,
  ingredients, recipes,
  suppliers, purchaseOrders, purchaseOrderItems,
  customers, reservations, waitlist,
  vendorProducts, vendorProductMappings, priceUploads, priceUploadItems, priceHistory,
  zReports, zReportItems, zReportShifts,
  voidAuditLog, InsertVoidAuditLog,
  qrCodes, InsertQRCode,
  customerSegments, segmentMembers, campaigns, campaignRecipients,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: MySql2Database | null = null;

export async function getDb() {
  if (_db) return _db;

  const connection = await mysql.createPool({
    host: ENV.DATABASE_URL.split("@")[1].split(":")[0],
    port: parseInt(ENV.DATABASE_URL.split(":")[2].split("/")[0]),
    database: ENV.DATABASE_URL.split("/").pop(),
    user: ENV.DATABASE_URL.split("://")[1].split(":")[0],
    password: ENV.DATABASE_URL.split(":")[2].split("@")[0],
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  _db = drizzle(connection);
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────
export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(users).where(eq(users.openId, openId)).get();
}

export async function createUser(openId: string, name?: string, email?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(users).values({ openId, name, email }).returning();
}

// ─── Staff ────────────────────────────────────────────────────────────
export async function listStaff() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(staff).where(eq(staff.isActive, true)).orderBy(asc(staff.name));
}

export async function getStaffById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(staff).where(eq(staff.id, id)).get();
}

export async function createStaff(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(staff).values(data).returning();
}

export async function updateStaff(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staff).set(data).where(eq(staff.id, id)).returning();
}

export async function deleteStaff(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(staff).set({ isActive: false }).where(eq(staff.id, id)).returning();
}

export async function getStaffOnDuty() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(staff).where(and(eq(staff.isActive, true))).orderBy(asc(staff.name));
}

export async function getShiftsEndingSoon() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(shifts).orderBy(asc(shifts.endTime));
}

// ─── Time Clock ───────────────────────────────────────────────────────
export async function clockIn(staffId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(timeClock).values({ staffId, clockIn: new Date() }).returning();
}

export async function clockOut(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(timeClock).set({ clockOut: new Date() }).where(eq(timeClock.id, id)).returning();
}

export async function getActiveClockEntry(staffId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(timeClock).where(and(eq(timeClock.staffId, staffId), isNull(timeClock.clockOut))).get();
}

export async function listTimeEntries(staffId?: number, dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(timeClock);
  if (staffId) query = query.where(eq(timeClock.staffId, staffId));
  return query.orderBy(desc(timeClock.clockIn));
}

// ─── Menu Categories ──────────────────────────────────────────────────
export async function listMenuCategories() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuCategories).where(eq(menuCategories.isActive, true)).orderBy(asc(menuCategories.sortOrder));
}

export async function getMenuCategoryById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuCategories).where(eq(menuCategories.id, id)).get();
}

export async function createMenuCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(menuCategories).values(data).returning();
}

export async function updateMenuCategory(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuCategories).set(data).where(eq(menuCategories.id, id)).returning();
}

export async function deleteMenuCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuCategories).set({ isActive: false }).where(eq(menuCategories.id, id)).returning();
}

// ─── Menu Items ───────────────────────────────────────────────────────
export async function listMenuItems() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuItems).where(eq(menuItems.isActive, true)).orderBy(asc(menuItems.name));
}

export async function getMenuItemById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuItems).where(eq(menuItems.id, id)).get();
}

export async function getMenuItemsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuItems).where(and(eq(menuItems.categoryId, categoryId), eq(menuItems.isActive, true))).orderBy(asc(menuItems.sortOrder));
}

export async function createMenuItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(menuItems).values(data).returning();
}

export async function updateMenuItem(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuItems).set(data).where(eq(menuItems.id, id)).returning();
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuItems).set({ isActive: false }).where(eq(menuItems.id, id)).returning();
}

// ─── Menu Modifiers ───────────────────────────────────────────────────
export async function listMenuModifiers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuModifiers).where(eq(menuModifiers.isActive, true)).orderBy(asc(menuModifiers.name));
}

export async function getMenuModifierById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(menuModifiers).where(eq(menuModifiers.id, id)).get();
}

export async function createMenuModifier(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(menuModifiers).values(data).returning();
}

export async function updateMenuModifier(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuModifiers).set(data).where(eq(menuModifiers.id, id)).returning();
}

export async function deleteMenuModifier(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(menuModifiers).set({ isActive: false }).where(eq(menuModifiers.id, id)).returning();
}

export async function getItemModifiers(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(itemModifiers).where(eq(itemModifiers.menuItemId, itemId));
}

export async function addModifierToItem(menuItemId: number, modifierId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(itemModifiers).values({ menuItemId, modifierId }).returning();
}

export async function removeModifierFromItem(menuItemId: number, modifierId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(itemModifiers).where(and(eq(itemModifiers.menuItemId, menuItemId), eq(itemModifiers.modifierId, modifierId)));
}

// ─── Orders ───────────────────────────────────────────────────────────
export async function createOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orders).values(data).returning();
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orders).where(eq(orders.id, id)).get();
}

export async function updateOrder(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set(data).where(eq(orders.id, id)).returning();
}

export async function getOrdersByStatus(status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orders).where(eq(orders.status, status as any)).orderBy(desc(orders.createdAt));
}

export async function getOrdersByTable(tableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orders).where(and(eq(orders.tableId, tableId), ne(orders.status, "completed"))).orderBy(desc(orders.createdAt));
}

// ─── Order Items ──────────────────────────────────────────────────────
export async function addOrderItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(orderItems).values(data).returning();
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderItem(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orderItems).set(data).where(eq(orderItems.id, id)).returning();
}

export async function deleteOrderItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(orderItems).where(eq(orderItems.id, id));
}

// ─── Ingredients ──────────────────────────────────────────────────────
export async function listIngredients() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(ingredients).where(eq(ingredients.isActive, true)).orderBy(asc(ingredients.name));
}

export async function getIngredientById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(ingredients).where(eq(ingredients.id, id)).get();
}

export async function createIngredient(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(ingredients).values(data).returning();
}

export async function updateIngredient(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(ingredients).set(data).where(eq(ingredients.id, id)).returning();
}

export async function deleteIngredient(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(ingredients).set({ isActive: false }).where(eq(ingredients.id, id)).returning();
}

// ─── Recipes ──────────────────────────────────────────────────────────
export async function listRecipes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(recipes).where(eq(recipes.isActive, true)).orderBy(asc(recipes.name));
}

export async function getRecipeById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(recipes).where(eq(recipes.id, id)).get();
}

export async function getRecipesByMenuItem(menuItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(recipes).where(eq(recipes.menuItemId, menuItemId));
}

export async function createRecipe(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(recipes).values(data).returning();
}

export async function updateRecipe(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(recipes).set(data).where(eq(recipes.id, id)).returning();
}

export async function deleteRecipe(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(recipes).set({ isActive: false }).where(eq(recipes.id, id)).returning();
}

// ─── Customers ────────────────────────────────────────────────────────
export async function listCustomers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(customers).orderBy(asc(customers.name));
}

export async function getCustomerById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(customers).where(eq(customers.id, id)).get();
}

export async function getCustomerByPhone(phone: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(customers).where(eq(customers.phone, phone)).get();
}

export async function createCustomer(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customers).values(data).returning();
}

export async function updateCustomer(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customers).set(data).where(eq(customers.id, id)).returning();
}

export async function deleteCustomer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(customers).where(eq(customers.id, id));
}

// ─── Reservations ─────────────────────────────────────────────────────
export async function listReservations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(reservations).orderBy(desc(reservations.reservationTime));
}

export async function getReservationById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(reservations).where(eq(reservations.id, id)).get();
}

export async function createReservation(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(reservations).values(data).returning();
}

export async function updateReservation(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(reservations).set(data).where(eq(reservations.id, id)).returning();
}

export async function deleteReservation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(reservations).where(eq(reservations.id, id));
}

// ─── Tables ───────────────────────────────────────────────────────────
export async function listTables() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tables).where(eq(tables.isActive, true)).orderBy(asc(tables.name));
}

export async function getTableById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(tables).where(eq(tables.id, id)).get();
}

export async function createTable(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(tables).values(data).returning();
}

export async function updateTable(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tables).set(data).where(eq(tables.id, id)).returning();
}

export async function deleteTable(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tables).set({ isActive: false }).where(eq(tables.id, id)).returning();
}

// ─── Suppliers ────────────────────────────────────────────────────────
export async function listSuppliers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(suppliers).where(eq(suppliers.isActive, true)).orderBy(asc(suppliers.name));
}

export async function getSupplierById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(suppliers).where(eq(suppliers.id, id)).get();
}

export async function createSupplier(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(suppliers).values(data).returning();
}

export async function updateSupplier(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set(data).where(eq(suppliers.id, id)).returning();
}

export async function deleteSupplier(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(suppliers).set({ isActive: false }).where(eq(suppliers.id, id)).returning();
}

// ─── Purchase Orders ──────────────────────────────────────────────────
export async function listPurchaseOrders() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}

export async function getPurchaseOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(purchaseOrders).where(eq(purchaseOrders.id, id)).get();
}

export async function createPurchaseOrder(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(purchaseOrders).values(data).returning();
}

export async function updatePurchaseOrder(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id)).returning();
}

export async function getPurchaseOrderItems(poId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, poId));
}

export async function addPurchaseOrderItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(purchaseOrderItems).values(data).returning();
}

// ─── Vendor Products ──────────────────────────────────────────────────
export async function listVendorProducts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(vendorProducts).orderBy(asc(vendorProducts.name));
}

export async function getVendorProductById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(vendorProducts).where(eq(vendorProducts.id, id)).get();
}

export async function createVendorProduct(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(vendorProducts).values(data).returning();
}

export async function updateVendorProduct(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(vendorProducts).set(data).where(eq(vendorProducts.id, id)).returning();
}

export async function getVendorProductMappings(vendorProductId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(vendorProductMappings).where(eq(vendorProductMappings.vendorProductId, vendorProductId));
}

export async function createVendorProductMapping(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(vendorProductMappings).values(data).returning();
}

// ─── Price Uploads ────────────────────────────────────────────────────
export async function listPriceUploads() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(priceUploads).orderBy(desc(priceUploads.createdAt));
}

export async function getPriceUploadById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(priceUploads).where(eq(priceUploads.id, id)).get();
}

export async function createPriceUpload(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(priceUploads).values(data).returning();
}

export async function updatePriceUpload(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(priceUploads).set(data).where(eq(priceUploads.id, id)).returning();
}

export async function getPriceUploadItems(uploadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(priceUploadItems).where(eq(priceUploadItems.uploadId, uploadId));
}

export async function addPriceUploadItem(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(priceUploadItems).values(data).returning();
}

export async function listPriceHistory(vendorProductId: number, limit?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(priceHistory).where(eq(priceHistory.vendorProductId, vendorProductId)).orderBy(desc(priceHistory.createdAt)).limit(limit || 50);
}

export async function applyPriceUpload(uploadId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const items = await db.select().from(priceUploadItems).where(eq(priceUploadItems.uploadId, uploadId));
  for (const item of items) {
    await db.insert(priceHistory).values({ vendorProductId: item.vendorProductId, price: item.price });
  }
  return db.update(priceUploads).set({ status: "applied" }).where(eq(priceUploads.id, uploadId)).returning();
}

// ─── Z-Reports ────────────────────────────────────────────────────────
export async function generateZReport(date: string, staffId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dayOrders = await db.select().from(orders).where(and(
    gte(orders.createdAt, new Date(date)),
    lte(orders.createdAt, new Date(new Date(date).getTime() + 86400000))
  ));

  const totalRevenue = dayOrders.reduce((sum, o) => sum + (parseFloat(o.total as any) || 0), 0);
  const totalOrders = dayOrders.length;

  return db.insert(zReports).values({
    date,
    totalRevenue: totalRevenue.toString(),
    totalOrders,
    createdBy: staffId,
  }).returning();
}

export async function getZReportByDate(date: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(zReports).where(eq(zReports.date, date)).get();
}

export async function getZReportsByDateRange(startDate: string, endDate: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(zReports).where(and(
    gte(zReports.date, startDate),
    lte(zReports.date, endDate)
  )).orderBy(desc(zReports.date));
}

export async function getZReportDetails(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(zReportItems).where(eq(zReportItems.reportId, reportId));
}

// ─── Void & Refund Management ─────────────────────────────────────────
export async function getPendingVoids() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(orders).where(and(
    eq(orders.status, "voided"),
    isNull(orders.voidApprovedAt)
  )).orderBy(desc(orders.voidRequestedAt));
}

export async function approveVoid(orderId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(orders).set({
    voidApprovedBy: approvedBy,
    voidApprovedAt: new Date(),
  }).where(eq(orders.id, orderId)).returning();
}

export async function getVoidAuditLog(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(voidAuditLog).where(eq(voidAuditLog.orderId, orderId)).orderBy(desc(voidAuditLog.createdAt));
}

export async function addVoidAuditLog(data: InsertVoidAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(voidAuditLog).values(data).returning();
}

// ─── QR Codes ─────────────────────────────────────────────────────────
export async function listQRCodes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(qrCodes).orderBy(asc(qrCodes.tableId));
}

export async function getQRCodeByTable(tableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(qrCodes).where(eq(qrCodes.tableId, tableId)).get();
}

export async function createOrUpdateQRCode(tableId: number, qrUrl: string, qrSize: number, format: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getQRCodeByTable(tableId);
  if (existing) {
    return db.update(qrCodes).set({ qrUrl, qrSize, format }).where(eq(qrCodes.tableId, tableId)).returning();
  }
  return db.insert(qrCodes).values({ tableId, qrUrl, qrSize, format }).returning();
}

export async function deleteQRCode(tableId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(qrCodes).where(eq(qrCodes.tableId, tableId));
}

export async function generateQRCodeForAllTables() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const allTables = await db.select().from(tables).where(eq(tables.isActive, true));
  return allTables.map(t => ({ tableId: t.id, url: `/table/${t.id}` }));
}

// ─── Waitlist ─────────────────────────────────────────────────────────
export async function addToWaitlist(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(waitlist).values(data).returning();
}

export async function getWaitlistQueue() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(waitlist).where(eq(waitlist.status, "waiting")).orderBy(asc(waitlist.position));
}

export async function promoteFromWaitlist(guestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(waitlist).set({ status: "called" }).where(eq(waitlist.id, guestId)).returning();
}

export async function removeFromWaitlist(guestId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(waitlist).where(eq(waitlist.id, guestId));
}

export async function getWaitlistStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const waiting = await db.select({ count: sql<number>`COUNT(*)` }).from(waitlist).where(eq(waitlist.status, "waiting"));
  const called = await db.select({ count: sql<number>`COUNT(*)` }).from(waitlist).where(eq(waitlist.status, "called"));
  return { waiting: waiting[0]?.count || 0, called: called[0]?.count || 0 };
}

// ─── Customer Segmentation ────────────────────────────────────────────
export async function createSegment(name: string, description: string, color: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(customerSegments).values({ name, description, color }).returning();
}

export async function getSegments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(customerSegments).orderBy(asc(customerSegments.name));
}

export async function getSegmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(customerSegments).where(eq(customerSegments.id, id)).get();
}

export async function updateSegment(id: number, name: string, description: string, color: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(customerSegments).set({ name, description, color }).where(eq(customerSegments.id, id)).returning();
}

export async function getSegmentMemberCount(segmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({ count: sql<number>`COUNT(*)` }).from(segmentMembers).where(eq(segmentMembers.segmentId, segmentId));
  return result[0]?.count || 0;
}

export async function exportSegmentCustomers(segmentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select({
    id: customers.id,
    name: customers.name,
    email: customers.email,
    phone: customers.phone,
  }).from(segmentMembers).leftJoin(customers, eq(segmentMembers.customerId, customers.id)).where(eq(segmentMembers.segmentId, segmentId));
}

export async function createCampaign(name: string, type: string, content: string, segmentId?: number, subject?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(campaigns).values({ name, type, content, segmentId, subject }).returning();
}

export async function getCampaigns() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(campaigns).where(eq(campaigns.id, id)).get();
}

export async function getCampaignStats(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.select({
    pending: sql<number>`SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)`,
    sent: sql<number>`SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END)`,
    failed: sql<number>`SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END)`,
    opened: sql<number>`SUM(CASE WHEN opened = true THEN 1 ELSE 0 END)`,
    clicked: sql<number>`SUM(CASE WHEN clicked = true THEN 1 ELSE 0 END)`,
  }).from(campaignRecipients).where(eq(campaignRecipients.campaignId, campaignId));
  return result[0] || { pending: 0, sent: 0, failed: 0, opened: 0, clicked: 0 };
}

export async function getCampaignRecipients(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(campaignRecipients).where(eq(campaignRecipients.campaignId, campaignId));
}

export async function addCampaignRecipients(campaignId: number, customerIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const recipients = customerIds.map(customerId => ({ campaignId, customerId, status: "pending" }));
  return db.insert(campaignRecipients).values(recipients).returning();
}

export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(campaigns).where(eq(campaigns.id, id));
}

// ─── Cost Calculation ─────────────────────────────────────────────────
export async function calculateMenuItemCost(menuItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const itemRecipes = await db.select().from(recipes).where(eq(recipes.menuItemId, menuItemId));
  let totalCost = 0;

  for (const recipe of itemRecipes) {
    const ingredient = await db.select().from(ingredients).where(eq(ingredients.id, recipe.ingredientId)).get();
    if (ingredient) {
      const costPerUnit = parseFloat(ingredient.costPerUnit as any) || 0;
      const quantity = parseFloat(recipe.quantity as any) || 0;
      totalCost += costPerUnit * quantity;
    }
  }

  return totalCost;
}

export async function updateMenuItemCost(menuItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const cost = await calculateMenuItemCost(menuItemId);
  return db.update(menuItems).set({ cost: cost.toString() }).where(eq(menuItems.id, menuItemId)).returning();
}

export async function updateAllMenuItemCosts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const items = await db.select().from(menuItems);
  for (const item of items) {
    await updateMenuItemCost(item.id);
  }
  return { updated: items.length };
}

export async function getMenuItemCostAnalysis(menuItemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const item = await db.select().from(menuItems).where(eq(menuItems.id, menuItemId)).get();
  if (!item) return null;

  const itemRecipes = await db.select().from(recipes).where(eq(recipes.menuItemId, menuItemId));
  const recipeDetails = [];

  let totalCost = 0;
  for (const recipe of itemRecipes) {
    const ingredient = await db.select().from(ingredients).where(eq(ingredients.id, recipe.ingredientId)).get();
    if (ingredient) {
      const costPerUnit = parseFloat(ingredient.costPerUnit as any) || 0;
      const quantity = parseFloat(recipe.quantity as any) || 0;
      const recipeCost = costPerUnit * quantity;
      totalCost += recipeCost;
      recipeDetails.push({
        ingredientName: ingredient.name,
        quantity: quantity,
        unit: ingredient.unit,
        costPerUnit,
        totalCost: recipeCost,
      });
    }
  }

  const price = parseFloat(item.price as any) || 0;
  const margin = price - totalCost;
  const marginPercent = price > 0 ? (margin / price) * 100 : 0;

  return {
    menuItemId,
    itemName: item.name,
    price,
    cost: totalCost,
    margin,
    marginPercent,
    recipeDetails,
  };
}

// ─── Profitability Analysis ───────────────────────────────────────────
export async function getProfitabilityByItem(dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (dateFrom) conditions.push(gte(orders.createdAt, new Date(dateFrom)));
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(orders.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({
      itemName: menuItems.name,
      quantity: sql<number>`SUM(${orderItems.quantity})`,
      revenue: sql<number>`SUM(${orderItems.totalPrice})`,
      cost: sql<number>`SUM(${menuItems.cost} * ${orderItems.quantity})`,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .where(whereClause)
    .groupBy(orderItems.menuItemId);

  return result.map((r: any) => ({
    itemName: r.itemName,
    quantity: r.quantity || 0,
    revenue: r.revenue || 0,
    cost: r.cost || 0,
    profit: (r.revenue || 0) - (r.cost || 0),
    marginPercent: r.revenue ? (((r.revenue || 0) - (r.cost || 0)) / (r.revenue || 0)) * 100 : 0,
  }));
}

export async function getProfitabilityByCategory(dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (dateFrom) conditions.push(gte(orders.createdAt, new Date(dateFrom)));
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(orders.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({
      categoryName: menuCategories.name,
      quantity: sql<number>`SUM(${orderItems.quantity})`,
      revenue: sql<number>`SUM(${orderItems.totalPrice})`,
      cost: sql<number>`SUM(${menuItems.cost} * ${orderItems.quantity})`,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .leftJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .where(whereClause)
    .groupBy(menuItems.categoryId);

  return result.map((r: any) => ({
    categoryName: r.categoryName,
    quantity: r.quantity || 0,
    revenue: r.revenue || 0,
    cost: r.cost || 0,
    profit: (r.revenue || 0) - (r.cost || 0),
    marginPercent: r.revenue ? (((r.revenue || 0) - (r.cost || 0)) / (r.revenue || 0)) * 100 : 0,
  }));
}

export async function getTopProfitableItems(limit: number = 10, dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const items = await getProfitabilityByItem(dateFrom, dateTo);
  return items.sort((a: any, b: any) => b.profit - a.profit).slice(0, limit);
}

export async function getBottomProfitableItems(limit: number = 10, dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const items = await getProfitabilityByItem(dateFrom, dateTo);
  return items.sort((a: any, b: any) => a.profit - b.profit).slice(0, limit);
}

export async function getDailyProfitTrend(dateFrom: string, dateTo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`,
      revenue: sql<number>`SUM(${orders.total})`,
      cost: sql<number>`SUM(${orders.subtotal} * 0.3)`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, new Date(dateFrom)), lte(orders.createdAt, new Date(dateTo))))
    .groupBy(sql<string>`DATE(${orders.createdAt})`)
    .orderBy(asc(sql<string>`DATE(${orders.createdAt})`));

  return result.map((r: any) => ({
    date: r.date,
    revenue: r.revenue || 0,
    cost: r.cost || 0,
    profit: (r.revenue || 0) - (r.cost || 0),
    marginPercent: r.revenue ? (((r.revenue || 0) - (r.cost || 0)) / (r.revenue || 0)) * 100 : 0,
  }));
}

export async function getProfitabilitySummary(dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];
  if (dateFrom) conditions.push(gte(orders.createdAt, new Date(dateFrom)));
  if (dateTo) {
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(orders.createdAt, endDate));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({
      totalRevenue: sql<number>`SUM(${orders.total})`,
      totalCost: sql<number>`SUM(${orders.subtotal} * 0.3)`,
      totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
    })
    .from(orders)
    .where(whereClause);

  const row = result[0];
  const revenue = row?.totalRevenue || 0;
  const cost = row?.totalCost || 0;

  return {
    totalRevenue: revenue,
    totalCost: cost,
    grossProfit: revenue - cost,
    profitMarginPercent: revenue > 0 ? ((revenue - cost) / revenue) * 100 : 0,
    totalOrders: row?.totalOrders || 0,
  };
}

// ─── Customer Detail ──────────────────────────────────────────────────
export async function getCustomerWithOrderHistory(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const customer = await db.select().from(customers).where(eq(customers.id, customerId)).get();
  if (!customer) return null;

  const orderHistory = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(50);

  return { ...customer, orderHistory };
}

export async function getOrderWithItems(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      itemName: menuItems.name,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      notes: orderItems.notes,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items };
}

export async function getLoyaltyPointsHistory(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const customer = await db.select().from(customers).where(eq(customers.id, customerId)).get();
  if (!customer) return null;

  const orders_ = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.customerId, customerId), eq(orders.status, "completed")))
    .orderBy(desc(orders.createdAt));

  const pointsEarned = orders_.reduce((sum, o) => sum + Math.floor((parseFloat(o.total as any) || 0) / 10), 0);

  return {
    customerId,
    currentPoints: customer.loyaltyPoints || 0,
    pointsEarned,
    orderHistory: orders_,
  };
}

export async function createOrderFromCustomerOrder(customerId: number, sourceOrderId: number, newTableId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const sourceOrder = await db.select().from(orders).where(eq(orders.id, sourceOrderId)).get();
  if (!sourceOrder) throw new Error("Source order not found");

  const sourceItems = await db.select().from(orderItems).where(eq(orderItems.orderId, sourceOrderId));

  const newOrder = await db.insert(orders).values({
    orderNumber: `REPEAT-${Date.now()}`,
    type: sourceOrder.type,
    status: "pending",
    customerId,
    tableId: newTableId,
    subtotal: sourceOrder.subtotal,
    taxAmount: sourceOrder.taxAmount,
    total: sourceOrder.total,
  }).returning();

  for (const item of sourceItems) {
    await db.insert(orderItems).values({
      orderId: newOrder[0].id,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
    });
  }

  return newOrder[0];
}

// ─── Order History & Receipts ────────────────────────────────────────
export async function getOrderHistory(filters?: { dateFrom?: string; dateTo?: string; customerId?: number; status?: string; searchTerm?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions: any[] = [];

  if (filters?.dateFrom) {
    conditions.push(gte(orders.createdAt, new Date(filters.dateFrom)));
  }
  if (filters?.dateTo) {
    const endDate = new Date(filters.dateTo);
    endDate.setHours(23, 59, 59, 999);
    conditions.push(lte(orders.createdAt, endDate));
  }
  if (filters?.customerId) {
    conditions.push(eq(orders.customerId, filters.customerId));
  }
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.searchTerm) {
    const searchPattern = `%${filters.searchTerm}%`;
    conditions.push(
      or(
        like(orders.orderNumber, searchPattern),
        like(customers.name, searchPattern)
      )
    );
  }

  let query = db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerId: orders.customerId,
      customerName: customers.name,
      total: orders.total,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      discountAmount: orders.discountAmount,
      status: orders.status,
      type: orders.type,
      paymentMethod: orders.paymentMethod,
      createdAt: orders.createdAt,
      itemCount: sql<number>`COUNT(DISTINCT ${orderItems.id})`,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .groupBy(orders.id);

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  return query.orderBy(desc(orders.createdAt)).limit(500);
}

export async function getOrderDetailsForReceipt(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerId: orders.customerId,
      customerName: customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
      total: orders.total,
      subtotal: orders.subtotal,
      taxAmount: orders.taxAmount,
      discountAmount: orders.discountAmount,
      voidReason: orders.voidReason,
      status: orders.status,
      type: orders.type,
      paymentMethod: orders.paymentMethod,
      notes: orders.notes,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      staffName: staff.name,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(staff, eq(orders.staffId, staff.id))
    .where(eq(orders.id, orderId));

  if (!order[0]) return null;

  const items = await db
    .select({
      id: orderItems.id,
      itemName: menuItems.name,
      quantity: orderItems.quantity,
      unitPrice: orderItems.unitPrice,
      totalPrice: orderItems.totalPrice,
      notes: orderItems.notes,
    })
    .from(orderItems)
    .leftJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, orderId));

  return { ...order[0], items };
}

export async function searchOrders(searchTerm: string, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const searchPattern = `%${searchTerm}%`;
  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: customers.name,
      total: orders.total,
      createdAt: orders.createdAt,
      status: orders.status,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(
      or(
        like(orders.orderNumber, searchPattern),
        like(customers.name, searchPattern)
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

export async function getOrdersByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      total: orders.total,
      status: orders.status,
      type: orders.type,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(100);
}

export async function getOrdersByDateRange(dateFrom: string, dateTo: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const endDate = new Date(dateTo);
  endDate.setHours(23, 59, 59, 999);

  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: customers.name,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .leftJoin(customers, eq(orders.customerId, customers.id))
    .where(and(gte(orders.createdAt, new Date(dateFrom)), lte(orders.createdAt, endDate)))
    .orderBy(desc(orders.createdAt));
}

export async function getReceiptHistory(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      createdAt: orders.createdAt,
      total: orders.total,
      status: orders.status,
    })
    .from(orders)
    .where(eq(orders.id, orderId));
}

// ─── Sections & Floor Plan ────────────────────────────────────────────
export async function getSections() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(sections).where(eq(sections.isActive, true)).orderBy(asc(sections.sortOrder));
}

export async function createSection(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(sections).values(data).returning();
}

export async function updateSection(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sections).set(data).where(eq(sections.id, id)).returning();
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(sections).set({ isActive: false }).where(eq(sections.id, id)).returning();
}

export async function getTablesBySection(section?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(tables).where(eq(tables.isActive, true));
  if (section) {
    query = query.where(eq(tables.section, section));
  }
  return query.orderBy(asc(tables.name));
}

export async function updateTablePosition(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tables).set(data).where(eq(tables.id, id)).returning();
}

export async function updateTableStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.update(tables).set({ status }).where(eq(tables.id, id)).returning();
}

export async function getTableWithOrders(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const table = await db.select().from(tables).where(eq(tables.id, id)).get();
  if (!table) return null;

  const activeOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(and(eq(orders.tableId, id), ne(orders.status, "completed")))
    .orderBy(desc(orders.createdAt));

  return { ...table, activeOrders };
}

// ─── Receipt Generation ───────────────────────────────────────────────
export async function generateReceiptData(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const orderDetails = await getOrderDetailsForReceipt(orderId);
  if (!orderDetails) return null;

  return {
    orderNumber: orderDetails.orderNumber,
    customerName: orderDetails.customerName,
    customerEmail: orderDetails.customerEmail,
    customerPhone: orderDetails.customerPhone,
    total: orderDetails.total,
    subtotal: orderDetails.subtotal,
    taxAmount: orderDetails.taxAmount,
    discountAmount: orderDetails.discountAmount,
    status: orderDetails.status,
    type: orderDetails.type,
    paymentMethod: orderDetails.paymentMethod,
    notes: orderDetails.notes,
    createdAt: orderDetails.createdAt,
    completedAt: orderDetails.completedAt,
    staffName: orderDetails.staffName,
    items: orderDetails.items,
  };
}

export async function generateThermalReceiptFormat(orderId: number) {
  const receiptData = await generateReceiptData(orderId);
  if (!receiptData) return null;

  const lines: string[] = [];
  lines.push("================================");
  lines.push("RECEIPT".padStart(16));
  lines.push("================================");
  lines.push(`Order #: ${receiptData.orderNumber}`);
  lines.push(`Date: ${new Date(receiptData.createdAt).toLocaleString()}`);
  lines.push("");

  if (receiptData.customerName) {
    lines.push(`Customer: ${receiptData.customerName}`);
  }

  lines.push("--------------------------------");
  lines.push("ITEMS");
  lines.push("--------------------------------");

  for (const item of receiptData.items) {
    const itemLine = `${item.itemName.substring(0, 20)} x${item.quantity}`;
    const priceLine = `$${parseFloat(item.totalPrice as any).toFixed(2)}`;
    lines.push(itemLine.padEnd(25) + priceLine.padStart(7));
    if (item.notes) {
      lines.push(`  Note: ${item.notes}`);
    }
  }

  lines.push("--------------------------------");
  lines.push(`Subtotal: $${parseFloat(receiptData.subtotal as any).toFixed(2)}`.padEnd(25));
  if (receiptData.taxAmount) {
    lines.push(`Tax: $${parseFloat(receiptData.taxAmount as any).toFixed(2)}`.padEnd(25));
  }
  if (receiptData.discountAmount) {
    lines.push(`Discount: -$${parseFloat(receiptData.discountAmount as any).toFixed(2)}`.padEnd(25));
  }
  lines.push("================================");
  lines.push(`TOTAL: $${parseFloat(receiptData.total as any).toFixed(2)}`.padStart(20));
  lines.push("================================");
  lines.push(`Payment: ${receiptData.paymentMethod}`);
  lines.push(`Status: ${receiptData.status}`);
  lines.push("");
  lines.push("Thank you for your business!".padStart(16));
  lines.push("");

  return lines.join("\n");
}

export async function generatePDFReceiptHTML(orderId: number) {
  const receiptData = await generateReceiptData(orderId);
  if (!receiptData) return null;

  const itemsHTML = receiptData.items.map((item) => `<tr><td>${item.itemName}</td><td style="text-align: center;">${item.quantity}</td><td style="text-align: right;">$${parseFloat(item.unitPrice as any).toFixed(2)}</td><td style="text-align: right;">$${parseFloat(item.totalPrice as any).toFixed(2)}</td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt #${receiptData.orderNumber}</title><style>body{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px}.header{text-align:center;margin-bottom:20px;border-bottom:2px solid #333;padding-bottom:10px}.order-info{margin-bottom:20px}.order-info p{margin:5px 0}table{width:100%;border-collapse:collapse;margin-bottom:20px}th{text-align:left;border-bottom:1px solid #333;padding:10px 0}td{padding:8px 0}.totals{text-align:right;margin-bottom:20px;border-top:2px solid #333;padding-top:10px}.total-amount{font-size:1.5em;font-weight:bold}.footer{text-align:center;margin-top:20px;color:#666;font-size:0.9em}</style></head><body><div class="header"><h1>RECEIPT</h1><p>Order #${receiptData.orderNumber}</p><p>${new Date(receiptData.createdAt).toLocaleString()}</p></div><div class="order-info"><p><strong>Customer:</strong> ${receiptData.customerName || "N/A"}</p><p><strong>Type:</strong> ${receiptData.type}</p><p><strong>Status:</strong> ${receiptData.status}</p></div><table><thead><tr><th>Item</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit Price</th><th style="text-align:right;">Total</th></tr></thead><tbody>${itemsHTML}</tbody></table><div class="totals"><p>Subtotal: $${parseFloat(receiptData.subtotal as any).toFixed(2)}</p><p class="total-amount">Total: $${parseFloat(receiptData.total as any).toFixed(2)}</p><p>Payment Method: ${receiptData.paymentMethod}</p></div><div class="footer"><p>Thank you for your business!</p></div></body></html>`;
}

// ─── User Management ───────────────────────────────────────────────
export async function upsertUser(data: {
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  lastSignedIn: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(users).where(eq(users.openId, data.openId)).limit(1);

  if (existing.length > 0) {
    // Update existing user
    return await db
      .update(users)
      .set({
        name: data.name,
        email: data.email,
        loginMethod: data.loginMethod,
        lastSignedIn: data.lastSignedIn,
        updatedAt: new Date(),
      })
      .where(eq(users.openId, data.openId));
  } else {
    // Create new user
    return await db.insert(users).values({
      openId: data.openId,
      name: data.name,
      email: data.email,
      loginMethod: data.loginMethod,
      lastSignedIn: data.lastSignedIn,
    });
  }
}


// ─── Order Status Tracking ───────────────────────────────────────────
export async function getOrderByOrderNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      type: orders.type,
      total: orders.total,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
      customerId: orders.customerId,
    })
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1);

  return result[0] || null;
}

export async function getOrderStatusWithItems(orderNumber: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await getOrderByOrderNumber(orderNumber);
  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      itemName: menuItems.name,
      quantity: orderItems.quantity,
      status: orderItems.status,
      notes: orderItems.notes,
    })
    .from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .where(eq(orderItems.orderId, order.id));

  return {
    ...order,
    items,
  };
}

export async function calculateEstimatedTime(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || !order[0]) return null;

  const orderData = order[0];
  const createdAt = new Date(orderData.createdAt).getTime();
  const now = Date.now();
  const elapsedMs = now - createdAt;

  // Base time: 15 minutes per order
  const baseTimeMs = 15 * 60 * 1000;
  const estimatedTotalMs = baseTimeMs;
  const remainingMs = Math.max(0, estimatedTotalMs - elapsedMs);

  return {
    estimatedTotalMinutes: Math.ceil(estimatedTotalMs / 60000),
    elapsedMinutes: Math.ceil(elapsedMs / 60000),
    remainingMinutes: Math.ceil(remainingMs / 60000),
    percentComplete: Math.min(100, Math.round((elapsedMs / estimatedTotalMs) * 100)),
  };
}

export async function getOrderStatusTimeline(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || !order[0]) return null;

  const orderData = order[0];
  const createdAt = new Date(orderData.createdAt);
  const completedAt = orderData.completedAt ? new Date(orderData.completedAt) : null;

  const statuses = ["pending", "preparing", "ready", "completed"];
  const currentStatusIndex = statuses.indexOf(orderData.status);

  return {
    statuses: statuses.map((status, index) => ({
      name: status,
      completed: index < currentStatusIndex,
      current: index === currentStatusIndex,
      timestamp: index === statuses.length - 1 && completedAt ? completedAt : null,
    })),
    currentStatus: orderData.status,
    createdAt,
    completedAt,
  };
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status: newStatus,
    updatedAt: new Date(),
  };

  if (newStatus === "completed") {
    updateData.completedAt = new Date();
  }

  return await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

// ─── Push Notifications ───────────────────────────────────────────
export async function notifyOrderStatusChange(orderId: number, newStatus: string) {
  // This is a placeholder for push notification infrastructure
  // In production, this would integrate with a service like Firebase Cloud Messaging
  // or Web Push API to send notifications to customers
  
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || !order[0]) return null;

  const orderData = order[0];
  const customer = await db.select().from(customers).where(eq(customers.id, orderData.customerId)).limit(1);

  if (!customer || !customer[0]) return null;

  // Notification payload
  const notification = {
    orderId,
    orderNumber: orderData.orderNumber,
    status: newStatus,
    customerEmail: customer[0].email,
    customerPhone: customer[0].phone,
    timestamp: new Date(),
    message: `Your order ${orderData.orderNumber} is now ${newStatus}`,
  };

  // Log notification (in production, send via email/SMS/push service)
  console.log("[Notification]", notification);

  return notification;
}

export async function getOrderNotificationHistory(orderId: number) {
  // Placeholder for retrieving notification history
  // In production, this would query a notifications table
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order || !order[0]) return null;

  return {
    orderId,
    orderNumber: order[0].orderNumber,
    createdAt: order[0].createdAt,
    completedAt: order[0].completedAt,
    status: order[0].status,
  };
}

// ─── Timesheet & Payroll ───────────────────────────────────────────
export async function getTimesheetData(
  startDate: Date,
  endDate: Date,
  staffId?: number,
  role?: string
) {
  let query = db
    .select({
      staffId: shifts.staffId,
      staffName: staff.name,
      staffRole: staff.role,
      shiftDate: shifts.date,
      clockIn: shifts.clockIn,
      clockOut: shifts.clockOut,
      hoursWorked: shifts.hoursWorked,
      hourlyRate: shifts.hourlyRate,
      totalCost: shifts.totalCost,
    })
    .from(shifts)
    .innerJoin(staff, eq(shifts.staffId, staff.id))
    .where(
      and(
        gte(shifts.date, startDate),
        lte(shifts.date, endDate),
        eq(shifts.status, "completed")
      )
    );

  if (staffId) {
    query = query.where(eq(shifts.staffId, staffId));
  }

  if (role) {
    query = query.where(eq(staff.role, role));
  }

  return await query.orderBy(shifts.date, staff.name);
}

export async function calculateTimesheetSummary(
  startDate: Date,
  endDate: Date,
  staffId?: number,
  role?: string
) {
  const timesheetData = await getTimesheetData(startDate, endDate, staffId, role);

  const summary = {
    totalStaff: new Set(timesheetData.map((t) => t.staffId)).size,
    totalHours: timesheetData.reduce((sum, t) => sum + (t.hoursWorked || 0), 0),
    totalLabourCost: timesheetData.reduce((sum, t) => sum + (t.totalCost || 0), 0),
    averageHourlyRate:
      timesheetData.length > 0
        ? timesheetData.reduce((sum, t) => sum + (t.hourlyRate || 0), 0) /
          timesheetData.length
        : 0,
    entries: timesheetData,
  };

  return summary;
}

export async function generateTimesheetCSV(
  startDate: Date,
  endDate: Date,
  staffId?: number,
  role?: string
) {
  const summary = await calculateTimesheetSummary(startDate, endDate, staffId, role);

  // CSV Header
  const headers = [
    "Staff Name",
    "Role",
    "Date",
    "Clock In",
    "Clock Out",
    "Hours Worked",
    "Hourly Rate",
    "Total Cost",
  ];

  // CSV Rows
  const rows = summary.entries.map((entry) => [
    entry.staffName,
    entry.staffRole,
    entry.shiftDate.toISOString().split("T")[0],
    entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString() : "",
    entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() : "",
    entry.hoursWorked?.toFixed(2) || "0",
    entry.hourlyRate?.toFixed(2) || "0",
    entry.totalCost?.toFixed(2) || "0",
  ]);

  // Summary rows
  rows.push([]);
  rows.push(["SUMMARY"]);
  rows.push(["Total Staff", summary.totalStaff.toString()]);
  rows.push(["Total Hours", summary.totalHours.toFixed(2)]);
  rows.push(["Total Labour Cost", `$${summary.totalLabourCost.toFixed(2)}`]);
  rows.push(["Average Hourly Rate", `$${summary.averageHourlyRate.toFixed(2)}`]);

  // Build CSV string
  let csv = headers.join(",") + "\n";
  csv += rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

  return csv;
}

export async function getStaffTimesheetStats(staffId: number, startDate: Date, endDate: Date) {
  const data = await db
    .select({
      totalHours: shifts.hoursWorked,
      totalCost: shifts.totalCost,
      shiftCount: shifts.id,
    })
    .from(shifts)
    .where(
      and(
        eq(shifts.staffId, staffId),
        gte(shifts.date, startDate),
        lte(shifts.date, endDate),
        eq(shifts.status, "completed")
      )
    );

  return {
    totalShifts: data.length,
    totalHours: data.reduce((sum, d) => sum + (d.totalHours || 0), 0),
    totalLabourCost: data.reduce((sum, d) => sum + (d.totalCost || 0), 0),
    averageHoursPerShift: data.length > 0 ? data.reduce((sum, d) => sum + (d.totalHours || 0), 0) / data.length : 0,
  };
}
