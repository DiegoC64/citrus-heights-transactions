import { pgTable, serial, varchar, date, timestamp } from "drizzle-orm/pg-core";

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),

  // Property info
  address: varchar("address", { length: 255 }).notNull(),

  // Acceptance date = Day 0
  acceptanceDate: date("acceptance_date").notNull(),

  // Status of the transaction
  status: varchar("status", { length: 20 })
    .notNull()
    .default("open"),

  // Audit field
  createdAt: timestamp("created_at").defaultNow(),
});
