import { eq, desc, asc, and, gte, lte, sql, isNull, ne, like } from "drizzle-orm";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  InsertUser, users,
  staff, timeClock, shifts,
  menuCategories, menuItems, menuModifiers, itemModifiers,
  sections, tables, orders, orderItems,
  ingredients, recipes,
  suppliers, purchaseOrders, purchaseOrderItems,
  customers, reservations,
  vendorProducts, vendorProductMappings, priceUploads, priceUploadItems, priceHistory,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: MySql2Database | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb(): Promise<MySql2Database> {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000,
      });
      _db = drizzle(_pool as any);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db!;
}

// ─── Users ───────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Staff ───────────────────────────────────────────────────────────
export async function listStaff() {
  const db = await getDb();
  return db.select().from(staff).orderBy(asc(staff.name));
}
export async function getStaffById(id: number) {
  const db = await getDb();
  const r = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
  return r[0];
}
export async function createStaff(data: typeof staff.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(staff).values(data);
  return { id: r[0].insertId };
}
export async function updateStaff(id: number, data: Partial<typeof staff.$inferInsert>) {
  const db = await getDb();
  await db.update(staff).set(data).where(eq(staff.id, id));
}
export async function deleteStaff(id: number) {
  const db = await getDb();
  await db.delete(staff).where(eq(staff.id, id));
}

// ─── Time Clock ──────────────────────────────────────────────────────
export async function clockIn(staffId: number) {
  const db = await getDb();
  const r = await db.insert(timeClock).values({ staffId, clockIn: new Date() });
  return { id: r[0].insertId };
}
export async function clockOut(id: number) {
  const db = await getDb();
  await db.update(timeClock).set({ clockOut: new Date() }).where(eq(timeClock.id, id));
}
export async function getActiveClockEntry(staffId: number) {
  const db = await getDb();
  const r = await db.select().from(timeClock).where(and(eq(timeClock.staffId, staffId), isNull(timeClock.clockOut))).limit(1);
  return r[0];
}
export async function listTimeEntries(staffId?: number, dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  const conditions = [];
  if (staffId) conditions.push(eq(timeClock.staffId, staffId));
  if (dateFrom) conditions.push(gte(timeClock.clockIn, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(timeClock.clockIn, new Date(dateTo)));
  return db.select().from(timeClock).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(timeClock.clockIn));
}

// ─── Staff On Duty ──────────────────────────────────────────────────
export async function getStaffOnDuty() {
  const db = await getDb();
  const rows = await db.select({
    id: timeClock.id,
    staffId: timeClock.staffId,
    staffName: staff.name,
    staffRole: staff.role,
    clockIn: timeClock.clockIn,
  }).from(timeClock)
    .innerJoin(staff, eq(timeClock.staffId, staff.id))
    .where(isNull(timeClock.clockOut))
    .orderBy(desc(timeClock.clockIn));
  return rows;
}

export async function getShiftsEndingSoon() {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const nowHH = String(now.getHours()).padStart(2, '0');
  const nowMM = String(now.getMinutes()).padStart(2, '0');
  const nowTime = `${nowHH}:${nowMM}`;
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const laterHH = String(twoHoursLater.getHours()).padStart(2, '0');
  const laterMM = String(twoHoursLater.getMinutes()).padStart(2, '0');
  const laterTime = `${laterHH}:${laterMM}`;
  const rows = await db.select({
    id: shifts.id,
    staffId: shifts.staffId,
    staffName: staff.name,
    endTime: shifts.endTime,
  }).from(shifts)
    .innerJoin(staff, eq(shifts.staffId, staff.id))
    .where(and(
      eq(shifts.date, today),
      gte(shifts.endTime, nowTime),
      lte(shifts.endTime, laterTime),
    ));
  return rows;
}

