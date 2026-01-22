import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { genSaltSync, hashSync } from "bcrypt-ts";

/**
 * IMPORTANT:
 * - Do NOT create the postgres client at module import time.
 * - DigitalOcean/Next.js may import this file during build.
 * - If env vars aren't present then, you'll get "Invalid URL: undefined?sslmode=require".
 *
 * This lazy-init approach creates the client only at runtime when a request/server action calls it.
 */

let _client: ReturnType<typeof postgres> | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getConnectionUrl(): string {
  // Prefer DATABASE_URL (common standard), fallback to POSTGRES_URL if that's what the platform provides.
  const raw = process.env.DATABASE_URL || process.env.POSTGRES_URL;

  if (!raw) {
    throw new Error(
      "Database connection env var missing. Set DATABASE_URL (recommended) or POSTGRES_URL."
    );
  }

  // Append sslmode=require if not already present.
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

export async function getUser(email: string) {
  const users = await ensureTableExists();
  return await getDb().select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const users = await ensureTableExists();
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await getDb().insert(users).values({ email, password: hash });
}

async function ensureTableExists() {
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

  const table = pgTable("User", {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 64 }),
    password: varchar("password", { length: 64 }),
  });

  return table;
}
