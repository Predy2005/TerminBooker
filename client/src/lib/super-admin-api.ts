import { apiRequest } from "@/lib/queryClient";

export const superAdminApi = {
  // Analytics
  getAnalytics: async () => {
    const response = await fetch("/api/super-admin/analytics");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Organizations
  getOrganizations: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/super-admin/organizations?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  updateOrganization: async (id: string, data: any) => {
    return apiRequest("PATCH", `/super-admin/organizations/${id}`, data);
  },

  deactivateOrganization: async (id: string, reason: string) => {
    return apiRequest("POST", `/super-admin/organizations/${id}/deactivate`, { reason });
  },

  activateOrganization: async (id: string) => {
    return apiRequest("POST", `/super-admin/organizations/${id}/activate`, {});
  },

  // Users
  getUsers: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/super-admin/users?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  updateUser: async (id: string, data: any) => {
    return apiRequest("PATCH", `/super-admin/users/${id}`, data);
  },

  impersonateUser: async ({ targetUserId, reason }: { targetUserId: string; reason: string }) => {
    return apiRequest("POST", `/super-admin/impersonate`, { targetUserId, reason });
  },

  // Services
  getServices: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/super-admin/services?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Bookings
  getBookings: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/super-admin/bookings?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Billing
  getBillingPlans: async () => {
    const response = await fetch("/api/super-admin/billing/plans");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  createBillingPlan: async (data: any) => {
    return apiRequest("POST", "/super-admin/billing/plans", data);
  },

  getInvoices: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/super-admin/billing/invoices?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  createInvoice: async (data: any) => {
    return apiRequest("POST", "/super-admin/billing/invoices", data);
  },

  // Audit
  getAuditLogs: async (filters: any) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.append(key, String(value));
      }
    });
    
    const response = await fetch(`/api/super-admin/audit?${params}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },

  // Export
  exportOrganizations: async () => {
    const response = await fetch("/api/super-admin/organizations/export");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.blob();
  },

  exportBookings: async () => {
    const response = await fetch("/api/super-admin/bookings/export");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.blob();
  }
};