import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp, pgEnum, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const organizations = pgTable("organizations", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  timezone: text("timezone").notNull().default("Europe/Prague"),
  language: text("language").notNull().default("cs-CZ"),
  plan: text("plan").notNull().default("FREE"),
  subscriptionStatus: text("subscription_status").notNull().default("inactive"),
  subscriptionCurrentPeriodEnd: timestamp("subscription_current_period_end"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeAccountId: text("stripe_account_id"),
  stripeOnboardingStatus: text("stripe_onboarding_status").notNull().default("pending"),
  // Business verification fields
  businessIco: text("business_ico"), // IČO
  businessDic: text("business_dic"), // DIČ 
  businessAddress: text("business_address"),
  businessCity: text("business_city"),
  businessZip: text("business_zip"),
  businessCountry: text("business_country").default("CZ"),
  businessPhone: text("business_phone"),
  bankAccountNumber: text("bank_account_number"),
  bankCode: text("bank_code"),
  // Visual customization
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#0f172a"), // slate-900
  secondaryColor: text("secondary_color").default("#64748b"), // slate-500
  accentColor: text("accent_color").default("#3b82f6"), // blue-500
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
  requirePayment: text("require_payment").notNull().default("ORG_DEFAULT"), // ORG_DEFAULT | OFF | OPTIONAL | REQUIRED
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
  paymentStatus: text("payment_status").notNull().default("UNPAID"), // UNPAID | REQUIRES_PAYMENT | PAID | REFUNDED | FAILED
  paymentProvider: text("payment_provider"), // 'stripe'
  paymentExternalId: text("payment_external_id"), // session/payment_intent id
  holdExpiresAt: timestamp("hold_expires_at"), // pro REQUIRED: rezervace propadne, pokud se nezaplatí včas
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
}, (table) => ({
  timeCheck: sql`CHECK (${table.startsAt} < ${table.endsAt})`,
  uniqueOrgTime: uniqueIndex("ux_bookings_org_time").on(table.organizationId, table.startsAt, table.endsAt)
}));

export const bookingPayments = pgTable("booking_payments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingId: text("booking_id").notNull().references(() => bookings.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // 'stripe'
  externalId: text("external_id").notNull(), // checkout.session / payment_intent id
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("CZK"),
  status: text("status").notNull(), // created | paid | failed | refunded
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  paidAt: timestamp("paid_at"),
  rawPayload: jsonb("raw_payload")
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  services: many(services),
  availabilityTemplates: many(availabilityTemplates),
  blackouts: many(blackouts),
  bookings: many(bookings),
  bookingPayments: many(bookingPayments)
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

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [bookings.organizationId],
    references: [organizations.id]
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id]
  }),
  payments: many(bookingPayments)
}));

export const bookingPaymentsRelations = relations(bookingPayments, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingPayments.bookingId],
    references: [bookings.id]
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

export const payments = pgTable("payments", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  externalId: text("external_id").notNull(),
  plan: text("plan").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("CZK"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  paidAt: timestamp("paid_at"),
  rawPayload: jsonb("raw_payload")
});

export const webhookEvents = pgTable("webhook_events", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  provider: text("provider").notNull(),
  eventType: text("event_type").notNull(),
  receivedAt: timestamp("received_at").notNull().default(sql`now()`),
  payload: jsonb("payload")
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  organization: one(organizations, {
    fields: [payments.organizationId],
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

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

export const insertWebhookEventSchema = createInsertSchema(webhookEvents).omit({
  id: true,
  receivedAt: true
});

export const insertBookingPaymentSchema = createInsertSchema(bookingPayments).omit({
  id: true,
  createdAt: true
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

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = z.infer<typeof insertWebhookEventSchema>;

export type BookingPayment = typeof bookingPayments.$inferSelect;
export type InsertBookingPayment = z.infer<typeof insertBookingPaymentSchema>;

export type PaymentMode = "OFF" | "OPTIONAL" | "REQUIRED";
export type PaymentStatus = "UNPAID" | "REQUIRES_PAYMENT" | "PAID" | "REFUNDED" | "FAILED";
