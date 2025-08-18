import { apiRequest } from "./queryClient";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Auth API
export const authApi = {
  register: async (data: {
    organizationName: string;
    slug: string;
    email: string;
    password: string;
    timezone?: string;
    language?: string;
  }) => {
    const response = await apiRequest("POST", "/api/auth/register", data);
    return response.json();
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiRequest("POST", "/api/auth/login", data);
    return response.json();
  },

  logout: async () => {
    const response = await apiRequest("POST", "/api/auth/logout");
    return response.json();
  }
};

// Organization API
export const organizationApi = {
  get: async () => {
    const response = await apiRequest("GET", "/api/org");
    return response.json();
  },

  update: async (data: {
    name?: string;
    slug?: string;
    timezone?: string;
    language?: string;
  }) => {
    const response = await apiRequest("PATCH", "/api/org", data);
    return response.json();
  }
};

// Services API
export const servicesApi = {
  getAll: async () => {
    const response = await apiRequest("GET", "/api/services");
    return response.json();
  },

  create: async (data: {
    name: string;
    durationMin: number;
    priceCzk?: number;
    isActive?: boolean;
  }) => {
    const response = await apiRequest("POST", "/api/services", data);
    return response.json();
  },

  update: async (id: string, data: {
    name?: string;
    durationMin?: number;
    priceCzk?: number;
    isActive?: boolean;
  }) => {
    const response = await apiRequest("PATCH", `/api/services/${id}`, data);
    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/services/${id}`);
    return response.json();
  }
};

// Availability API
export const availabilityApi = {
  getAll: async () => {
    const response = await apiRequest("GET", "/api/availability");
    return response.json();
  },

  create: async (data: {
    weekday: number;
    startMinutes: number;
    endMinutes: number;
    slotStepMin: number;
  }) => {
    const response = await apiRequest("POST", "/api/availability", data);
    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/availability/${id}`);
    return response.json();
  }
};

// Blackouts API
export const blackoutsApi = {
  getAll: async () => {
    const response = await apiRequest("GET", "/api/blackouts");
    return response.json();
  },

  create: async (data: {
    startsAt: string;
    endsAt: string;
    reason?: string;
  }) => {
    const response = await apiRequest("POST", "/api/blackouts", data);
    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/blackouts/${id}`);
    return response.json();
  }
};

// Bookings API
export const bookingsApi = {
  getAll: async (params?: {
    from?: string;
    to?: string;
    serviceId?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    if (params?.serviceId) searchParams.set("serviceId", params.serviceId);
    if (params?.status) searchParams.set("status", params.status);
    
    const url = `/api/bookings${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  update: async (id: string, data: {
    status?: "PENDING" | "CONFIRMED" | "CANCELLED";
    note?: string;
  }) => {
    const response = await apiRequest("PATCH", `/api/bookings/${id}`, data);
    return response.json();
  },

  delete: async (id: string) => {
    const response = await apiRequest("DELETE", `/api/bookings/${id}`);
    return response.json();
  },

  exportCsv: async (params?: {
    from?: string;
    to?: string;
    serviceId?: string;
    status?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.from) searchParams.set("from", params.from);
    if (params?.to) searchParams.set("to", params.to);
    if (params?.serviceId) searchParams.set("serviceId", params.serviceId);
    if (params?.status) searchParams.set("status", params.status);
    
    const url = `/api/bookings/export.csv${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    const response = await apiRequest("GET", url);
    return response.blob();
  }
};

// Public API
export const publicApi = {
  getServices: async (orgSlug: string) => {
    const response = await fetch(`/api/public/${orgSlug}/services`);
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  },

  getSlots: async (orgSlug: string, params: {
    from: string;
    to: string;
    serviceId: string;
  }) => {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`/api/public/${orgSlug}/slots?${searchParams.toString()}`);
    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }
    return response.json();
  },

  createBooking: async (orgSlug: string, data: {
    serviceId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    note?: string;
    startsAt: string;
    endsAt: string;
  }) => {
    const response = await fetch(`/api/public/${orgSlug}/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new ApiError(response.status, error);
    }
    
    return response.json();
  }
};
