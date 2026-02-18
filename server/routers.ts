import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { nanoid } from "nanoid";
import { invokeLLM } from "./_core/llm";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── Staff ───────────────────────────────────────────────────────
  staff: router({
    list: protectedProcedure.query(() => db.listStaff()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getStaffById(input.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(), email: z.string().optional(), phone: z.string().optional(),
      pin: z.string().optional(), role: z.enum(["owner", "manager", "server", "bartender", "kitchen"]),
      hourlyRate: z.string().optional(),
    })).mutation(({ input }) => db.createStaff(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), email: z.string().optional(),
      phone: z.string().optional(), pin: z.string().optional(),
      role: z.enum(["owner", "manager", "server", "bartender", "kitchen"]).optional(),
      hourlyRate: z.string().optional(), isActive: z.boolean().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateStaff(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteStaff(input.id)),
    clockIn: protectedProcedure.input(z.object({ staffId: z.number() })).mutation(({ input }) => db.clockIn(input.staffId)),
    clockOut: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.clockOut(input.id)),
    getActiveClock: protectedProcedure.input(z.object({ staffId: z.number() })).query(({ input }) => db.getActiveClockEntry(input.staffId)),
    timeEntries: protectedProcedure.input(z.object({
      staffId: z.number().optional(), dateFrom: z.string().optional(), dateTo: z.string().optional(),
    })).query(({ input }) => db.listTimeEntries(input.staffId, input.dateFrom, input.dateTo)),
  }),

  // ─── Dashboard helpers ───────────────────────────────────────────
  dashboard: router({
    staffOnDuty: protectedProcedure.query(() => db.getStaffOnDuty()),
    shiftsEndingSoon: protectedProcedure.query(() => db.getShiftsEndingSoon()),
  }),

  // ─── Shifts ──────────────────────────────────────────────────────
  shifts: router({
    list: protectedProcedure.input(z.object({
      dateFrom: z.string().optional(), dateTo: z.string().optional(),
    })).query(({ input }) => db.listShifts(input.dateFrom, input.dateTo)),
    create: protectedProcedure.input(z.object({
      staffId: z.number(), date: z.string(), startTime: z.string(), endTime: z.string(),
      role: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => db.createShift(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), staffId: z.number().optional(), date: z.string().optional(),
      startTime: z.string().optional(), endTime: z.string().optional(),
      role: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateShift(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteShift(input.id)),
  }),

  // ─── Menu Categories ─────────────────────────────────────────────
  categories: router({
    list: publicProcedure.query(() => db.listCategories()),
    create: protectedProcedure.input(z.object({
      name: z.string(), description: z.string().optional(), sortOrder: z.number().optional(),
    })).mutation(({ input }) => db.createCategory(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), description: z.string().optional(),
      sortOrder: z.number().optional(), isActive: z.boolean().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateCategory(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteCategory(input.id)),
  }),

  // ─── Menu Items ──────────────────────────────────────────────────
  menu: router({
    list: publicProcedure.input(z.object({ categoryId: z.number().optional() }).optional()).query(({ input }) => db.listMenuItems(input?.categoryId)),
    get: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getMenuItem(input.id)),
    create: protectedProcedure.input(z.object({
      categoryId: z.number(), name: z.string(), description: z.string().optional(),
      price: z.string(), cost: z.string().optional(), taxRate: z.string().optional(),
      imageUrl: z.string().optional(), isAvailable: z.boolean().optional(),
      isPopular: z.boolean().optional(), prepTime: z.number().optional(),
      station: z.enum(["grill", "fryer", "salad", "dessert", "bar", "general"]).optional(),
      sortOrder: z.number().optional(),
    })).mutation(({ input }) => db.createMenuItem(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), categoryId: z.number().optional(), name: z.string().optional(),
      description: z.string().optional(), price: z.string().optional(),
      cost: z.string().optional(), taxRate: z.string().optional(),
      imageUrl: z.string().optional(), isAvailable: z.boolean().optional(),
      isPopular: z.boolean().optional(), prepTime: z.number().optional(),
      station: z.enum(["grill", "fryer", "salad", "dessert", "bar", "general"]).optional(),
      sortOrder: z.number().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateMenuItem(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteMenuItem(input.id)),
  }),

  // ─── Modifiers ───────────────────────────────────────────────────
  modifiers: router({
    list: publicProcedure.query(() => db.listModifiers()),
    create: protectedProcedure.input(z.object({
      name: z.string(), price: z.string().optional(), groupName: z.string().optional(),
    })).mutation(({ input }) => db.createModifier(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), price: z.string().optional(),
      groupName: z.string().optional(), isActive: z.boolean().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateModifier(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteModifier(input.id)),
    getForItem: protectedProcedure.input(z.object({ menuItemId: z.number() })).query(({ input }) => db.getItemModifiers(input.menuItemId)),
    setForItem: protectedProcedure.input(z.object({
      menuItemId: z.number(), modifierIds: z.array(z.number()),
    })).mutation(({ input }) => db.setItemModifiers(input.menuItemId, input.modifierIds)),
  }),

  // ─── Tables ──────────────────────────────────────────────────────
  tables: router({
    list: publicProcedure.query(() => db.listTables()),
    create: protectedProcedure.input(z.object({
      name: z.string(), seats: z.number().optional(), section: z.string().optional(),
      positionX: z.number().optional(), positionY: z.number().optional(),
    })).mutation(({ input }) => db.createTable(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), seats: z.number().optional(),
      status: z.enum(["free", "occupied", "reserved", "cleaning"]).optional(),
      section: z.string().optional(), positionX: z.number().optional(), positionY: z.number().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateTable(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteTable(input.id)),
  }),

  // ─── Orders ──────────────────────────────────────────────────────
  orders: router({
    list: protectedProcedure.input(z.object({
      status: z.string().optional(), type: z.string().optional(),
      dateFrom: z.string().optional(), dateTo: z.string().optional(),
    }).optional()).query(({ input }) => db.listOrders(input?.status, input?.type, input?.dateFrom, input?.dateTo)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getOrder(input.id)),
    create: protectedProcedure.input(z.object({
      type: z.enum(["dine_in", "takeaway", "delivery", "collection", "online"]),
      tableId: z.number().optional(), staffId: z.number().optional(),
      customerId: z.number().optional(), customerName: z.string().optional(), notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      const orderNumber = `ORD-${nanoid(8).toUpperCase()}`;
      return db.createOrder({ ...input, orderNumber });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["pending", "preparing", "ready", "served", "completed", "cancelled"]).optional(),
      paymentMethod: z.enum(["card", "cash", "split", "online", "unpaid"]).optional(),
      paymentStatus: z.enum(["unpaid", "paid", "refunded", "partial"]).optional(),
      subtotal: z.string().optional(), taxAmount: z.string().optional(),
      discountAmount: z.string().optional(), serviceCharge: z.string().optional(),
      tipAmount: z.string().optional(), total: z.string().optional(),
      notes: z.string().optional(), completedAt: z.date().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.status === "completed") {
        (data as any).completedAt = new Date();
        await db.deductStockForOrder(id);
      }
      return db.updateOrder(id, data);
    }),
    items: protectedProcedure.input(z.object({ orderId: z.number() })).query(({ input }) => db.listOrderItems(input.orderId)),
    addItem: protectedProcedure.input(z.object({
      orderId: z.number(), menuItemId: z.number(), name: z.string(),
      quantity: z.number(), unitPrice: z.string(), totalPrice: z.string(),
      modifiers: z.any().optional(), station: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => db.createOrderItem(input)),
    updateItem: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["pending", "preparing", "ready", "served", "voided"]).optional(),
      quantity: z.number().optional(), notes: z.string().optional(),
      sentToKitchenAt: z.date().optional(), readyAt: z.date().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateOrderItem(id, data); }),
  }),

  // ─── KDS ─────────────────────────────────────────────────────────
  kds: router({
    items: protectedProcedure.query(() => db.getKDSItems()),
    updateStatus: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["pending", "preparing", "ready", "served", "voided"]),
    })).mutation(async ({ input }) => {
      const data: any = { status: input.status };
      if (input.status === "preparing") data.sentToKitchenAt = new Date();
      if (input.status === "ready") data.readyAt = new Date();
      return db.updateOrderItem(input.id, data);
    }),
  }),

  // ─── Ingredients ─────────────────────────────────────────────────
  ingredients: router({
    list: protectedProcedure.query(() => db.listIngredients()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getIngredient(input.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(), unit: z.string(), currentStock: z.string().optional(),
      minStock: z.string().optional(), costPerUnit: z.string().optional(),
      supplierId: z.number().optional(),
    })).mutation(({ input }) => db.createIngredient(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), unit: z.string().optional(),
      currentStock: z.string().optional(), minStock: z.string().optional(),
      costPerUnit: z.string().optional(), supplierId: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateIngredient(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteIngredient(input.id)),
    lowStock: protectedProcedure.query(() => db.getLowStockIngredients()),
  }),

  // ─── Recipes ─────────────────────────────────────────────────────
  recipes: router({
    getForItem: protectedProcedure.input(z.object({ menuItemId: z.number() })).query(({ input }) => db.getRecipesForItem(input.menuItemId)),
    setForItem: protectedProcedure.input(z.object({
      menuItemId: z.number(),
      items: z.array(z.object({ ingredientId: z.number(), quantity: z.string() })),
    })).mutation(({ input }) => db.setRecipes(input.menuItemId, input.items)),
  }),

  // ─── Suppliers ───────────────────────────────────────────────────
  suppliers: router({
    list: protectedProcedure.query(() => db.listSuppliers()),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getSupplier(input.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(), contactName: z.string().optional(), email: z.string().optional(),
      phone: z.string().optional(), address: z.string().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => db.createSupplier(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), contactName: z.string().optional(),
      email: z.string().optional(), phone: z.string().optional(),
      address: z.string().optional(), notes: z.string().optional(), isActive: z.boolean().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateSupplier(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => db.deleteSupplier(input.id)),
  }),

  // ─── Purchase Orders ─────────────────────────────────────────────
  purchaseOrders: router({
    list: protectedProcedure.input(z.object({ supplierId: z.number().optional() }).optional())
      .query(({ input }) => db.listPurchaseOrders(input?.supplierId)),
    create: protectedProcedure.input(z.object({
      supplierId: z.number(), notes: z.string().optional(),
      items: z.array(z.object({
        ingredientId: z.number(), quantity: z.string(), unitCost: z.string(), totalCost: z.string(),
      })),
    })).mutation(async ({ input }) => {
      const totalAmount = input.items.reduce((sum, i) => sum + Number(i.totalCost), 0).toFixed(2);
      const po = await db.createPurchaseOrder({ supplierId: input.supplierId, notes: input.notes, totalAmount });
      for (const item of input.items) {
        await db.createPurchaseOrderItem({ purchaseOrderId: po.id, ...item });
      }
      return po;
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["draft", "sent", "received", "cancelled"]).optional(),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      if (data.status === "received") (data as any).receivedAt = new Date();
      if (data.status === "sent") (data as any).orderedAt = new Date();
      return db.updatePurchaseOrder(id, data);
    }),
    items: protectedProcedure.input(z.object({ purchaseOrderId: z.number() }))
      .query(({ input }) => db.listPurchaseOrderItems(input.purchaseOrderId)),
  }),

  // ─── Customers ───────────────────────────────────────────────────
  customers: router({
    list: protectedProcedure.input(z.object({ search: z.string().optional() }).optional())
      .query(({ input }) => db.listCustomers(input?.search)),
    get: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => db.getCustomer(input.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(), email: z.string().optional(), phone: z.string().optional(),
      notes: z.string().optional(), birthday: z.string().optional(),
    })).mutation(({ input }) => db.createCustomer(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), name: z.string().optional(), email: z.string().optional(),
      phone: z.string().optional(), notes: z.string().optional(), birthday: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateCustomer(id, data); }),
    addPoints: protectedProcedure.input(z.object({ customerId: z.number(), points: z.number() }))
      .mutation(({ input }) => db.addLoyaltyPoints(input.customerId, input.points)),
  }),

  // ─── Reservations ────────────────────────────────────────────────
  reservations: router({
    list: protectedProcedure.input(z.object({ date: z.string().optional() }).optional())
      .query(({ input }) => db.listReservations(input?.date)),
    create: protectedProcedure.input(z.object({
      customerId: z.number().optional(), guestName: z.string(), guestPhone: z.string().optional(),
      guestEmail: z.string().optional(), tableId: z.number().optional(),
      partySize: z.number(), date: z.string(), time: z.string(), notes: z.string().optional(),
    })).mutation(({ input }) => db.createReservation(input)),
    update: protectedProcedure.input(z.object({
      id: z.number(), status: z.enum(["confirmed", "seated", "completed", "cancelled", "no_show"]).optional(),
      tableId: z.number().optional(), notes: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateReservation(id, data); }),
  }),

  // ─── Reporting ───────────────────────────────────────────────────
  reports: router({
    salesStats: protectedProcedure.input(z.object({ dateFrom: z.string(), dateTo: z.string() }))
      .query(({ input }) => db.getSalesStats(input.dateFrom, input.dateTo)),
    salesByCategory: protectedProcedure.input(z.object({ dateFrom: z.string(), dateTo: z.string() }))
      .query(({ input }) => db.getSalesByCategory(input.dateFrom, input.dateTo)),
    topItems: protectedProcedure.input(z.object({ dateFrom: z.string(), dateTo: z.string(), limit: z.number().optional() }))
      .query(({ input }) => db.getTopSellingItems(input.dateFrom, input.dateTo, input.limit)),
    dailySales: protectedProcedure.input(z.object({ dateFrom: z.string(), dateTo: z.string() }))
      .query(({ input }) => db.getDailySales(input.dateFrom, input.dateTo)),
    labourCosts: protectedProcedure.input(z.object({ dateFrom: z.string(), dateTo: z.string() }))
      .query(({ input }) => db.getLabourCosts(input.dateFrom, input.dateTo)),
    ordersByType: protectedProcedure.input(z.object({ dateFrom: z.string(), dateTo: z.string() }))
      .query(({ input }) => db.getOrdersByType(input.dateFrom, input.dateTo)),
  }),

  // ─── Online ordering (public) ────────────────────────────────────
  online: router({
    menu: publicProcedure.query(async () => {
      const cats = await db.listCategories();
      const items = await db.listMenuItems();
      return cats.filter(c => c.isActive).map(c => ({
        ...c,
        items: items.filter(i => i.categoryId === c.id && i.isAvailable),
      }));
    }),
    placeOrder: publicProcedure.input(z.object({
      customerName: z.string(), customerPhone: z.string().optional(),
      type: z.enum(["takeaway", "delivery", "collection", "online"]),
      items: z.array(z.object({
        menuItemId: z.number(), name: z.string(), quantity: z.number(),
        unitPrice: z.string(), totalPrice: z.string(), modifiers: z.any().optional(), notes: z.string().optional(),
      })),
      notes: z.string().optional(),
    })).mutation(async ({ input }) => {
      const orderNumber = `ONL-${nanoid(8).toUpperCase()}`;
      const subtotal = input.items.reduce((s, i) => s + Number(i.totalPrice), 0);
      const taxAmount = (subtotal * 0.1).toFixed(2);
      const total = (subtotal + Number(taxAmount)).toFixed(2);
      const order = await db.createOrder({
        orderNumber, type: input.type, customerName: input.customerName,
        subtotal: subtotal.toFixed(2), taxAmount, total, notes: input.notes,
      });
      for (const item of input.items) {
        await db.createOrderItem({ orderId: order.id, ...item });
      }
      return { orderId: order.id, orderNumber };
    }),
    orderStatus: publicProcedure.input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getOrder(input.orderId)),
  }),

  // ─── Vendor Products & Price Uploads ─────────────────────────────
  vendorProducts: router({
    list: protectedProcedure.input(z.object({ supplierId: z.number().optional() }).optional())
      .query(({ input }) => db.listVendorProducts(input?.supplierId)),
    get: protectedProcedure.input(z.object({ id: z.number() }))
      .query(({ input }) => db.getVendorProduct(input.id)),
    update: protectedProcedure.input(z.object({
      id: z.number(), packSize: z.string().optional(), packUnit: z.string().optional(),
      packQty: z.string().optional(), unitPricePer: z.string().optional(),
    })).mutation(({ input }) => { const { id, ...data } = input; return db.updateVendorProduct(id, data); }),
  }),

  vendorMappings: router({
    list: protectedProcedure.input(z.object({ supplierId: z.number().optional() }).optional())
      .query(({ input }) => db.listVendorProductMappings(input?.supplierId)),
    create: protectedProcedure.input(z.object({
      vendorProductId: z.number(), ingredientId: z.number(),
    })).mutation(({ input }) => db.createVendorProductMapping(input.vendorProductId, input.ingredientId)),
    delete: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteVendorProductMapping(input.id)),
  }),

  priceUploads: router({
    list: protectedProcedure.input(z.object({ supplierId: z.number().optional() }).optional())
      .query(({ input }) => db.listPriceUploads(input?.supplierId)),
    get: protectedProcedure.input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPriceUpload(input.id)),
    items: protectedProcedure.input(z.object({ uploadId: z.number() }))
      .query(({ input }) => db.listPriceUploadItems(input.uploadId)),

    // Upload a PDF order guide and parse it with LLM
    upload: protectedProcedure.input(z.object({
      supplierId: z.number(),
      fileName: z.string(),
      fileBase64: z.string(), // base64 encoded PDF
    })).mutation(async ({ input }) => {
      // 1. Upload PDF to S3
      const fileBuffer = Buffer.from(input.fileBase64, "base64");
      const fileKey = `price-uploads/${input.supplierId}/${nanoid(12)}-${input.fileName}`;
      const { url: fileUrl } = await storagePut(fileKey, fileBuffer, "application/pdf");

      // 2. Create upload record
      const upload = await db.createPriceUpload({
        supplierId: input.supplierId,
        fileName: input.fileName,
        fileUrl,
        status: "processing",
      });

      // 3. Use LLM to extract product data from the PDF
      try {
        const llmResult = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `You are a data extraction specialist. Extract ALL product line items from this vendor order guide PDF. For each product, extract:
- code: the vendor product code (usually a 5-digit number)
- description: the full product description
- casePrice: the case/pack price (the main price column, usually the rightmost price)
- unitPrice: the per-unit/per-lb price (the # Price column if present, may be null for many items)
- packSize: the pack size info from the description (e.g. "4/5#", "12/1 pint", "6/10")

IMPORTANT: Extract EVERY product line. Do not skip any. Return valid JSON only.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "file_url" as const,
                  file_url: {
                    url: fileUrl,
                    mime_type: "application/pdf" as const,
                  },
                },
                {
                  type: "text" as const,
                  text: "Extract all product line items from this order guide. Return a JSON array of objects.",
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "order_guide_products",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  vendorName: { type: "string", description: "Name of the vendor/supplier" },
                  dateRange: { type: "string", description: "Date range from the PDF header, e.g. 02/03/2025 - 02/09/2025" },
                  products: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        code: { type: "string", description: "Vendor product code" },
                        description: { type: "string", description: "Product description" },
                        casePrice: { type: ["string", "null"], description: "Case/pack price" },
                        unitPrice: { type: ["string", "null"], description: "Per-unit/per-lb price (# Price)" },
                        packSize: { type: ["string", "null"], description: "Pack size from description" },
                      },
                      required: ["code", "description", "casePrice", "unitPrice", "packSize"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["vendorName", "dateRange", "products"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = llmResult.choices[0]?.message?.content;
        const parsed = JSON.parse(typeof content === "string" ? content : JSON.stringify(content));
        const products = parsed.products || [];

        // 4. Match against existing vendor products and create upload items
        const uploadItems: any[] = [];
        let newCount = 0;
        let changeCount = 0;

        for (const p of products) {
          if (!p.code || !p.description) continue;
          const existing = await db.getVendorProductByCode(input.supplierId, p.code);
          const previousCasePrice = existing ? String(existing.currentCasePrice) : null;
          const isNew = !existing;
          const priceChange = existing && p.casePrice
            ? (Number(p.casePrice) - Number(existing.currentCasePrice)).toFixed(2)
            : null;

          if (isNew) newCount++;
          if (priceChange && Number(priceChange) !== 0) changeCount++;

          uploadItems.push({
            uploadId: upload.id,
            vendorCode: p.code,
            description: p.description,
            casePrice: p.casePrice || null,
            unitPrice: p.unitPrice || null,
            packSize: p.packSize || null,
            calculatedUnitPrice: p.unitPrice || null,
            previousCasePrice,
            priceChange,
            isNew,
            vendorProductId: existing?.id || null,
          });
        }

        await db.bulkCreatePriceUploadItems(uploadItems);

        // Parse date range
        let dateStart = null, dateEnd = null;
        if (parsed.dateRange) {
          const parts = parsed.dateRange.split(" - ");
          if (parts.length === 2) {
            dateStart = parts[0].trim();
            dateEnd = parts[1].trim();
          }
        }

        await db.updatePriceUpload(upload.id, {
          status: "review",
          totalItems: uploadItems.length,
          newItems: newCount,
          priceChanges: changeCount,
          dateRangeStart: dateStart,
          dateRangeEnd: dateEnd,
        });

        return { uploadId: upload.id, totalItems: uploadItems.length, newItems: newCount, priceChanges: changeCount };
      } catch (error: any) {
        await db.updatePriceUpload(upload.id, {
          status: "failed",
          errorMessage: error.message || "Failed to parse PDF",
        });
        throw error;
      }
    }),

    // Apply prices from a reviewed upload
    applyPrices: protectedProcedure.input(z.object({ uploadId: z.number() }))
      .mutation(({ input }) => db.applyPriceUpload(input.uploadId)),
  }),

  priceHistory: router({
    list: protectedProcedure.input(z.object({ vendorProductId: z.number(), limit: z.number().optional() }))
      .query(({ input }) => db.listPriceHistory(input.vendorProductId, input.limit)),
  }),

  sections: router({
    list: protectedProcedure.query(() => db.getSections()),
    create: protectedProcedure.input(z.object({ name: z.string(), description: z.string().optional(), sortOrder: z.number().optional() }))
      .mutation(({ input }) => db.createSection(input)),
    update: protectedProcedure.input(z.object({ id: z.number(), name: z.string().optional(), description: z.string().optional(), sortOrder: z.number().optional(), isActive: z.boolean().optional() }))
      .mutation(({ input }) => { const { id, ...data } = input; return db.updateSection(id, data); }),
    delete: protectedProcedure.input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteSection(input.id)),
  }),

  floorPlan: router({
    tablesBySection: protectedProcedure.input(z.object({ section: z.string().optional() }))
      .query(({ input }) => db.getTablesBySection(input.section)),
    updateTablePosition: protectedProcedure.input(z.object({ id: z.number(), positionX: z.number(), positionY: z.number(), section: z.string().optional() }))
      .mutation(({ input }) => { const { id, ...data } = input; return db.updateTablePosition(id, data); }),
    updateTableStatus: protectedProcedure.input(z.object({ id: z.number(), status: z.enum(["free", "occupied", "reserved", "cleaning"]) }))
      .mutation(({ input }) => db.updateTableStatus(input.id, input.status)),
    getTableDetails: protectedProcedure.input(z.object({ id: z.number() }))
      .query(({ input }) => db.getTableWithOrders(input.id)),
  }),

  zReports: router({
    generate: adminProcedure.input(z.object({ date: z.string() }))
      .mutation(({ input, ctx }) => db.generateZReport(input.date, ctx.user.id)),
    getByDate: protectedProcedure.input(z.object({ date: z.string() }))
      .query(({ input }) => db.getZReportByDate(input.date)),
    getByDateRange: protectedProcedure.input(z.object({ startDate: z.string(), endDate: z.string() }))
      .query(({ input }) => db.getZReportsByDateRange(input.startDate, input.endDate)),
    getDetails: protectedProcedure.input(z.object({ reportId: z.number() }))
      .query(({ input }) => db.getZReportDetails(input.reportId)),
    delete: adminProcedure.input(z.object({ reportId: z.number() }))
      .mutation(({ input }) => db.deleteZReport(input.reportId)),
  }),

  voidRefunds: router({
    getPending: adminProcedure.query(() => db.getPendingVoids()),
    getHistory: protectedProcedure.input(z.object({ orderId: z.number() }))
      .query(({ input }) => db.getVoidHistory(input.orderId)),
    requestVoid: protectedProcedure.input(z.object({
      orderId: z.number(),
      reason: z.enum(["customer_request", "mistake", "damage", "comp", "other"]),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => db.requestVoid(input.orderId, input.reason, input.notes || "", ctx.user.id)),
    approveVoid: adminProcedure.input(z.object({
      orderId: z.number(),
      refundMethod: z.enum(["original_payment", "store_credit", "cash"]),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => db.approveVoid(input.orderId, input.refundMethod, ctx.user.id, input.notes || "")),
    rejectVoid: adminProcedure.input(z.object({
      orderId: z.number(),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => db.rejectVoid(input.orderId, ctx.user.id, input.notes || "")),
  }),

  qrCodes: router({
    getAll: protectedProcedure.query(() => db.getAllQRCodes()),
    getByTableId: protectedProcedure.input(z.object({ tableId: z.number() })).query(({ input }) => db.getQRCodeByTableId(input.tableId)),
    createOrUpdate: adminProcedure.input(z.object({
      tableId: z.number(),
      qrUrl: z.string(),
      qrSize: z.number().default(200),
      format: z.string().default("png"),
    })).mutation(({ input }) => db.createOrUpdateQRCode(input.tableId, input.qrUrl, input.qrSize, input.format)),
    delete: adminProcedure.input(z.object({ tableId: z.number() })).mutation(({ input }) => db.deleteQRCode(input.tableId)),
    generateForAllTables: adminProcedure.query(() => db.generateQRCodeForAllTables()),
  }),

  customerDetail: router({
    getWithOrderHistory: protectedProcedure.input(z.object({ customerId: z.number() })).query(({ input }) => db.getCustomerWithOrderHistory(input.customerId)),
    getOrderWithItems: protectedProcedure.input(z.object({ orderId: z.number() })).query(({ input }) => db.getOrderWithItems(input.orderId)),
    getLoyaltyHistory: protectedProcedure.input(z.object({ customerId: z.number() })).query(({ input }) => db.getLoyaltyPointsHistory(input.customerId)),
    repeatOrder: protectedProcedure.input(z.object({
      customerId: z.number(),
      sourceOrderId: z.number(),
      newTableId: z.number().optional(),
    })).mutation(({ input }) => db.createOrderFromCustomerOrder(input.customerId, input.sourceOrderId, input.newTableId)),
  }),
});

export type AppRouter = typeof appRouter;
