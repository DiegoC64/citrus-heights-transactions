import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, varchar, date, timestamp } from "drizzle-orm/pg-core";
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

async function ensureUsersTableExists() {
  const client = getClient();

  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'User'
    );
  `;

  if (!result[0]?.exists) {
    await client`
      CREATE TABLE "User" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(64),
        password VARCHAR(64)
      );
    `;
  }

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

export async function ensureTransactionsTableExists() {
  const client = getClient();

  const result = await client`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'transactions'
    );
  `;

  if (!result[0]?.exists) {
    await client`
      CREATE TABLE transactions (
        id SERIAL PRIMARY KEY,
        address VARCHAR(255) NOT NULL,
        acceptance_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;
  }

  return transactions;
}
