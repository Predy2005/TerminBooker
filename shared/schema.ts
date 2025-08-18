import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  timezone: text("timezone").notNull().default("Europe/Prague"),
  language: text("language").notNull().default("cs-CZ"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});

export const users = pgTable("users", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("ADMIN"),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});

export const services = pgTable("services", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  durationMin: integer("duration_min").notNull(),
  priceCzk: integer("price_czk"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
}, (table) => ({
  durationCheck: sql`CHECK (${table.durationMin} BETWEEN 5 AND 480)`
}));

export const availabilityTemplates = pgTable("availability_templates", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  weekday: integer("weekday").notNull(),
  startMinutes: integer("start_minutes").notNull(),
  endMinutes: integer("end_minutes").notNull(),
  slotStepMin: integer("slot_step_min").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
}, (table) => ({
  weekdayCheck: sql`CHECK (${table.weekday} BETWEEN 0 AND 6)`
}));

export const blackouts = pgTable("blackouts", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  reason: text("reason")
});

export const bookingStatusEnum = pgEnum("booking_status", ["PENDING", "CONFIRMED", "CANCELLED"]);

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  serviceId: text("service_id").notNull().references(() => services.id, { onDelete: "restrict" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  note: text("note"),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at").notNull(),
  status: bookingStatusEnum("status").notNull().default("PENDING"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
}, (table) => ({
  timeCheck: sql`CHECK (${table.startsAt} < ${table.endsAt})`,
  uniqueOrgTime: uniqueIndex("ux_bookings_org_time").on(table.organizationId, table.startsAt, table.endsAt)
}));

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  services: many(services),
  availabilityTemplates: many(availabilityTemplates),
  blackouts: many(blackouts),
  bookings: many(bookings)
}));

export const usersRelations = relations(users, ({ one }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id]
  })
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [services.organizationId],
    references: [organizations.id]
  }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  organization: one(organizations, {
    fields: [bookings.organizationId],
    references: [organizations.id]
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id]
  })
}));

export const availabilityTemplatesRelations = relations(availabilityTemplates, ({ one }) => ({
  organization: one(organizations, {
    fields: [availabilityTemplates.organizationId],
    references: [organizations.id]
  })
}));

export const blackoutsRelations = relations(blackouts, ({ one }) => ({
  organization: one(organizations, {
    fields: [blackouts.organizationId],
    references: [organizations.id]
  })
}));

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true
});

export const insertAvailabilityTemplateSchema = createInsertSchema(availabilityTemplates).omit({
  id: true,
  createdAt: true
});

export const insertBlackoutSchema = createInsertSchema(blackouts).omit({
  id: true
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Types
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type AvailabilityTemplate = typeof availabilityTemplates.$inferSelect;
export type InsertAvailabilityTemplate = z.infer<typeof insertAvailabilityTemplateSchema>;

export type Blackout = typeof blackouts.$inferSelect;
export type InsertBlackout = z.infer<typeof insertBlackoutSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