// ─── Shifts ──────────────────────────────────────────────────────────
export async function listShifts(dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  const conditions = [];
  if (dateFrom) conditions.push(gte(shifts.date, dateFrom));
  if (dateTo) conditions.push(lte(shifts.date, dateTo));
  return db.select().from(shifts).where(conditions.length ? and(...conditions) : undefined).orderBy(asc(shifts.date), asc(shifts.startTime));
}
export async function createShift(data: typeof shifts.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(shifts).values(data);
  return { id: r[0].insertId };
}
export async function updateShift(id: number, data: Partial<typeof shifts.$inferInsert>) {
  const db = await getDb();
  await db.update(shifts).set(data).where(eq(shifts.id, id));
}
export async function deleteShift(id: number) {
  const db = await getDb();
  await db.delete(shifts).where(eq(shifts.id, id));
}

// ─── Menu Categories ─────────────────────────────────────────────────
export async function listCategories() {
  const db = await getDb();
  return db.select().from(menuCategories).orderBy(asc(menuCategories.sortOrder));
}
export async function createCategory(data: typeof menuCategories.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(menuCategories).values(data);
  return { id: r[0].insertId };
}
export async function updateCategory(id: number, data: Partial<typeof menuCategories.$inferInsert>) {
  const db = await getDb();
  await db.update(menuCategories).set(data).where(eq(menuCategories.id, id));
}
export async function deleteCategory(id: number) {
  const db = await getDb();
  await db.delete(menuCategories).where(eq(menuCategories.id, id));
}

// ─── Menu Items ──────────────────────────────────────────────────────
export async function listMenuItems(categoryId?: number) {
  const db = await getDb();
  if (categoryId) return db.select().from(menuItems).where(eq(menuItems.categoryId, categoryId)).orderBy(asc(menuItems.sortOrder));
  return db.select().from(menuItems).orderBy(asc(menuItems.sortOrder));
}
export async function getMenuItem(id: number) {
  const db = await getDb();
  const r = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);
  return r[0];
}
export async function createMenuItem(data: typeof menuItems.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(menuItems).values(data);
  return { id: r[0].insertId };
}
export async function updateMenuItem(id: number, data: Partial<typeof menuItems.$inferInsert>) {
  const db = await getDb();
  await db.update(menuItems).set(data).where(eq(menuItems.id, id));
}
export async function deleteMenuItem(id: number) {
  const db = await getDb();
  await db.delete(menuItems).where(eq(menuItems.id, id));
}

// ─── Menu Modifiers ──────────────────────────────────────────────────
export async function listModifiers() {
  const db = await getDb();
  return db.select().from(menuModifiers).orderBy(asc(menuModifiers.name));
}
export async function createModifier(data: typeof menuModifiers.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(menuModifiers).values(data);
  return { id: r[0].insertId };
}
export async function updateModifier(id: number, data: Partial<typeof menuModifiers.$inferInsert>) {
  const db = await getDb();
  await db.update(menuModifiers).set(data).where(eq(menuModifiers.id, id));
}
export async function deleteModifier(id: number) {
  const db = await getDb();
  await db.delete(menuModifiers).where(eq(menuModifiers.id, id));
}

// ─── Item Modifiers ──────────────────────────────────────────────────
export async function getItemModifiers(menuItemId: number) {
  const db = await getDb();
  return db.select().from(itemModifiers).where(eq(itemModifiers.menuItemId, menuItemId));
}
export async function setItemModifiers(menuItemId: number, modifierIds: number[]) {
  const db = await getDb();
  await db.delete(itemModifiers).where(eq(itemModifiers.menuItemId, menuItemId));
  if (modifierIds.length > 0) {
    await db.insert(itemModifiers).values(modifierIds.map(modifierId => ({ menuItemId, modifierId })));
  }
}

// ─── Tables ──────────────────────────────────────────────────────────
export async function listTables() {
  const db = await getDb();
  return db.select().from(tables).orderBy(asc(tables.name));
}
export async function createTable(data: typeof tables.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(tables).values(data);
  return { id: r[0].insertId };
}
export async function updateTable(id: number, data: Partial<typeof tables.$inferInsert>) {
  const db = await getDb();
  await db.update(tables).set(data).where(eq(tables.id, id));
}
export async function deleteTable(id: number) {
  const db = await getDb();
  await db.delete(tables).where(eq(tables.id, id));
}

