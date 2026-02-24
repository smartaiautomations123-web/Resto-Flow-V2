import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./server/_core/env";

const supabase = createClient(ENV.supabaseUrl, ENV.supabaseAnonKey);

async function testAuth() {
    console.log("1. Logging in to Supabase...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: "alexbraga31@gmail.com",
        password: "timeskl31"
    });

    if (error) {
        console.error("Login failed:", error.message);
        return;
    }

    const token = data.session.access_token;
    console.log("Login successful. Token:", token.substring(0, 15) + "...");

    console.log("2. Hitting local server auth.me...");
    const res = await fetch("http://localhost:3000/api/trpc/auth.me", {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    console.log("HTTP Status:", res.status);
    const text = await res.text();
    console.log("Response Body:", text);
}

testAuth();
