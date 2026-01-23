import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { transactions } from "./db/schema";

/**
 * IMPORTANT:
 * - Do NOT create the postgres client at module import time.
 * - This file may be imported during Next.js build.
 * - DB connection must only happen at runtime.
 */

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

/* =========================
   Connection helpers
========================= */

function getConnectionUrl(): string {
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!raw) {
    throw new Error(
      "Database connection env var missing. Set DATABASE_URL (recommended)."
    );
  }

  return raw.includes("sslmode=") ? raw : `${raw}?sslmode=require`;
}

function getClient() {
  if (!_client) {
    _client = postgres(getConnectionUrl());
  }
  return _client;
}

function getDb() {
  if (!_db) {
    _db = drizzle(getClient());
  }
  return _db;
}

/* =========================
   USERS
========================= */

export async function getUser(email: string) {
  const users = await ensureUsersTableExists();
  return await getDb().select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const users = await ensureUsersTableExists();
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await getDb().insert(users).values({ email, password: hash });
}

/**
 * IMPORTANT:
 * DigitalOcean DB user may not have permission to CREATE TABLE in production.
 * So we only define the table schema here — no runtime CREATE TABLE calls.
 */
async function ensureUsersTableExists() {
  const users = pgTable("User", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 64 }),
    password: varchar("password", { length: 64 }),
  });

  return users;
}

/* =========================
   TRANSACTIONS
========================= */

/**
 * IMPORTANT:
 * Do not attempt to CREATE TABLE at runtime.
 * We return the schema definition only.
 */
export async function ensureTransactionsTableExists() {
  return transactions;
}