// ─── Orders ──────────────────────────────────────────────────────────
export async function listOrders(status?: string, type?: string, dateFrom?: string, dateTo?: string) {
  const db = await getDb();
  const conditions = [];
  if (status) conditions.push(eq(orders.status, status as any));
  if (type) conditions.push(eq(orders.type, type as any));
  if (dateFrom) conditions.push(gte(orders.createdAt, new Date(dateFrom)));
  if (dateTo) conditions.push(lte(orders.createdAt, new Date(dateTo)));
  return db.select().from(orders).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(orders.createdAt)).limit(200);
}
export async function getOrder(id: number) {
  const db = await getDb();
  const r = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return r[0];
}
export async function createOrder(data: typeof orders.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(orders).values(data);
  return { id: r[0].insertId };
}
export async function updateOrder(id: number, data: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ─── Order Items ─────────────────────────────────────────────────────
export async function listOrderItems(orderId: number) {
  const db = await getDb();
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).orderBy(asc(orderItems.createdAt));
}
export async function createOrderItem(data: typeof orderItems.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(orderItems).values(data);
  return { id: r[0].insertId };
}
export async function updateOrderItem(id: number, data: Partial<typeof orderItems.$inferInsert>) {
  const db = await getDb();
  await db.update(orderItems).set(data).where(eq(orderItems.id, id));
}

// ─── KDS: get active order items grouped by station ──────────────────
export async function getKDSItems() {
  const db = await getDb();
  return db.select().from(orderItems)
    .where(
      and(
        sql`${orderItems.status} IN ('pending', 'preparing')`,
      )
    )
    .orderBy(asc(orderItems.createdAt));
}

// ─── Ingredients ─────────────────────────────────────────────────────
export async function listIngredients() {
  const db = await getDb();
  return db.select().from(ingredients).orderBy(asc(ingredients.name));
}
export async function getIngredient(id: number) {
  const db = await getDb();
  const r = await db.select().from(ingredients).where(eq(ingredients.id, id)).limit(1);
  return r[0];
}
export async function createIngredient(data: typeof ingredients.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(ingredients).values(data);
  return { id: r[0].insertId };
}
export async function updateIngredient(id: number, data: Partial<typeof ingredients.$inferInsert>) {
  const db = await getDb();
  await db.update(ingredients).set(data).where(eq(ingredients.id, id));
}
export async function deleteIngredient(id: number) {
  const db = await getDb();
  await db.delete(ingredients).where(eq(ingredients.id, id));
}
export async function getLowStockIngredients() {
  const db = await getDb();
  return db.select().from(ingredients).where(sql`${ingredients.currentStock} <= ${ingredients.minStock} AND ${ingredients.isActive} = true`).orderBy(asc(ingredients.name));
}

// ─── Recipes ─────────────────────────────────────────────────────────
export async function getRecipesForItem(menuItemId: number) {
  const db = await getDb();
  return db.select().from(recipes).where(eq(recipes.menuItemId, menuItemId));
}
export async function setRecipes(menuItemId: number, items: { ingredientId: number; quantity: string }[]) {
  const db = await getDb();
  await db.delete(recipes).where(eq(recipes.menuItemId, menuItemId));
  if (items.length > 0) {
    await db.insert(recipes).values(items.map(i => ({ menuItemId, ingredientId: i.ingredientId, quantity: i.quantity })));
  }
}

// ─── Stock deduction on order completion ─────────────────────────────
export async function deductStockForOrder(orderId: number) {
  const db = await getDb();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  for (const item of items) {
    const recipeItems = await db.select().from(recipes).where(eq(recipes.menuItemId, item.menuItemId));
    for (const ri of recipeItems) {
      const usedQty = Number(ri.quantity) * item.quantity;
      await db.update(ingredients)
        .set({ currentStock: sql`GREATEST(0, ${ingredients.currentStock} - ${usedQty})` })
        .where(eq(ingredients.id, ri.ingredientId));
    }
  }
}

