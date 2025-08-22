import { z } from "zod";

// Super Admin Analytics & Statistics
export const analyticsSchema = z.object({
  totalOrganizations: z.number(),
  activeOrganizations: z.number(),
  totalUsers: z.number(),
  totalBookings: z.number(),
  totalRevenue: z.number(),
  monthlyStats: z.array(z.object({
    month: z.string(),
    organizations: z.number(),
    bookings: z.number(),
    revenue: z.number()
  }))
});

// Organization Management
export const organizationFilterSchema = z.object({
  status: z.enum(["all", "active", "inactive", "trial", "paid"]).optional(),
  plan: z.enum(["all", "free", "basic", "pro", "enterprise"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "created", "revenue", "bookings"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional()
});

// Billing Management
export const billingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  currency: z.string().default("CZK"),
  interval: z.enum(["month", "year"]),
  features: z.array(z.string()),
  maxServices: z.number().nullable(),
  maxBookings: z.number().nullable(),
  stripePriceId: z.string().optional()
});

export const invoiceSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  organizationName: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  dueDate: z.string(),
  createdAt: z.string(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
    total: z.number()
  }))
});

// Audit Log
export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userEmail: z.string(),
  organizationId: z.string().optional(),
  organizationName: z.string().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string(),
  userAgent: z.string(),
  timestamp: z.string()
});

// User Impersonation
export const impersonationSchema = z.object({
  targetUserId: z.string(),
  reason: z.string().min(10, "Důvod musí mít alespoň 10 znaků")
});

export type Analytics = z.infer<typeof analyticsSchema>;
export type OrganizationFilter = z.infer<typeof organizationFilterSchema>;
export type BillingPlan = z.infer<typeof billingPlanSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type AuditLog = z.infer<typeof auditLogSchema>;
export type ImpersonationRequest = z.infer<typeof impersonationSchema>;