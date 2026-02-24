import { createClient } from "@supabase/supabase-js";
import { ForbiddenError } from "@shared/_core/errors";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";

class SDKServer {
  private supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey);

  async authenticateRequest(req: Request): Promise<User> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      // In the old system we used a cookie, here we fallback to cookie if someone has one? 
      // No, we strictly use the new Bearer token header from frontend.
      throw ForbiddenError("Missing or invalid authorization header");
    }

    const token = authHeader.split(" ")[1];

    // Verify token with Supabase
    const { data: { user: supabaseUser }, error } = await this.supabase.auth.getUser(token);

    if (error || !supabaseUser) {
      console.warn("[Auth] Supabase verification failed:", error?.message);
      throw ForbiddenError("Invalid token");
    }

    const sessionUserId = supabaseUser.id;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // If user not in DB, sync from Auth server automatically
    if (!user) {
      try {
        await db.upsertUser({
          openId: sessionUserId,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split("@")[0] || null,
          email: supabaseUser.email ?? null,
          loginMethod: "email",
          lastSignedIn: signedInAt,
        });
        user = await db.getUserByOpenId(sessionUserId);
      } catch (err) {
        console.error("[Auth] Failed to sync user:", err);
        throw ForbiddenError("Failed to sync user info");
      }
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Keep it refreshed
    await db.upsertUser({
      openId: user.openId,
      name: user.name,
      email: user.email,
      loginMethod: user.loginMethod,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
