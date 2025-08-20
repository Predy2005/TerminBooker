import type { Express } from "express";
import { createServer, type Server } from "http";
import fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import fastifyCors from "@fastify/cors";
import { storage } from "./storage";
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  setAuthCookie, 
  clearAuthCookie, 
  requireAuth 
} from "./lib/auth";
import { sendBookingConfirmation, sendBookingStatusChange } from "./lib/email";
import { generateTimeSlots } from "./lib/slots";
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

  // Organization routes
  server.get("/org", async (request, reply) => {
    const user = await requireAuth(request, reply);
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

  // Services routes
  server.get("/services", async (request, reply) => {
    const user = await requireAuth(request, reply);
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

        const booking = await storage.createBooking({
          organizationId: organization.id,
          serviceId: service.id,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          note: data.note,
          startsAt,
          endsAt,
          status: "PENDING"
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

        return { message: "Rezervace byla úspěšně vytvořena", booking };
      } catch (error: any) {
        return reply.status(400).send({ message: error.message || "Chyba při vytváření rezervace" });
      }
    });
  });

  // Admin bookings routes
  server.get("/bookings", async (request, reply) => {
    try {
      const user = await requireAuth(request, reply);
      const query = bookingsQuerySchema.parse(request.query);
      
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
