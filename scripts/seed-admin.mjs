import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const env = readFileSync(resolve(process.cwd(), ".env.local"), "utf8")
  .split("\n")
  .filter(Boolean)
  .reduce((acc, line) => {
    const eq = line.indexOf("=");
    if (eq === -1) return acc;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    acc[key] = val;
    return acc;
  }, {});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const ADMIN_EMAIL = "kerjadigital231@gmail.com";
const ADMIN_PASSWORD = "kompol231";

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("[1/4] Checking if profiles table exists...");
  const { error: profilesErr } = await admin
    .from("profiles")
    .select("id")
    .limit(1);

  if (profilesErr) {
    console.error("\n❌ profiles table missing or inaccessible:", profilesErr.message);
    console.error("\n→ Jalankan dulu file supabase/SETUP_ALL_IN_ONE.sql di Supabase SQL Editor.");
    process.exit(1);
  }
  console.log("    ✓ profiles table OK");

  console.log("[2/4] Looking up existing user...");
  const { data: list, error: listErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error("listUsers failed:", listErr.message);
    process.exit(1);
  }
  const existing = list.users.find((u) => u.email === ADMIN_EMAIL);

  let userId;
  if (existing) {
    console.log(`    ✓ User exists (id=${existing.id}). Updating password & confirming...`);
    const { data: upd, error: updErr } = await admin.auth.admin.updateUserById(
      existing.id,
      {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      }
    );
    if (updErr) {
      console.error("updateUserById failed:", updErr.message);
      process.exit(1);
    }
    userId = upd.user.id;
  } else {
    console.log("[3/4] Creating new user...");
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true,
    });
    if (createErr) {
      console.error("createUser failed:", createErr.message);
      process.exit(1);
    }
    userId = created.user.id;
    console.log(`    ✓ User created (id=${userId})`);
  }

  console.log("[4/4] Promoting to admin in profiles table...");
  const { error: upsertErr } = await admin.from("profiles").upsert(
    {
      id: userId,
      email: ADMIN_EMAIL,
      role: "admin",
    },
    { onConflict: "id" }
  );
  if (upsertErr) {
    console.error("profiles upsert failed:", upsertErr.message);
    process.exit(1);
  }

  console.log("\n✅ Admin siap login!");
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
