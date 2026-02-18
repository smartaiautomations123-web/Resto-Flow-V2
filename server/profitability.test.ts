import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { orders, orderItems, menuItems, menuCategories } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Profitability Analysis", () => {
  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  it("should get profitability by item", async () => {
    const { getProfitabilityByItem } = await import("./db");
    const results = await getProfitabilityByItem(thirtyDaysAgo, today);

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      const item = results[0];
      expect(item).toHaveProperty("itemId");
      expect(item).toHaveProperty("itemName");
      expect(item).toHaveProperty("quantity");
      expect(item).toHaveProperty("revenue");
      expect(item).toHaveProperty("cogs");
      expect(item).toHaveProperty("grossProfit");
      expect(item).toHaveProperty("profitMargin");
      expect(item.revenue).toBeGreaterThanOrEqual(0);
      expect(item.cogs).toBeGreaterThanOrEqual(0);
    }
  });

  it("should get profitability by category", async () => {
    const { getProfitabilityByCategory } = await import("./db");
    const results = await getProfitabilityByCategory(thirtyDaysAgo, today);

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      const category = results[0];
      expect(category).toHaveProperty("categoryId");
      expect(category).toHaveProperty("categoryName");
      expect(category).toHaveProperty("quantity");
      expect(category).toHaveProperty("revenue");
      expect(category).toHaveProperty("cogs");
      expect(category).toHaveProperty("grossProfit");
      expect(category).toHaveProperty("profitMargin");
    }
  });

  it("should get profitability by shift", async () => {
    const { getProfitabilityByShift } = await import("./db");
    const results = await getProfitabilityByShift(thirtyDaysAgo, today);

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      const shift = results[0];
      expect(shift).toHaveProperty("staffId");
      expect(shift).toHaveProperty("revenue");
      expect(shift).toHaveProperty("cogs");
      expect(shift).toHaveProperty("discounts");
      expect(shift).toHaveProperty("labourCost");
      expect(shift).toHaveProperty("grossProfit");
      expect(shift).toHaveProperty("netProfit");
      expect(shift).toHaveProperty("profitMargin");
    }
  });

  it("should get top profitable items", async () => {
    const { getTopProfitableItems } = await import("./db");
    const results = await getTopProfitableItems(thirtyDaysAgo, today, 10);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(10);
    
    // Verify sorted by profit descending
    if (results.length > 1) {
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].grossProfit).toBeGreaterThanOrEqual(results[i + 1].grossProfit);
      }
    }
  });

  it("should get bottom profitable items", async () => {
    const { getBottomProfitableItems } = await import("./db");
    const results = await getBottomProfitableItems(thirtyDaysAgo, today, 10);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeLessThanOrEqual(10);
    
    // Verify sorted by profit ascending
    if (results.length > 1) {
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].grossProfit).toBeLessThanOrEqual(results[i + 1].grossProfit);
      }
    }
  });

  it("should get profit trends", async () => {
    const { getProfitTrends } = await import("./db");
    const results = await getProfitTrends(thirtyDaysAgo, today);

    expect(Array.isArray(results)).toBe(true);
    if (results.length > 0) {
      const trend = results[0];
      expect(trend).toHaveProperty("date");
      expect(trend).toHaveProperty("revenue");
      expect(trend).toHaveProperty("cogs");
      expect(trend).toHaveProperty("discounts");
      expect(trend).toHaveProperty("grossProfit");
      expect(trend).toHaveProperty("netProfit");
      expect(trend).toHaveProperty("profitMargin");
      expect(trend).toHaveProperty("orderCount");
      expect(trend).toHaveProperty("avgOrderValue");
    }
  });

  it("should get profitability summary", async () => {
    const { getProfitabilitySummary } = await import("./db");
    const summary = await getProfitabilitySummary(thirtyDaysAgo, today);

    expect(summary).toHaveProperty("totalRevenue");
    expect(summary).toHaveProperty("totalCogs");
    expect(summary).toHaveProperty("totalDiscounts");
    expect(summary).toHaveProperty("grossProfit");
    expect(summary).toHaveProperty("netProfit");
    expect(summary).toHaveProperty("profitMargin");
    expect(summary).toHaveProperty("cogsPercentage");
    expect(summary).toHaveProperty("totalOrders");
    expect(summary).toHaveProperty("totalItems");
    expect(summary).toHaveProperty("avgOrderValue");
    expect(summary).toHaveProperty("avgItemPrice");

    // Verify calculations
    expect(summary.grossProfit).toBe(summary.totalRevenue - summary.totalCogs);
    expect(summary.netProfit).toBe(summary.grossProfit - summary.totalDiscounts);
  });

  it("should calculate profit margin correctly", async () => {
    const { getProfitabilitySummary } = await import("./db");
    const summary = await getProfitabilitySummary(thirtyDaysAgo, today);

    if (summary.totalRevenue > 0) {
      const expectedMargin = (summary.netProfit / summary.totalRevenue) * 100;
      expect(summary.profitMargin).toBeCloseTo(expectedMargin, 1);
    }
  });

  it("should calculate COGS percentage correctly", async () => {
    const { getProfitabilitySummary } = await import("./db");
    const summary = await getProfitabilitySummary(thirtyDaysAgo, today);

    if (summary.totalRevenue > 0) {
      const expectedCogs = (summary.totalCogs / summary.totalRevenue) * 100;
      expect(summary.cogsPercentage).toBeCloseTo(expectedCogs, 1);
    }
  });

  it("should handle empty date range", async () => {
    const { getProfitabilitySummary } = await import("./db");
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const summary = await getProfitabilitySummary(futureDate, futureDate);

    expect(summary.totalRevenue).toBe(0);
    expect(summary.totalCogs).toBe(0);
    expect(summary.totalOrders).toBe(0);
  });
});