// ─── Suppliers ───────────────────────────────────────────────────────
export async function listSuppliers() {
  const db = await getDb();
  return db.select().from(suppliers).orderBy(asc(suppliers.name));
}
export async function getSupplier(id: number) {
  const db = await getDb();
  const r = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
  return r[0];
}
export async function createSupplier(data: typeof suppliers.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(suppliers).values(data);
  return { id: r[0].insertId };
}
export async function updateSupplier(id: number, data: Partial<typeof suppliers.$inferInsert>) {
  const db = await getDb();
  await db.update(suppliers).set(data).where(eq(suppliers.id, id));
}
export async function deleteSupplier(id: number) {
  const db = await getDb();
  await db.delete(suppliers).where(eq(suppliers.id, id));
}

// ─── Purchase Orders ─────────────────────────────────────────────────
export async function listPurchaseOrders(supplierId?: number) {
  const db = await getDb();
  if (supplierId) return db.select().from(purchaseOrders).where(eq(purchaseOrders.supplierId, supplierId)).orderBy(desc(purchaseOrders.createdAt));
  return db.select().from(purchaseOrders).orderBy(desc(purchaseOrders.createdAt));
}
export async function createPurchaseOrder(data: typeof purchaseOrders.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(purchaseOrders).values(data);
  return { id: r[0].insertId };
}
export async function updatePurchaseOrder(id: number, data: Partial<typeof purchaseOrders.$inferInsert>) {
  const db = await getDb();
  await db.update(purchaseOrders).set(data).where(eq(purchaseOrders.id, id));
}
export async function listPurchaseOrderItems(poId: number) {
  const db = await getDb();
  return db.select().from(purchaseOrderItems).where(eq(purchaseOrderItems.purchaseOrderId, poId));
}
export async function createPurchaseOrderItem(data: typeof purchaseOrderItems.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(purchaseOrderItems).values(data);
  return { id: r[0].insertId };
}

// ─── Customers ───────────────────────────────────────────────────────
export async function listCustomers(search?: string) {
  const db = await getDb();
  if (search) return db.select().from(customers).where(like(customers.name, `%${search}%`)).orderBy(desc(customers.totalSpent)).limit(100);
  return db.select().from(customers).orderBy(desc(customers.totalSpent)).limit(100);
}
export async function getCustomer(id: number) {
  const db = await getDb();
  const r = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
  return r[0];
}
export async function createCustomer(data: typeof customers.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(customers).values(data);
  return { id: r[0].insertId };
}
export async function updateCustomer(id: number, data: Partial<typeof customers.$inferInsert>) {
  const db = await getDb();
  await db.update(customers).set(data).where(eq(customers.id, id));
}
export async function addLoyaltyPoints(customerId: number, points: number) {
  const db = await getDb();
  await db.update(customers).set({ loyaltyPoints: sql`${customers.loyaltyPoints} + ${points}` }).where(eq(customers.id, customerId));
}

// ─── Reservations ────────────────────────────────────────────────────
export async function listReservations(date?: string) {
  const db = await getDb();
  if (date) return db.select().from(reservations).where(eq(reservations.date, date)).orderBy(asc(reservations.time));
  return db.select().from(reservations).orderBy(desc(reservations.date), asc(reservations.time)).limit(100);
}
export async function createReservation(data: typeof reservations.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(reservations).values(data);
  return { id: r[0].insertId };
}
export async function updateReservation(id: number, data: Partial<typeof reservations.$inferInsert>) {
  const db = await getDb();
  await db.update(reservations).set(data).where(eq(reservations.id, id));
}

