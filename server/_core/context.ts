import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  console.log(`[TRPC] Request to ${opts.req.path}. Auth header: ${opts.req.headers.authorization ? 'PRESENT' : 'MISSING'}`);
  console.log(`[TRPC Env Check] Supabase URL: "${process.env.VITE_SUPABASE_URL}" / Anon Key: "${process.env.VITE_SUPABASE_ANON_KEY?.substring(0, 10)}..."`);

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error: any) {
    // Log why authentication failed for debugging
    console.error("[Context] authenticateRequest failed:", error?.message || error);
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
