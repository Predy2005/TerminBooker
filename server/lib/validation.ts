import { z } from "zod";
import { 
  insertOrganizationSchema, 
  insertUserSchema, 
  insertServiceSchema,
  insertAvailabilityTemplateSchema,
  insertBlackoutSchema,
  insertBookingSchema 
} from "@shared/schema";

// Auth schemas
export const registerSchema = z.object({
  organizationName: z.string().min(2, "Název organizace musí mít alespoň 2 znaky").max(80, "Název organizace může mít maximálně 80 znaků"),
  slug: z.string().min(2, "URL adresa musí mít alespoň 2 znaky").max(50, "URL adresa může mít maximálně 50 znaků").regex(/^[a-z0-9-]+$/, "URL adresa může obsahovat pouze malá písmena, číslice a pomlčky"),
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(6, "Heslo musí mít alespoň 6 znaků"),
  timezone: z.string().default("Europe/Prague"),
  language: z.string().default("cs-CZ")
});

export const loginSchema = z.object({
  email: z.string().email("Neplatná e-mailová adresa"),
  password: z.string().min(1, "Heslo je povinné")
});

// Service schemas
export const serviceSchema = insertServiceSchema.extend({
  name: z.string().min(2, "Název služby musí mít alespoň 2 znaky").max(80, "Název služby může mít maximálně 80 znaků"),
  durationMin: z.number().min(5, "Minimální délka služby je 5 minut").max(480, "Maximální délka služby je 480 minut"),
  priceCzk: z.number().positive("Cena musí být kladné číslo").optional()
});

// Availability template schemas
export const availabilityTemplateSchema = insertAvailabilityTemplateSchema.extend({
  weekday: z.number().min(0, "Neplatný den v týdnu").max(6, "Neplatný den v týdnu"),
  startMinutes: z.number().min(0, "Neplatný začátek").max(1439, "Neplatný začátek"),
  endMinutes: z.number().min(1, "Neplatný konec").max(1440, "Neplatný konec"),
  slotStepMin: z.number().min(5, "Minimální krok slotu je 5 minut").max(60, "Maximální krok slotu je 60 minut")
}).refine(data => data.endMinutes > data.startMinutes, {
  message: "Konec musí být po začátku",
  path: ["endMinutes"]
});

// Blackout schemas
export const blackoutSchema = insertBlackoutSchema.extend({
  startsAt: z.string().datetime("Neplatný formát data"),
  endsAt: z.string().datetime("Neplatný formát data"),
  reason: z.string().optional()
}).refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "Konec musí být po začátku",
  path: ["endsAt"]
});

// Booking schemas
export const publicBookingSchema = z.object({
  serviceId: z.string().min(1, "Neplatné ID služby"),
  customerName: z.string().min(2, "Jméno musí mít alespoň 2 znaky").max(80, "Jméno může mít maximálně 80 znaků"),
  customerEmail: z.string().email("Neplatná e-mailová adresa"),
  customerPhone: z.string().optional(),
  note: z.string().max(500, "Poznámka může mít maximálně 500 znaků").optional(),
  startsAt: z.string().datetime("Neplatný formát data"),
  endsAt: z.string().datetime("Neplatný formát data")
}).refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "Konec musí být po začátku",
  path: ["endsAt"]
});

export const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"], {
    errorMap: () => ({ message: "Neplatný status rezervace" })
  }).optional(),
  note: z.string().max(500, "Poznámka může mít maximálně 500 znaků").optional()
});

// Organization schemas
export const updateOrganizationSchema = insertOrganizationSchema.partial().extend({
  name: z.string().min(2, "Název organizace musí mít alespoň 2 znaky").max(80, "Název organizace může mít maximálně 80 znaků").optional(),
  slug: z.string().min(2, "URL adresa musí mít alespoň 2 znaky").max(50, "URL adresa může mít maximálně 50 znaků").regex(/^[a-z0-9-]+$/, "URL adresa může obsahovat pouze malá písmena, číslice a pomlčky").optional(),
  timezone: z.string().optional(),
  language: z.string().optional()
});

// Query parameter schemas
export const bookingsQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  serviceId: z.string().min(1).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]).optional()
});

export const slotsQuerySchema = z.object({
  from: z.string().datetime("Neplatný formát data začátku"),
  to: z.string().datetime("Neplatný formát data konce"),
  serviceId: z.string().min(1, "Neplatné ID služby")
});
