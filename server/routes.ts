import type { Express } from "express";
import { createServer, type Server } from "http";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import { storage } from "./storage";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  setAuthCookie, 
  clearAuthCookie, 
  requireAuth 
} from "./lib/auth";
import { sendBookingConfirmation, sendBookingStatusChange } from "./lib/email";
import { billingService } from "./lib/billing";
import { generateTimeSlots } from "./lib/slots";
import { determinePaymentMode, createCheckoutSession, handleStripeWebhook } from "./lib/payments";
import {
  registerSchema,
  loginSchema,
  serviceSchema,
  availabilityTemplateSchema,
  blackoutSchema,
  publicBookingSchema,
  updateBookingSchema,
  updateOrganizationSchema,
  bookingsQuerySchema,
  slotsQuerySchema
} from "./lib/validation";
import { z } from "zod";
import crypto from "crypto";
import Stripe from "stripe";
import { 
  isDemoMode, 
  demoOrganization, 
  demoUser, 
  demoServices, 
  demoAvailability, 
  demoBookings, 
  demoBlackouts,
  demoPayments 
} from "./demoData";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-07-30.basil",
});

const checkoutRequestSchema = z.object({
  plan: z.enum(['PRO', 'BUSINESS'])
});

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6)
});

const validateTokenSchema = z.object({
  token: z.string()
});

import path from "path";

