import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { genSaltSync, hashSync } from "bcrypt-ts";

/**
 * NO admin operations.
 * NO table creation.
 * NO schema checks.
 * Works on DigitalOcean $7 DB.
 */

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = postgres(connectionString, {
  ssl: "require",
});

const db = drizzle(client);

/* =====================
   TABLE DEFINITIONS
===================== */

export const users = pgTable("User", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 64 }),
  password: varchar("password", { length: 64 }),
});

/* =====================
   USERS
===================== */

export async function getUser(email: string) {
  return await db.select().from(users).where(eq(users.email, email));
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return await db.insert(users).values({
    email,
    password: hash,
  });
}
