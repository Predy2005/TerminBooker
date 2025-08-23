export interface Organization {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  language: string;
  plan?: string;
  logoUrl?: string;
  businessAddress?: string;
  businessCity?: string;
  businessZip?: string;
  businessCountry?: string;
  businessIco?: string;
  businessDic?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  createdAt: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string;
  durationMin: number;
  priceCzk?: number;
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilityTemplate {
  id: string;
  organizationId: string;
  weekday: number;
  startMinutes: number;
  endMinutes: number;
  slotStepMin: number;
  createdAt: string;
}

export interface Blackout {
  id: string;
  organizationId: string;
  startsAt: string;
  endsAt: string;
  reason?: string;
}

export interface Booking {
  id: string;
  organizationId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  note?: string;
  startsAt: string;
  endsAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  service?: Service;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
}

export interface Invoice {
  id: string;
  organizationId: string;
  organizationName: string;
  amount: number;
  currency: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  dueDate: string;
  createdAt: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}