// ─── Reporting helpers ───────────────────────────────────────────────
export async function getSalesStats(dateFrom: string, dateTo: string) {
  const db = await getDb();
  const result = await db.select({
    totalRevenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`.as('total_revenue'),
    totalOrders: sql<number>`COUNT(*)`.as('total_orders'),
    avgTicket: sql<string>`COALESCE(AVG(${orders.total}), 0)`.as('avg_ticket'),
  }).from(orders).where(and(
    gte(orders.createdAt, new Date(dateFrom)),
    lte(orders.createdAt, new Date(dateTo)),
    sql`${orders.status} != 'cancelled'`
  ));
  return result[0];
}

export async function getSalesByCategory(dateFrom: string, dateTo: string) {
  const db = await getDb();
  return db.select({
    categoryId: menuItems.categoryId,
    categoryName: menuCategories.name,
    totalSales: sql<string>`COALESCE(SUM(${orderItems.totalPrice}), 0)`.as('total_sales'),
    itemCount: sql<number>`COUNT(${orderItems.id})`.as('item_count'),
  }).from(orderItems)
    .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
    .innerJoin(menuCategories, eq(menuItems.categoryId, menuCategories.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(
      gte(orders.createdAt, new Date(dateFrom)),
      lte(orders.createdAt, new Date(dateTo)),
      sql`${orders.status} != 'cancelled'`
    ))
    .groupBy(menuItems.categoryId, menuCategories.name);
}

export async function getTopSellingItems(dateFrom: string, dateTo: string, limit = 10) {
  const db = await getDb();
  const totalQtyExpr = sql<number>`SUM(${orderItems.quantity})`;
  return db.select({
    menuItemId: orderItems.menuItemId,
    name: orderItems.name,
    totalQty: totalQtyExpr.as('total_qty'),
    totalRevenue: sql<string>`SUM(${orderItems.totalPrice})`.as('total_revenue'),
  }).from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(
      gte(orders.createdAt, new Date(dateFrom)),
      lte(orders.createdAt, new Date(dateTo)),
      sql`${orders.status} != 'cancelled'`
    ))
    .groupBy(orderItems.menuItemId, orderItems.name)
    .orderBy(sql`total_qty DESC`)
    .limit(limit);
}

export async function getDailySales(dateFrom: string, dateTo: string) {
  const db = await getDb();
  const rows = await db.execute(sql`
    SELECT
      DATE(createdAt) AS order_date,
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS order_count
    FROM orders
    WHERE createdAt >= ${new Date(dateFrom)}
      AND createdAt <= ${new Date(dateTo)}
      AND status != 'cancelled'
    GROUP BY order_date
    ORDER BY order_date
  `);
  return (rows[0] as unknown as any[]).map((r: any) => ({
    date: r.order_date,
    revenue: String(r.revenue),
    orderCount: Number(r.order_count),
  }));
}

export async function getLabourCosts(dateFrom: string, dateTo: string) {
  const db = await getDb();
  return db.select({
    staffId: timeClock.staffId,
    staffName: staff.name,
    totalHours: sql<string>`COALESCE(SUM(TIMESTAMPDIFF(MINUTE, ${timeClock.clockIn}, COALESCE(${timeClock.clockOut}, NOW())) / 60.0), 0)`.as('total_hours'),
    hourlyRate: staff.hourlyRate,
  }).from(timeClock)
    .innerJoin(staff, eq(timeClock.staffId, staff.id))
    .where(and(
      gte(timeClock.clockIn, new Date(dateFrom)),
      lte(timeClock.clockIn, new Date(dateTo)),
    ))
    .groupBy(timeClock.staffId, staff.name, staff.hourlyRate);
}

export async function getOrdersByType(dateFrom: string, dateTo: string) {
  const db = await getDb();
  return db.select({
    type: orders.type,
    count: sql<number>`COUNT(*)`.as('order_count'),
    revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`.as('revenue'),
  }).from(orders)
    .where(and(
      gte(orders.createdAt, new Date(dateFrom)),
      lte(orders.createdAt, new Date(dateTo)),
      sql`${orders.status} != 'cancelled'`
    ))
    .groupBy(orders.type);
}

// ─── Vendor Products ────────────────────────────────────────────────
export async function listVendorProducts(supplierId?: number) {
  const db = await getDb();
  if (supplierId) return db.select().from(vendorProducts).where(eq(vendorProducts.supplierId, supplierId)).orderBy(asc(vendorProducts.description));
  return db.select().from(vendorProducts).orderBy(asc(vendorProducts.description));
}
export async function getVendorProduct(id: number) {
  const db = await getDb();
  const r = await db.select().from(vendorProducts).where(eq(vendorProducts.id, id)).limit(1);
  return r[0];
}
export async function getVendorProductByCode(supplierId: number, vendorCode: string) {
  const db = await getDb();
  const r = await db.select().from(vendorProducts).where(and(eq(vendorProducts.supplierId, supplierId), eq(vendorProducts.vendorCode, vendorCode))).limit(1);
  return r[0];
}
export async function createVendorProduct(data: typeof vendorProducts.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(vendorProducts).values(data);
  return { id: r[0].insertId };
}
export async function updateVendorProduct(id: number, data: Partial<typeof vendorProducts.$inferInsert>) {
  const db = await getDb();
  await db.update(vendorProducts).set(data).where(eq(vendorProducts.id, id));
}

