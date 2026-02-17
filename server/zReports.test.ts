import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUserContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("zReports", () => {
  describe("generate", () => {
    it("should require admin role", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.zReports.generate({ date: "2026-02-16" });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin to generate Z-report", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.zReports.generate({ date: "2026-02-16" });
      expect(result).toBeDefined();
      expect(typeof result).toBe("number");
    });
  });

  describe("getByDate", () => {
    it("should retrieve Z-report by date", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Generate a report first
      const reportId = await caller.zReports.generate({ date: "2026-02-16" });
      expect(reportId).toBeDefined();

      // Retrieve it
      const report = await caller.zReports.getByDate({ date: "2026-02-16" });
      expect(report).toBeDefined();
      expect(report?.reportDate).toBe("2026-02-16");
      expect(typeof report?.id).toBe("number");
    });

    it("should return null for non-existent date", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const report = await caller.zReports.getByDate({ date: "2000-01-01" });
      expect(report).toBeNull();
    });
  });

  describe("getByDateRange", () => {
    it("should retrieve Z-reports in date range", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Generate reports for multiple dates
      await caller.zReports.generate({ date: "2026-02-14" });
      await caller.zReports.generate({ date: "2026-02-15" });
      await caller.zReports.generate({ date: "2026-02-16" });

      // Query range
      const reports = await caller.zReports.getByDateRange({
        startDate: "2026-02-14",
        endDate: "2026-02-16",
      });

      expect(reports).toBeDefined();
      expect(reports.length).toBeGreaterThanOrEqual(3);
      expect(reports[0].reportDate).toBeDefined();
    });

    it("should return empty array for empty date range", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const reports = await caller.zReports.getByDateRange({
        startDate: "2000-01-01",
        endDate: "2000-01-31",
      });

      expect(Array.isArray(reports)).toBe(true);
    });
  });

  describe("getDetails", () => {
    it("should retrieve full Z-report details with items", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Generate a report
      const reportId = await caller.zReports.generate({ date: "2026-02-16" });

      // Get details
      const details = await caller.zReports.getDetails({ reportId });

      expect(details).toBeDefined();
      expect(details?.id).toBe(reportId);
      expect(details?.reportDate).toBe("2026-02-16");
      expect(Array.isArray(details?.items)).toBe(true);
      expect(Array.isArray(details?.shifts)).toBe(true);
    });

    it("should return null for non-existent report", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const details = await caller.zReports.getDetails({ reportId: 99999 });
      expect(details).toBeNull();
    });
  });

  describe("delete", () => {
    it("should require admin role", async () => {
      const { ctx } = createUserContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.zReports.delete({ reportId: 1 });
        expect.fail("Should have thrown FORBIDDEN error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });

    it("should allow admin to delete Z-report", async () => {
      const { ctx } = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Generate a report
      const reportId = await caller.zReports.generate({ date: "2026-02-16" });

      // Delete it
      const result = await caller.zReports.delete({ reportId });
      expect(result).toBe(true);
    });
  });
});