export async function registerRoutes(app: Express): Promise<Server> {
  const server = fastify({
    logger: process.env.NODE_ENV === "development"
  });

  // Register plugins
  await server.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "your-cookie-secret-change-in-production"
  });

  await server.register(fastifyCors, {
    origin: process.env.NODE_ENV === "development" 
      ? ["http://localhost:5000", "https://replit.dev"] 
      : true,
    credentials: true
  });

  await server.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute"
  });

  // Demo login endpoint
  server.post("/auth/demo", async (request, reply) => {
    // Simulate demo user login
    const token = generateToken({ 
      userId: demoUser.id, 
      organizationId: demoOrganization.id,
      email: demoUser.email
    });
    
    setAuthCookie(reply, token);
    
    return reply.send({ 
      message: "Demo přihlášení úspěšné",
      user: { id: demoUser.id, email: demoUser.email },
      organization: demoOrganization
    });
  });

  // Auth routes (without /api prefix since Express adds it)
  server.post("/auth/register", async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(data.email);
      if (existingUser) {
        return reply.status(400).send({ message: "Uživatel s tímto e-mailem již existuje" });
      }

      // Check if slug is available
      const existingOrg = await storage.getOrganizationBySlug(data.slug);
      if (existingOrg) {
        return reply.status(400).send({ message: "Tato URL adresa je již obsazena" });
      }

      // Create organization
      const organization = await storage.createOrganization({
        name: data.organizationName,
        slug: data.slug,
        timezone: data.timezone,
        language: data.language
      });

      // Create admin user
      const passwordHash = await hashPassword(data.password);
      const user = await storage.createUser({
        email: data.email,
        passwordHash,
        role: "ADMIN",
        organizationId: organization.id
      });

      // Generate token and set cookie
      const token = generateToken({
        userId: user.id,
        organizationId: organization.id,
        email: user.email
      });

      setAuthCookie(reply, token);

      return { message: "Registrace byla úspěšná", user: { id: user.id, email: user.email }, organization };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při registraci" });
    }
  });

  server.post("/auth/login", async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);
      
      const user = await storage.getUserByEmail(data.email);
      if (!user) {
        return reply.status(401).send({ message: "Neplatné přihlašovací údaje" });
      }

      const isValidPassword = await verifyPassword(user.passwordHash, data.password);
      if (!isValidPassword) {
        return reply.status(401).send({ message: "Neplatné přihlašovací údaje" });
      }

      const token = generateToken({
        userId: user.id,
        organizationId: user.organizationId,
        email: user.email
      });

      setAuthCookie(reply, token);

      return { message: "Přihlášení bylo úspěšné", user: { id: user.id, email: user.email } };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při přihlašování" });
    }
  });

  server.post("/auth/logout", async (request, reply) => {
    clearAuthCookie(reply);
    return { message: "Odhlášení bylo úspěšné" };
  });

  // Forgot password endpoint
  server.post("/auth/forgot-password", async (request, reply) => {
    try {
      const { email } = forgotPasswordSchema.parse(request.body);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not for security
        return reply.send({ success: true });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      
      // Store token
      await storage.storeResetToken(email, resetToken, expiresAt);

      // In a real app, send email here
      // For now, we'll log the reset URL to console
      const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/app/auth/reset-password?token=${resetToken}`;
      console.log(`Password reset URL for ${email}: ${resetUrl}`);

      reply.send({ success: true });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      reply.status(500).send({ message: "Něco se pokazilo" });
    }
  });

  // Validate reset token
  server.post("/auth/validate-reset-token", async (request, reply) => {
    try {
      const { token } = validateTokenSchema.parse(request.body);
      
      const email = await storage.validateResetToken(token);
      if (!email) {
        return reply.status(400).send({ message: "Neplatný nebo expirovaný token" });
      }

      reply.send({ valid: true });
    } catch (error: any) {
      console.error("Token validation error:", error);
      reply.status(400).send({ message: "Neplatný token" });
    }
  });

  // Reset password
  server.post("/auth/reset-password", async (request, reply) => {
    try {
      const { token, password } = resetPasswordSchema.parse(request.body);
      
      const email = await storage.validateResetToken(token);
      if (!email) {
        return reply.status(400).send({ message: "Neplatný nebo expirovaný token" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(password);
      
      // Update user password
      await storage.updateUserPassword(email, hashedPassword);
      
      // Consume/remove the token
      await storage.consumeResetToken(token);

      reply.send({ success: true });
    } catch (error: any) {
      console.error("Reset password error:", error);
      reply.status(500).send({ message: "Něco se pokazilo" });
    }
  });

  // Organization routes
  server.get("/org", async (request, reply) => {
    const user = await requireAuth(request, reply);
    
    // Return demo data for demo user
    if (user.userId === demoUser.id) {
      return demoOrganization;
    }
    
    const organization = await storage.getOrganization(user.organizationId);
    return organization;
  });

  server.patch("/org", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const data = updateOrganizationSchema.parse(request.body);
      
      if (data.slug) {
        const existingOrg = await storage.getOrganizationBySlug(data.slug);
        if (existingOrg && existingOrg.id !== user.organizationId) {
          return reply.status(400).send({ message: "Tato URL adresa je již obsazena" });
        }
      }

      const organization = await storage.updateOrganization(user.organizationId, data);
      return organization;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při aktualizaci organizace" });
    }
  });

  // Check if URL slug is available
  server.get("/org/check-slug/:slug", async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
      const user = await requireAuth(request, reply);
      
      // Check if slug exists and belongs to different organization
      const existingOrg = await storage.getOrganizationBySlug(slug);
      
      if (existingOrg && existingOrg.id !== user.organizationId) {
        return { available: false, message: "Tato URL adresa je již používána" };
      }
      
      return { available: true };
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při kontrole URL" });
    }
  });

  // Generate slug from organization name
  server.post("/org/generate-slug", async (request, reply) => {
    try {
      await requireAuth(request, reply);
      const { name } = request.body as { name: string };
      
      if (!name) {
        return reply.status(400).send({ message: "Název organizace je povinný" });
      }
      
      // Generate slug from name
      let baseSlug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/--+/g, '-') // Replace multiple hyphens with single
        .trim();
      
      // Remove Czech diacritics
      const diacriticsMap: { [key: string]: string } = {
        'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i', 'ň': 'n',
        'ó': 'o', 'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u', 'ů': 'u', 'ý': 'y', 'ž': 'z'
      };
      
      baseSlug = baseSlug.replace(/[áčďéěíňóřšťúůýž]/g, (match) => diacriticsMap[match] || match);
      
      // Check if slug is available, if not, add number
      let slug = baseSlug;
      let counter = 1;
      
      while (true) {
        const existing = await storage.getOrganizationBySlug(slug);
        if (!existing) break;
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return { slug };
    } catch (error: any) {
      console.error("Error generating slug:", error);
      return reply.status(400).send({ message: error.message || "Chyba při generování URL" });
    }
  });

  // Services routes
  server.get("/services", async (request, reply) => {
    const user = await requireAuth(request, reply);
    
    // Return demo data for demo user
    if (user.userId === demoUser.id) {
      return demoServices;
    }
    
    const services = await storage.getServices(user.organizationId);
    return services;
  });

  server.post("/services", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const data = serviceSchema.parse(request.body);
      
      const service = await storage.createService({
        ...data,
        organizationId: user.organizationId
      });
      
      return service;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při vytváření služby" });
    }
  });

  server.patch("/services/:id", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const { id } = request.params as { id: string };
      const data = serviceSchema.partial().parse(request.body);
      
      const service = await storage.updateService(id, data);
      return service;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při aktualizaci služby" });
    }
  });

  server.delete("/services/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    const { id } = request.params as { id: string };
    
    await storage.deleteService(id);
    return { message: "Služba byla smazána" };
  });

  // Availability routes
  server.get("/availability", async (request, reply) => {
    const user = await requireAuth(request, reply);
    
    // Return demo data for demo user
    if (user.userId === demoUser.id) {
      return demoAvailability;
    }
    
    const templates = await storage.getAvailabilityTemplates(user.organizationId);
    return templates;
  });

  server.post("/availability", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const data = availabilityTemplateSchema.parse(request.body);
      
      const template = await storage.createAvailabilityTemplate({
        ...data,
        organizationId: user.organizationId
      });
      
      return template;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při vytváření šablony dostupnosti" });
    }
  });

  server.delete("/availability/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    const { id } = request.params as { id: string };
    
    await storage.deleteAvailabilityTemplate(id);
    return { message: "Šablona dostupnosti byla smazána" };
  });

  // Blackouts routes
  server.get("/blackouts", async (request, reply) => {
    const user = await requireAuth(request, reply);
    
    // Return demo data for demo user
    if (user.userId === demoUser.id) {
      return demoBlackouts;
    }
    
    const blackouts = await storage.getBlackouts(user.organizationId);
    return blackouts;
  });

  server.post("/blackouts", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const data = blackoutSchema.parse(request.body);
      
      const blackout = await storage.createBlackout({
        ...data,
        organizationId: user.organizationId,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt)
      });
      
      return blackout;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při vytváření blokace" });
    }
  });

  server.delete("/blackouts/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    const { id } = request.params as { id: string };
    
    await storage.deleteBlackout(id);
    return { message: "Blokace byla smazána" };
  });

  // Public routes
  // Embed widget loader
  server.get("/embed.js", async (request, reply) => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const embedScript = await fs.readFile(path.join(process.cwd(), 'server', 'embed.js'), 'utf-8');
      
      reply
        .header('Content-Type', 'application/javascript')
        .header('Cache-Control', 'public, max-age=3600')
        .send(embedScript);
    } catch (error) {
      return reply.status(500).send('Embed script not found');
    }
  });

  server.get("/public/org/:orgSlug", async (request, reply) => {
    const { orgSlug } = request.params as { orgSlug: string };
    
    const organization = await storage.getOrganizationBySlug(orgSlug);
    if (!organization) {
      return reply.status(404).send({ message: "Organizace nebyla nalezena" });
    }
    
    return organization;
  });

  server.get("/public/:orgSlug/services", async (request, reply) => {
    const { orgSlug } = request.params as { orgSlug: string };
    
    const organization = await storage.getOrganizationBySlug(orgSlug);
    if (!organization) {
      return reply.status(404).send({ message: "Organizace nebyla nalezena" });
    }

    const services = await storage.getServices(organization.id);
    const activeServices = services.filter(s => s.isActive);
    
    return { organization, services: activeServices };
  });

  server.get("/public/:orgSlug/slots", async (request, reply) => {
    try {
      const { orgSlug } = request.params as { orgSlug: string };
      const query = slotsQuerySchema.parse(request.query);
      
      const organization = await storage.getOrganizationBySlug(orgSlug);
      if (!organization) {
        return reply.status(404).send({ message: "Organizace nebyla nalezena" });
      }

      const service = await storage.getService(query.serviceId);
      if (!service || service.organizationId !== organization.id) {
        return reply.status(404).send({ message: "Služba nebyla nalezena" });
      }

      const slots = await generateTimeSlots(
        organization.id,
        service,
        new Date(query.from),
        new Date(query.to),
        organization.timezone
      );

      return slots.filter(slot => slot.available);
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při načítání slotů" });
    }
  });

  // Rate-limited booking endpoint
  server.register(async function (fastify) {
    await fastify.register(fastifyRateLimit, {
      max: 5,
      timeWindow: "1 minute"
    });

    fastify.post("/public/:orgSlug/bookings", async (request, reply) => {
      try {
        const { orgSlug } = request.params as { orgSlug: string };
        const data = publicBookingSchema.parse(request.body);
        
        const organization = await storage.getOrganizationBySlug(orgSlug);
        if (!organization) {
          return reply.status(404).send({ message: "Organizace nebyla nalezena" });
        }

        const service = await storage.getService(data.serviceId);
        if (!service || service.organizationId !== organization.id) {
          return reply.status(404).send({ message: "Služba nebyla nalezena" });
        }

        const startsAt = new Date(data.startsAt);
        const endsAt = new Date(data.endsAt);

        // Check for conflicts
        const conflicts = await storage.getBookingConflicts(
          organization.id,
          startsAt,
          endsAt
        );

        if (conflicts.length > 0) {
          return reply.status(409).send({ message: "Tento termín je již obsazen" });
        }

        // Determine payment mode
        const paymentMode = determinePaymentMode(service, organization);
        
        let bookingStatus: "PENDING" | "CONFIRMED" = "PENDING";
        let paymentStatus = "UNPAID";
        let holdExpiresAt: Date | undefined;

        if (paymentMode === "REQUIRED") {
          paymentStatus = "REQUIRES_PAYMENT";
          holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes hold
        } else if (paymentMode === "OFF") {
          bookingStatus = "CONFIRMED";
        } else if (paymentMode === "OPTIONAL") {
          // For OPTIONAL: booking is CONFIRMED but customer can choose to pay
          bookingStatus = "CONFIRMED";
        }

        const booking = await storage.createBooking({
          organizationId: organization.id,
          serviceId: service.id,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          note: data.note,
          startsAt,
          endsAt,
          status: bookingStatus,
          paymentStatus,
          holdExpiresAt
        });

        // Send confirmation email
        try {
          await sendBookingConfirmation(
            booking.customerEmail,
            { ...booking, service },
            organization
          );
        } catch (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }

        return { 
          message: "Rezervace byla úspěšně vytvořena", 
          booking,
          paymentMode,
          requiresPayment: paymentMode === "REQUIRED",
          optionalPayment: paymentMode === "OPTIONAL"
        };
      } catch (error: any) {
        return reply.status(400).send({ message: error.message || "Chyba při vytváření rezervace" });
      }
    });

    // Payment checkout route
    fastify.post("/public/:orgSlug/bookings/:id/checkout", async (request, reply) => {
      try {
        const { orgSlug, id } = request.params as { orgSlug: string; id: string };
        
        const organization = await storage.getOrganizationBySlug(orgSlug);
        if (!organization) {
          return reply.status(404).send({ message: "Organizace nebyla nalezena" });
        }

        const booking = await storage.getBooking(id);
        if (!booking || booking.organizationId !== organization.id) {
          return reply.status(404).send({ message: "Rezervace nebyla nalezena" });
        }

        if (booking.paymentStatus !== "REQUIRES_PAYMENT" && booking.paymentStatus !== "UNPAID") {
          return reply.status(400).send({ message: "Rezervace nevyžaduje platbu nebo už byla zaplacena" });
        }

        const service = await storage.getService(booking.serviceId);
        if (!service) {
          return reply.status(404).send({ message: "Služba nebyla nalezena" });
        }

        const checkoutSession = await createCheckoutSession(booking, service, organization);
        return checkoutSession;
      } catch (error: any) {
        return reply.status(400).send({ message: error.message || "Chyba při vytváření platby" });
      }
    });
  });

  // Webhook route for booking payments
  server.post("/public/webhook/stripe", async (request, reply) => {
    try {
      const signature = request.headers['stripe-signature'] as string;
      const payload = request.body as string;
      
      await handleStripeWebhook(payload, signature);
      
      return { received: true };
    } catch (error: any) {
      console.error('Booking payment webhook error:', error);
      return reply.status(400).send({ message: error.message || "Webhook error" });
    }
  });

  // Admin bookings routes
  server.get("/bookings", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const query = bookingsQuerySchema.parse(request.query);
      
      // Return demo data for demo user
      if (user.userId === demoUser.id) {
        let filteredBookings = [...demoBookings];
        
        // Apply filters to demo data
        if (query.from) {
          const fromDate = new Date(query.from);
          filteredBookings = filteredBookings.filter(booking => new Date(booking.date) >= fromDate);
        }
        if (query.to) {
          const toDate = new Date(query.to);
          filteredBookings = filteredBookings.filter(booking => new Date(booking.date) <= toDate);
        }
        if (query.serviceId) {
          filteredBookings = filteredBookings.filter(booking => booking.serviceId === query.serviceId);
        }
        if (query.status) {
          filteredBookings = filteredBookings.filter(booking => booking.status === query.status);
        }
        
        return filteredBookings;
      }
      
      const filters: any = {};
      if (query.from) filters.from = new Date(query.from);
      if (query.to) filters.to = new Date(query.to);
      if (query.serviceId) filters.serviceId = query.serviceId;
      if (query.status) filters.status = query.status;

      const bookings = await storage.getBookings(user.organizationId, filters);
      return bookings;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při načítání rezervací" });
    }
  });

  server.patch("/bookings/:id", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const { id } = request.params as { id: string };
      const data = updateBookingSchema.parse(request.body);

      const booking = await storage.getBooking(id);
      if (!booking || booking.organizationId !== user.organizationId) {
        return reply.status(404).send({ message: "Rezervace nebyla nalezena" });
      }

      const oldStatus = booking.status;
      const updatedBooking = await storage.updateBooking(id, data);

      // Send status change email if status changed
      if (data.status && data.status !== oldStatus) {
        try {
          const service = await storage.getService(booking.serviceId);
          const organization = await storage.getOrganization(user.organizationId);
          
          if (service && organization) {
            await sendBookingStatusChange(
              booking.customerEmail,
              { ...updatedBooking, service },
              organization,
              data.status
            );
          }
        } catch (emailError) {
          console.error("Failed to send status change email:", emailError);
        }
      }

      return updatedBooking;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při aktualizaci rezervace" });
    }
  });

  server.delete("/bookings/:id", async (request, reply) => {
    const user = await requireAuth(request, reply);
    const { id } = request.params as { id: string };
    
    const booking = await storage.getBooking(id);
    if (!booking || booking.organizationId !== user.organizationId) {
      return reply.status(404).send({ message: "Rezervace nebyla nalezena" });
    }

    await storage.deleteBooking(id);
    return { message: "Rezervace byla zrušena" };
  });

  // CSV Export endpoint
  server.get("/bookings/export.csv", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const query = bookingsQuerySchema.parse(request.query);
      
      const filters: any = {};
      if (query.from) filters.from = new Date(query.from);
      if (query.to) filters.to = new Date(query.to);
      if (query.serviceId) filters.serviceId = query.serviceId;
      if (query.status) filters.status = query.status;

      const bookings = await storage.getBookings(user.organizationId, filters);
      
      // Create CSV content
      const headers = [
        "ID",
        "Zákazník",
        "E-mail",
        "Telefon",
        "Služba",
        "Začátek",
        "Konec",
        "Status",
        "Poznámka",
        "Vytvořeno"
      ];

      const csvRows = [
        headers.join(","),
        ...bookings.map(booking => [
          booking.id,
          `"${booking.customerName}"`,
          booking.customerEmail,
          booking.customerPhone || "",
          `"${booking.service.name}"`,
          booking.startsAt.toISOString(),
          booking.endsAt.toISOString(),
          booking.status,
          `"${booking.note || ""}"`,
          booking.createdAt.toISOString()
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");

      reply.header("Content-Type", "text/csv; charset=utf-8");
      reply.header("Content-Disposition", 'attachment; filename="rezervace.csv"');
      
      return csvContent;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při exportu" });
    }
  });

  // Billing routes
  // Stripe Connect - Create Connected Account
  server.post("/billing/connect/create", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const organization = await storage.getOrganization(user.organizationId);
      
      if (!organization) {
        return reply.status(404).send({ message: "Organizace nebyla nalezena" });
      }

      // Check if account already exists
      if (organization.stripeAccountId) {
        return reply.status(400).send({ message: "Stripe účet již existuje" });
      }

      // Prepare business information from organization data
      const businessInfo: any = {
        name: organization.name,
        url: `${request.protocol}://${request.headers.host}/booking/${organization.slug}`,
        mcc: '7298', // Other Services
        product_description: 'Rezervační služby'
      };

      // Add business address if available
      if (organization.businessAddress && organization.businessCity && organization.businessZip && organization.businessCountry) {
        businessInfo.support_address = {
          line1: organization.businessAddress,
          city: organization.businessCity,
          postal_code: organization.businessZip,
          country: organization.businessCountry
        };
      }

      // Add phone if available
      if (organization.businessPhone) {
        businessInfo.support_phone = organization.businessPhone;
      }

      // Create Stripe Express account with business information
      const accountData: any = {
        type: 'express',
        country: organization.businessCountry || 'CZ',
        business_type: organization.businessIco ? 'company' : 'individual',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: businessInfo,
        metadata: {
          organization_id: organization.id,
          organization_name: organization.name,
          business_ico: organization.businessIco || '',
          business_dic: organization.businessDic || ''
        }
      };

      // Add company information if available (for business accounts)
      if (organization.businessIco) {
        accountData.company = {
          name: organization.name
        };
        
        if (organization.businessIco) {
          accountData.company.tax_id = organization.businessIco;
        }

        if (organization.businessAddress && organization.businessCity && organization.businessZip && organization.businessCountry) {
          accountData.company.address = {
            line1: organization.businessAddress,
            city: organization.businessCity,
            postal_code: organization.businessZip,
            country: organization.businessCountry
          };
        }

        if (organization.businessPhone) {
          accountData.company.phone = organization.businessPhone;
        }
      }

      const account = await stripe.accounts.create(accountData);

      // Update organization with account ID
      await storage.updateOrganizationStripeAccount(organization.id, account.id);

      // Create account link for onboarding
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        return_url: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5000'}/app/billing/connect/success`,
        refresh_url: `${process.env.PUBLIC_BASE_URL || 'http://localhost:5000'}/app/billing/connect/refresh`,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    } catch (error: any) {
      console.error("Connect create error:", error);
      return reply.status(500).send({ message: "Chyba při vytváření Stripe účtu" });
    }
  });

  // Stripe Connect Webhooks
  server.post("/billing/connect/webhook", async (request, reply) => {
    try {
      const sig = request.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_CONNECT;
      
      if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET_CONNECT");
        return reply.status(400).send({ message: "Webhook secret not configured" });
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent(request.body as Buffer, sig, webhookSecret);
      } catch (err) {
        console.error("Webhook signature verification failed", err);
        return reply.status(400).send({ message: "Webhook signature verification failed" });
      }

      if (event.type === 'account.updated') {
        const account = event.data.object as Stripe.Account;
        
        // Find organization by stripe account ID
        const organization = await storage.getOrganizationByStripeAccount(account.id);
        if (!organization) {
          console.warn(`Organization not found for account ${account.id}`);
          return reply.send({ received: true });
        }

        // Determine onboarding status
        let status = 'pending';
        if (account.charges_enabled && account.payouts_enabled) {
          status = 'active';
        } else if (account.requirements?.currently_due?.length === 0) {
          status = 'restricted';
        }

        // Update status
        await storage.updateOrganizationOnboardingStatus(organization.id, status);
        
        console.log(`Updated organization ${organization.id} onboarding status to: ${status}`);
      }

      return { received: true };
    } catch (error: any) {
      console.error("Connect webhook error:", error);
      return reply.status(500).send({ message: "Webhook processing failed" });
    }
  });

  server.post("/billing/checkout", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const { plan } = checkoutRequestSchema.parse(request.body);
      
      const successUrl = `${request.protocol}://${request.headers.host}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${request.protocol}://${request.headers.host}/pricing`;
      
      const result = await billingService.createCheckoutSession(
        user.organizationId,
        plan,
        successUrl,
        cancelUrl
      );
      
      return result;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při vytváření platby" });
    }
  });

  server.post("/billing/webhook", async (request, reply) => {
    try {
      const signature = request.headers['stripe-signature'] as string;
      const payload = request.body as string;
      
      await billingService.handleWebhook(payload, signature);
      
      return { received: true };
    } catch (error: any) {
      console.error('Webhook error:', error);
      return reply.status(400).send({ message: error.message || "Webhook error" });
    }
  });

  server.get("/billing/status", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const status = await billingService.getBillingStatus(user.organizationId);
      return status;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při načítání stavu plateb" });
    }
  });

  server.get("/billing/portal", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const returnUrl = `${request.protocol}://${request.headers.host}/pricing`;
      const result = await billingService.createPortalSession(user.organizationId, returnUrl);
      return result;
    } catch (error: any) {
      return reply.status(400).send({ message: error.message || "Chyba při vytváření portálu" });
    }
  });

  // Object storage routes
  server.get("/public-objects/*", async (request, reply) => {
    const filePath = (request.params as any)['*'];
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return reply.status(404).send({ message: "File not found" });
      }
      await objectStorageService.downloadObject(file, reply.raw as any);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  });

  server.post("/objects/upload", async (request, reply) => {
    try {
      await requireAuth(request, reply);
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      return { uploadURL };
    } catch (error: any) {
      return reply.status(500).send({ message: error.message || "Error getting upload URL" });
    }
  });

  server.put("/logo", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const { logoURL } = request.body as { logoURL: string };
      
      if (!logoURL) {
        return reply.status(400).send({ message: "logoURL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(logoURL);
      
      // Update organization with logo URL
      await storage.updateOrganization(user.organizationId, { logoUrl: objectPath });
      
      return { logoUrl: objectPath };
    } catch (error: any) {
      console.error("Error setting logo:", error);
      return reply.status(500).send({ message: "Internal server error" });
    }
  });

  // Forward all other requests to Fastify
  app.use("/api", (req, res, next) => {
    server.inject({
      method: req.method as any,
      url: req.url,
      headers: req.headers as any,
      payload: req.body
    }, (err, response) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
      
      if (!response) {
        return res.status(500).json({ message: "No response from server" });
      }
      
      res.status(response.statusCode);
      
      // Set headers
      if (response.headers) {
        Object.entries(response.headers).forEach(([key, value]) => {
          if (value) {
            res.setHeader(key, value as string);
          }
        });
      }
      
      res.send(response.payload);
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