// ─── Vendor Product Mappings ────────────────────────────────────────
export async function listVendorProductMappings(supplierId?: number) {
  const db = await getDb();
  if (supplierId) {
    return db.select({
      id: vendorProductMappings.id,
      vendorProductId: vendorProductMappings.vendorProductId,
      ingredientId: vendorProductMappings.ingredientId,
      createdAt: vendorProductMappings.createdAt,
    }).from(vendorProductMappings)
      .innerJoin(vendorProducts, eq(vendorProductMappings.vendorProductId, vendorProducts.id))
      .where(eq(vendorProducts.supplierId, supplierId));
  }
  return db.select().from(vendorProductMappings);
}
export async function createVendorProductMapping(vendorProductId: number, ingredientId: number) {
  const db = await getDb();
  // Remove existing mapping for this vendor product
  await db.delete(vendorProductMappings).where(eq(vendorProductMappings.vendorProductId, vendorProductId));
  const r = await db.insert(vendorProductMappings).values({ vendorProductId, ingredientId });
  return { id: r[0].insertId };
}
export async function deleteVendorProductMapping(id: number) {
  const db = await getDb();
  await db.delete(vendorProductMappings).where(eq(vendorProductMappings.id, id));
}
export async function getMappingForVendorProduct(vendorProductId: number) {
  const db = await getDb();
  const r = await db.select().from(vendorProductMappings).where(eq(vendorProductMappings.vendorProductId, vendorProductId)).limit(1);
  return r[0];
}

// ─── Price Uploads ──────────────────────────────────────────────────
export async function listPriceUploads(supplierId?: number) {
  const db = await getDb();
  if (supplierId) return db.select().from(priceUploads).where(eq(priceUploads.supplierId, supplierId)).orderBy(desc(priceUploads.createdAt));
  return db.select().from(priceUploads).orderBy(desc(priceUploads.createdAt));
}
export async function getPriceUpload(id: number) {
  const db = await getDb();
  const r = await db.select().from(priceUploads).where(eq(priceUploads.id, id)).limit(1);
  return r[0];
}
export async function createPriceUpload(data: typeof priceUploads.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(priceUploads).values(data);
  return { id: r[0].insertId };
}
export async function updatePriceUpload(id: number, data: Partial<typeof priceUploads.$inferInsert>) {
  const db = await getDb();
  await db.update(priceUploads).set(data).where(eq(priceUploads.id, id));
}

// ─── Price Upload Items ─────────────────────────────────────────────
export async function listPriceUploadItems(uploadId: number) {
  const db = await getDb();
  return db.select().from(priceUploadItems).where(eq(priceUploadItems.uploadId, uploadId)).orderBy(asc(priceUploadItems.description));
}
export async function createPriceUploadItem(data: typeof priceUploadItems.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(priceUploadItems).values(data);
  return { id: r[0].insertId };
}
export async function bulkCreatePriceUploadItems(items: (typeof priceUploadItems.$inferInsert)[]) {
  const db = await getDb();
  if (items.length === 0) return;
  // Insert in batches of 50 to avoid query size limits
  for (let i = 0; i < items.length; i += 50) {
    const batch = items.slice(i, i + 50);
    await db.insert(priceUploadItems).values(batch);
  }
}

// ─── Price History ──────────────────────────────────────────────────
export async function listPriceHistory(vendorProductId: number, limit = 52) {
  const db = await getDb();
  return db.select().from(priceHistory).where(eq(priceHistory.vendorProductId, vendorProductId)).orderBy(desc(priceHistory.recordedAt)).limit(limit);
}
export async function createPriceHistoryRecord(data: typeof priceHistory.$inferInsert) {
  const db = await getDb();
  const r = await db.insert(priceHistory).values(data);
  return { id: r[0].insertId };
}

