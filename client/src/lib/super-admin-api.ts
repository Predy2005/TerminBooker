import { apiRequest } from "./queryClient";
import type { Analytics, OrganizationFilter, BillingPlan, Invoice, AuditLog, ImpersonationRequest } from "@shared/super-admin-schema";

export const superAdminApi = {
  // Analytics & Dashboard
  getAnalytics: async (): Promise<Analytics> => {
    const response = await apiRequest("GET", "/api/super-admin/analytics");
    return response.json();
  },

  // Organization Management
  getOrganizations: async (filters?: OrganizationFilter) => {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.set("status", filters.status);
    if (filters?.plan) searchParams.set("plan", filters.plan);
    if (filters?.search) searchParams.set("search", filters.search);
    if (filters?.sortBy) searchParams.set("sortBy", filters.sortBy);
    if (filters?.sortOrder) searchParams.set("sortOrder", filters.sortOrder);
    
    const url = `/api/super-admin/organizations${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  updateOrganization: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/super-admin/organizations/${id}`, data);
    return response.json();
  },

  deactivateOrganization: async (id: string, reason: string) => {
    const response = await apiRequest("POST", `/api/super-admin/organizations/${id}/deactivate`, { reason });
    return response.json();
  },

  activateOrganization: async (id: string) => {
    const response = await apiRequest("POST", `/api/super-admin/organizations/${id}/activate`);
    return response.json();
  },

  // User Management
  getUsers: async (filters?: { organizationId?: string; search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (filters?.organizationId) searchParams.set("organizationId", filters.organizationId);
    if (filters?.search) searchParams.set("search", filters.search);
    if (filters?.status) searchParams.set("status", filters.status);
    
    const url = `/api/super-admin/users${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  updateUser: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/super-admin/users/${id}`, data);
    return response.json();
  },

  impersonateUser: async (request: ImpersonationRequest) => {
    const response = await apiRequest("POST", "/api/super-admin/impersonate", request);
    return response.json();
  },

  stopImpersonation: async () => {
    const response = await apiRequest("POST", "/api/super-admin/stop-impersonation");
    return response.json();
  },

  // Service & Data Management
  getServices: async (organizationId?: string) => {
    const url = organizationId 
      ? `/api/super-admin/services?organizationId=${organizationId}`
      : "/api/super-admin/services";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  updateService: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/super-admin/services/${id}`, data);
    return response.json();
  },

  deleteService: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/super-admin/services/${id}`);
    return response.json();
  },

  getBookings: async (filters?: { 
    organizationId?: string; 
    from?: string; 
    to?: string; 
    status?: string;
    serviceId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (filters?.organizationId) searchParams.set("organizationId", filters.organizationId);
    if (filters?.from) searchParams.set("from", filters.from);
    if (filters?.to) searchParams.set("to", filters.to);
    if (filters?.status) searchParams.set("status", filters.status);
    if (filters?.serviceId) searchParams.set("serviceId", filters.serviceId);
    
    const url = `/api/super-admin/bookings${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  updateBooking: async (id: string, data: any) => {
    const response = await apiRequest("PATCH", `/api/super-admin/bookings/${id}`, data);
    return response.json();
  },

  deleteBooking: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/super-admin/bookings/${id}`);
    return response.json();
  },

  // Billing Management
  getBillingPlans: async (): Promise<BillingPlan[]> => {
    const response = await apiRequest("GET", "/api/super-admin/billing/plans");
    return response.json();
  },

  createBillingPlan: async (plan: Omit<BillingPlan, "id">) => {
    const response = await apiRequest("POST", "/api/super-admin/billing/plans", plan);
    return response.json();
  },

  updateBillingPlan: async (id: string, plan: Partial<BillingPlan>) => {
    const response = await apiRequest("PATCH", `/api/super-admin/billing/plans/${id}`, plan);
    return response.json();
  },

  getInvoices: async (filters?: { 
    organizationId?: string; 
    status?: string; 
    from?: string; 
    to?: string; 
  }): Promise<Invoice[]> => {
    const searchParams = new URLSearchParams();
    if (filters?.organizationId) searchParams.set("organizationId", filters.organizationId);
    if (filters?.status) searchParams.set("status", filters.status);
    if (filters?.from) searchParams.set("from", filters.from);
    if (filters?.to) searchParams.set("to", filters.to);
    
    const url = `/api/super-admin/billing/invoices${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  generateInvoice: async (organizationId: string, data: {
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
    }>;
    dueDate: string;
  }) => {
    const response = await apiRequest("POST", "/api/super-admin/billing/invoices", {
      organizationId,
      ...data
    });
    return response.json();
  },

  // Audit & Security
  getAuditLogs: async (filters?: {
    userId?: string;
    organizationId?: string;
    action?: string;
    from?: string;
    to?: string;
    limit?: number;
  }): Promise<AuditLog[]> => {
    const searchParams = new URLSearchParams();
    if (filters?.userId) searchParams.set("userId", filters.userId);
    if (filters?.organizationId) searchParams.set("organizationId", filters.organizationId);
    if (filters?.action) searchParams.set("action", filters.action);
    if (filters?.from) searchParams.set("from", filters.from);
    if (filters?.to) searchParams.set("to", filters.to);
    if (filters?.limit) searchParams.set("limit", filters.limit.toString());
    
    const url = `/api/super-admin/audit${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  // Export Functions
  exportOrganizations: async (filters?: OrganizationFilter) => {
    const searchParams = new URLSearchParams();
    if (filters?.status) searchParams.set("status", filters.status);
    if (filters?.plan) searchParams.set("plan", filters.plan);
    if (filters?.search) searchParams.set("search", filters.search);
    
    const url = `/api/super-admin/organizations/export${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.blob();
  },

  exportBookings: async (filters?: { 
    organizationId?: string; 
    from?: string; 
    to?: string; 
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (filters?.organizationId) searchParams.set("organizationId", filters.organizationId);
    if (filters?.from) searchParams.set("from", filters.from);
    if (filters?.to) searchParams.set("to", filters.to);
    if (filters?.status) searchParams.set("status", filters.status);
    
    const url = `/api/super-admin/bookings/export${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.blob();
  }
};