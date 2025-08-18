import { 
  organizations, users, services, availabilityTemplates, blackouts, bookings,
  type Organization, type InsertOrganization,
  type User, type InsertUser,
  type Service, type InsertService,
  type AvailabilityTemplate, type InsertAvailabilityTemplate,
  type Blackout, type InsertBlackout,
  type Booking, type InsertBooking,
  type BookingStatus
} from "@shared/schema";
import { db } from "./db";
import { eq, and, between, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  getOrganizationBySlug(slug: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  updateOrganization(id: string, org: Partial<InsertOrganization>): Promise<Organization>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Services
  getServices(organizationId: string): Promise<Service[]>;
  getService(id: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service>;
  deleteService(id: string): Promise<void>;

  // Availability Templates
  getAvailabilityTemplates(organizationId: string): Promise<AvailabilityTemplate[]>;
  createAvailabilityTemplate(template: InsertAvailabilityTemplate): Promise<AvailabilityTemplate>;
  deleteAvailabilityTemplate(id: string): Promise<void>;

  // Blackouts
  getBlackouts(organizationId: string): Promise<Blackout[]>;
  createBlackout(blackout: InsertBlackout): Promise<Blackout>;
  deleteBlackout(id: string): Promise<void>;

  // Bookings
  getBookings(organizationId: string, filters?: {
    from?: Date;
    to?: Date;
    serviceId?: string;
    status?: BookingStatus;
  }): Promise<(Booking & { service: Service })[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking>;
  deleteBooking(id: string): Promise<void>;
  getBookingConflicts(organizationId: string, startsAt: Date, endsAt: Date, excludeBookingId?: string): Promise<Booking[]>;
}

export class DatabaseStorage implements IStorage {
  // Organizations
  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.slug, slug));
    return org || undefined;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [created] = await db.insert(organizations).values(org).returning();
    return created;
  }

  async updateOrganization(id: string, org: Partial<InsertOrganization>): Promise<Organization> {
    const [updated] = await db
      .update(organizations)
      .set({ ...org, updatedAt: new Date() })
      .where(eq(organizations.id, id))
      .returning();
    return updated;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  // Services
  async getServices(organizationId: string): Promise<Service[]> {
    return db.select().from(services)
      .where(eq(services.organizationId, organizationId))
      .orderBy(asc(services.createdAt));
  }

  async getService(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(service: InsertService): Promise<Service> {
    const [created] = await db.insert(services).values(service).returning();
    return created;
  }

  async updateService(id: string, service: Partial<InsertService>): Promise<Service> {
    const [updated] = await db
      .update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<void> {
    await db.delete(services).where(eq(services.id, id));
  }

  // Availability Templates
  async getAvailabilityTemplates(organizationId: string): Promise<AvailabilityTemplate[]> {
    return db.select().from(availabilityTemplates)
      .where(eq(availabilityTemplates.organizationId, organizationId))
      .orderBy(asc(availabilityTemplates.weekday));
  }

  async createAvailabilityTemplate(template: InsertAvailabilityTemplate): Promise<AvailabilityTemplate> {
    const [created] = await db.insert(availabilityTemplates).values(template).returning();
    return created;
  }

  async deleteAvailabilityTemplate(id: string): Promise<void> {
    await db.delete(availabilityTemplates).where(eq(availabilityTemplates.id, id));
  }

  // Blackouts
  async getBlackouts(organizationId: string): Promise<Blackout[]> {
    return db.select().from(blackouts)
      .where(eq(blackouts.organizationId, organizationId))
      .orderBy(asc(blackouts.startsAt));
  }

  async createBlackout(blackout: InsertBlackout): Promise<Blackout> {
    const [created] = await db.insert(blackouts).values(blackout).returning();
    return created;
  }

  async deleteBlackout(id: string): Promise<void> {
    await db.delete(blackouts).where(eq(blackouts.id, id));
  }

  // Bookings
  async getBookings(organizationId: string, filters?: {
    from?: Date;
    to?: Date;
    serviceId?: string;
    status?: BookingStatus;
  }): Promise<(Booking & { service: Service })[]> {
    let query = db.select({
      ...bookings,
      service: services
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .where(eq(bookings.organizationId, organizationId));

    if (filters?.from && filters?.to) {
      query = query.where(
        and(
          eq(bookings.organizationId, organizationId),
          between(bookings.startsAt, filters.from, filters.to)
        )
      );
    }

    if (filters?.serviceId) {
      query = query.where(
        and(
          eq(bookings.organizationId, organizationId),
          eq(bookings.serviceId, filters.serviceId)
        )
      );
    }

    if (filters?.status) {
      query = query.where(
        and(
          eq(bookings.organizationId, organizationId),
          eq(bookings.status, filters.status)
        )
      );
    }

    const results = await query.orderBy(desc(bookings.createdAt));
    return results.map(row => ({
      ...row.bookings,
      service: row.service
    }));
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [created] = await db.insert(bookings).values(booking).returning();
    return created;
  }

  async updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking> {
    const [updated] = await db
      .update(bookings)
      .set({ ...booking, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async deleteBooking(id: string): Promise<void> {
    await db.delete(bookings).where(eq(bookings.id, id));
  }

  async getBookingConflicts(organizationId: string, startsAt: Date, endsAt: Date, excludeBookingId?: string): Promise<Booking[]> {
    let query = db.select().from(bookings)
      .where(
        and(
          eq(bookings.organizationId, organizationId),
          // Check for overlapping time slots
          // (startsAt < endsAt AND endsAt > startsAt)
          and(
            eq(bookings.startsAt, startsAt), // Exact match for unique constraint
            eq(bookings.endsAt, endsAt)
          )
        )
      );

    if (excludeBookingId) {
      query = query.where(
        and(
          eq(bookings.organizationId, organizationId),
          eq(bookings.startsAt, startsAt),
          eq(bookings.endsAt, endsAt)
        )
      );
    }

    return query;
  }
}

export const storage = new DatabaseStorage();