// ─── Apply Price Upload (update vendor products + ingredient costs) ─
export async function applyPriceUpload(uploadId: number) {
  const db = await getDb();
  const upload = await getPriceUpload(uploadId);
  if (!upload) throw new Error("Upload not found");
  
  const items = await listPriceUploadItems(uploadId);
  let priceChanges = 0;
  let newItems = 0;
  
  for (const item of items) {
    // Find or create vendor product
    let vp = await getVendorProductByCode(upload.supplierId, item.vendorCode);
    if (!vp) {
      const created = await createVendorProduct({
        supplierId: upload.supplierId,
        vendorCode: item.vendorCode,
        description: item.description as string,
        packSize: item.packSize,
        currentCasePrice: item.casePrice || "0",
        currentUnitPrice: item.calculatedUnitPrice || item.unitPrice || "0",
        lastUpdated: new Date(),
      });
      vp = await getVendorProduct(created.id);
      newItems++;
    } else {
      // Check if price changed
      if (Number(vp.currentCasePrice) !== Number(item.casePrice)) {
        priceChanges++;
      }
      await updateVendorProduct(vp.id, {
        description: item.description as string,
        packSize: item.packSize,
        currentCasePrice: item.casePrice || "0",
        currentUnitPrice: item.calculatedUnitPrice || item.unitPrice || "0",
        lastUpdated: new Date(),
      });
    }
    
    // Record price history
    await createPriceHistoryRecord({
      vendorProductId: vp!.id,
      uploadId,
      casePrice: item.casePrice || "0",
      unitPrice: item.calculatedUnitPrice || item.unitPrice || "0",
    });
    
    // Update mapped ingredient cost if mapping exists
    const mapping = await getMappingForVendorProduct(vp!.id);
    if (mapping) {
      const unitCost = item.calculatedUnitPrice || item.unitPrice || item.casePrice || "0";
      await updateIngredient(mapping.ingredientId, { costPerUnit: unitCost });
    }
  }
  
  await updatePriceUpload(uploadId, {
    status: "applied",
    totalItems: items.length,
    newItems,
    priceChanges,
  });
  
  return { totalItems: items.length, newItems, priceChanges };
}


// ─── Floor Plan - Sections ───────────────────────────────────────────
export async function getSections() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sections).where(eq(sections.isActive, true)).orderBy(asc(sections.sortOrder));
}

export async function createSection(data: { name: string; description?: string; sortOrder?: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sections).values(data);
  return { id: Number(result[0].insertId), ...data };
}

export async function updateSection(id: number, data: Partial<{ name: string; description: string; sortOrder: number; isActive: boolean }>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(sections).set(data).where(eq(sections.id, id));
}

export async function deleteSection(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(sections).set({ isActive: false }).where(eq(sections.id, id));
}

// ─── Floor Plan - Tables ─────────────────────────────────────────────
export async function getTablesBySection(sectionName?: string) {
  const db = await getDb();
  if (!db) return [];
  if (sectionName) {
    return db.select().from(tables).where(eq(tables.section, sectionName)).orderBy(asc(tables.name));
  }
  return db.select().from(tables).orderBy(asc(tables.section), asc(tables.name));
}

export async function updateTablePosition(id: number, data: { positionX: number; positionY: number; section?: string }) {
  const db = await getDb();
  if (!db) return null;
  await db.update(tables).set(data).where(eq(tables.id, id));
}

export async function updateTableStatus(id: number, status: "free" | "occupied" | "reserved" | "cleaning") {
  const db = await getDb();
  if (!db) return null;
  await db.update(tables).set({ status }).where(eq(tables.id, id));
}

export async function getTableWithOrders(id: number) {
  const db = await getDb();
  if (!db) return null;
  const tableData = await db.select().from(tables).where(eq(tables.id, id)).limit(1);
  if (!tableData.length) return null;
  const activeOrders = await db.select().from(orders).where(and(eq(orders.tableId, id), ne(orders.status, "completed"), ne(orders.status, "cancelled")));
  return { ...tableData[0], activeOrders };
}
