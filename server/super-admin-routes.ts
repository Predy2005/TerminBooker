import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

// Demo Super Admin Data
const demoAnalytics = {
  totalOrganizations: 47,
  activeOrganizations: 42,
  totalUsers: 89,
  totalBookings: 2847,
  totalRevenue: 1245670,
  monthlyStats: Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    return {
      month: format(startOfMonth(date), 'yyyy-MM'),
      organizations: 40 + i * 2,
      bookings: 380 + i * 45,
      revenue: 180000 + i * 32000
    };
  })
};

const demoOrganizations = [
  {
    id: "org-1",
    name: "Salon Krása",
    slug: "salon-krasa",
    email: "info@salonkrasa.cz",
    phone: "+420 777 123 456",
    address: "Václavské náměstí 1, Praha 1",
    website: "https://salonkrasa.cz",
    status: "active",
    plan: "pro",
    createdAt: "2024-01-15T10:00:00Z",
    totalBookings: 847,
    totalRevenue: 425600,
    businessVerified: true,
    ico: "12345678",
    stripeAccountId: "acct_demo123"
  },
  {
    id: "org-2", 
    name: "Fitness Studio Active",
    slug: "fitness-active",
    email: "rezervace@fitnessactive.cz",
    phone: "+420 666 789 123",
    address: "Karlova 25, Brno",
    website: "https://fitnessactive.cz",
    status: "active",
    plan: "basic",
    createdAt: "2024-02-20T14:30:00Z",
    totalBookings: 1245,
    totalRevenue: 312500,
    businessVerified: true,
    ico: "87654321",
    stripeAccountId: "acct_demo456"
  },
  {
    id: "org-3",
    name: "Veterinární klinika Zdraví",
    slug: "vet-zdravi",
    email: "info@vetzdravi.cz",
    phone: "+420 555 444 333",
    address: "Masarykova 15, Ostrava",
    website: "https://vetzdravi.cz",
    status: "trial",
    plan: "free",
    createdAt: "2024-08-10T09:15:00Z",
    totalBookings: 89,
    totalRevenue: 0,
    businessVerified: false,
    ico: "11223344",
    stripeAccountId: null
  }
];

const demoUsers = [
  {
    id: "user-1",
    email: "admin@salonkrasa.cz",
    username: "Jana Nováková",
    organizationId: "org-1",
    organizationName: "Salon Krása",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLoginAt: "2025-08-22T08:30:00Z"
  },
  {
    id: "user-2",
    email: "trenka@fitnessactive.cz", 
    username: "Petr Svoboda",
    organizationId: "org-2",
    organizationName: "Fitness Studio Active",
    role: "admin",
    status: "active", 
    createdAt: "2024-02-20T14:30:00Z",
    lastLoginAt: "2025-08-21T19:45:00Z"
  },
  {
    id: "user-3",
    email: "vet@zdravi.cz",
    username: "Dr. Marie Svobodová",
    organizationId: "org-3", 
    organizationName: "Veterinární klinika Zdraví",
    role: "admin",
    status: "pending",
    createdAt: "2024-08-10T09:15:00Z",
    lastLoginAt: null
  }
];

const demoBillingPlans = [
  {
    id: "plan-free",
    name: "Zdarma",
    price: 0,
    currency: "CZK",
    interval: "month",
    features: ["До 50 rezervací/měsíc", "1 služba", "Základní podpora"],
    maxServices: 1,
    maxBookings: 50,
    stripePriceId: null
  },
  {
    id: "plan-basic", 
    name: "Základní",
    price: 299,
    currency: "CZK",
    interval: "month",
    features: ["До 200 rezervací/měsíc", "5 služeb", "Email podpora", "Kalendář"],
    maxServices: 5,
    maxBookings: 200,
    stripePriceId: "price_basic123"
  },
  {
    id: "plan-pro",
    name: "Pro", 
    price: 599,
    currency: "CZK",
    interval: "month",
    features: ["Neomezené rezervace", "Neomezené služby", "Prioritní podpora", "Platby", "Statistiky"],
    maxServices: null,
    maxBookings: null,
    stripePriceId: "price_pro456"
  }
];

const demoInvoices = [
  {
    id: "inv-1",
    organizationId: "org-1",
    organizationName: "Salon Krása",
    amount: 599,
    currency: "CZK",
    status: "paid",
    dueDate: "2025-09-01T00:00:00Z",
    createdAt: "2025-08-01T10:00:00Z",
    paidAt: "2025-08-01T14:30:00Z",
    items: [
      { description: "Pro plán - srpen 2025", quantity: 1, unitPrice: 599, total: 599 }
    ]
  },
  {
    id: "inv-2",
    organizationId: "org-2",
    organizationName: "Fitness Studio Active", 
    amount: 299,
    currency: "CZK",
    status: "sent",
    dueDate: "2025-09-05T00:00:00Z",
    createdAt: "2025-08-05T12:00:00Z",
    paidAt: null,
    items: [
      { description: "Základní plán - srpen 2025", quantity: 1, unitPrice: 299, total: 299 }
    ]
  },
  {
    id: "inv-3",
    organizationId: "org-3",
    organizationName: "Veterinární klinika Zdraví",
    amount: 0,
    currency: "CZK", 
    status: "paid",
    dueDate: "2025-09-10T00:00:00Z",
    createdAt: "2025-08-10T09:15:00Z",
    paidAt: "2025-08-10T09:15:00Z",
    items: [
      { description: "Zdarma plán - srpen 2025", quantity: 1, unitPrice: 0, total: 0 }
    ]
  }
];

const demoBookingPayments = [
  {
    id: "payment-1",
    organizationId: "org-1",
    organizationName: "Salon Krása",
    bookingId: "booking-1",
    serviceName: "Střih a foukaná",
    customerName: "Anna Nováková",
    customerEmail: "anna.novakova@email.cz",
    amount: 800,
    currency: "CZK",
    status: "completed",
    paymentDate: "2025-08-22T10:00:00Z",
    paymentMethod: "card",
    stripeChargeId: "ch_demo123",
    platformFee: 32, // 4% platform fee
    organizationReceived: 768
  },
  {
    id: "payment-2", 
    organizationId: "org-2",
    organizationName: "Fitness Studio Active",
    bookingId: "booking-2",
    serviceName: "Osobní trénink",
    customerName: "Pavel Dvořák",
    customerEmail: "pavel.dvorak@email.cz",
    amount: 600,
    currency: "CZK",
    status: "pending",
    paymentDate: null,
    paymentMethod: null,
    stripeChargeId: null,
    platformFee: 0,
    organizationReceived: 0
  },
  {
    id: "payment-3",
    organizationId: "org-1", 
    organizationName: "Salon Krása",
    bookingId: "booking-3",
    serviceName: "Barva + foukaná",
    customerName: "Marie Svobodová",
    customerEmail: "marie.svobodova@email.cz",
    amount: 1200,
    currency: "CZK",
    status: "completed",
    paymentDate: "2025-08-21T14:30:00Z",
    paymentMethod: "card",
    stripeChargeId: "ch_demo456",
    platformFee: 48, // 4% platform fee
    organizationReceived: 1152
  },
  {
    id: "payment-4",
    organizationId: "org-2",
    organizationName: "Fitness Studio Active", 
    bookingId: "booking-4",
    serviceName: "Skupinový trénink",
    customerName: "Tomáš Novák",
    customerEmail: "tomas.novak@email.cz",
    amount: 300,
    currency: "CZK",
    status: "completed",
    paymentDate: "2025-08-20T18:00:00Z",
    paymentMethod: "card",
    stripeChargeId: "ch_demo789",
    platformFee: 12, // 4% platform fee  
    organizationReceived: 288
  }
];

const demoAuditLogs = [
  {
    id: "audit-1",
    userId: "user-1",
    userEmail: "admin@salonkrasa.cz", 
    organizationId: "org-1",
    organizationName: "Salon Krása",
    action: "login",
    resource: "auth",
    resourceId: null,
    details: { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: "2025-08-22T08:30:00Z"
  },
  {
    id: "audit-2",
    userId: "user-2",
    userEmail: "trenka@fitnessactive.cz",
    organizationId: "org-2", 
    organizationName: "Fitness Studio Active",
    action: "create",
    resource: "booking",
    resourceId: "booking-xyz",
    details: { customerEmail: "zakaznik@email.cz", serviceName: "Osobní trénink" },
    ipAddress: "10.0.0.45",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    timestamp: "2025-08-21T19:45:00Z"
  },
  {
    id: "audit-3",
    userId: "super-admin",
    userEmail: "admin@bookli.cz",
    organizationId: null,
    organizationName: null,
    action: "impersonate",
    resource: "user",
    resourceId: "user-1",
    details: { reason: "Podpora zákazníka - řešení problému s platbami", targetEmail: "admin@salonkrasa.cz" },
    ipAddress: "203.0.113.10",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    timestamp: "2025-08-20T14:20:00Z"
  }
];

export async function registerSuperAdminRoutes(fastify: FastifyInstance) {
  // Analytics endpoint
  fastify.get("/admin/analytics", async (request, reply) => {
    return demoAnalytics;
  });

  // Organizations management 
  fastify.get("/admin/orgs", async (request, reply) => {
    const { status, plan, search, sortBy, sortOrder } = request.query as any;
    
    let filtered = [...demoOrganizations];
    
    if (status && status !== "all") {
      filtered = filtered.filter(org => org.status === status);
    }
    
    if (plan && plan !== "all") {
      filtered = filtered.filter(org => org.plan === plan);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(org => 
        org.name.toLowerCase().includes(searchLower) ||
        org.email.toLowerCase().includes(searchLower) ||
        org.slug.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort results
    if (sortBy) {
      filtered.sort((a, b) => {
        let aVal, bVal;
        switch (sortBy) {
          case "name":
            aVal = a.name;
            bVal = b.name;
            break;
          case "created":
            aVal = a.createdAt;
            bVal = b.createdAt;
            break;
          case "revenue":
            aVal = a.totalRevenue;
            bVal = b.totalRevenue;
            break;
          case "bookings":
            aVal = a.totalBookings;
            bVal = b.totalBookings;
            break;
          default:
            return 0;
        }
        
        if (sortOrder === "desc") {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }
    
    return filtered;
  });

  fastify.patch("/admin/orgs/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body;
    
    // In real implementation, this would update the database
    return { success: true, message: "Organizace byla aktualizována" };
  });

  fastify.post("/admin/orgs/:id/status", async (request, reply) => {
    const { id } = request.params as { id: string };
    const { reason } = request.body as { reason: string };
    
    // In real implementation, this would update the database and log the action
    return { success: true, message: "Organizace byla deaktivována" };
  });

  fastify.post("/admin/orgs/:id/impersonate", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    // In real implementation, this would update the database
    return { success: true, message: "Organizace byla aktivována" };
  });

  // Users management  
  fastify.get("/admin/orgs/:id/users", async (request, reply) => {
    const { organizationId, search, status } = request.query as any;
    
    let filtered = [...demoUsers];
    
    if (organizationId && organizationId !== "all") {
      filtered = filtered.filter(user => user.organizationId === organizationId);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        (user.username && user.username.toLowerCase().includes(searchLower)) ||
        user.organizationName.toLowerCase().includes(searchLower)
      );
    }
    
    if (status && status !== "all") {
      filtered = filtered.filter(user => user.status === status);
    }
    
    return filtered;
  });

  fastify.patch("/admin/users/:userId", async (request, reply) => {
    const { id } = request.params as { id: string };
    const updateData = request.body;
    
    return { success: true, message: "Uživatel byl aktualizován" };
  });

  fastify.post("/admin/users/:userId/reset-password", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    
    // In real implementation, this would:
    // 1. Validate super admin permissions
    // 2. Generate new password
    // 3. Hash and save password
    // 4. Send email to user
    
    return {
      success: true,
      message: "Heslo bylo resetováno a odesláno uživateli"
    };
  });

  // Services management
  fastify.get("/admin/services", async (request, reply) => {
    const { organizationId } = request.query as any;
    
    // Demo services data - would come from database
    const demoServices = [
      {
        id: "service-1",
        organizationId: "org-1",
        organizationName: "Salon Krása",
        name: "Střih a foukaná",
        description: "Profesionální střih s následnou foukanou",
        duration: 60,
        price: 800,
        paymentMode: "REQUIRED"
      },
      {
        id: "service-2", 
        organizationId: "org-2",
        organizationName: "Fitness Studio Active",
        name: "Osobní trénink",
        description: "Individuální fitness trénink",
        duration: 90,
        price: 600,
        paymentMode: "OPTIONAL"
      }
    ];
    
    let filtered = demoServices;
    if (organizationId) {
      filtered = filtered.filter(service => service.organizationId === organizationId);
    }
    
    return filtered;
  });

  // Bookings management
  fastify.get("/admin/bookings", async (request, reply) => {
    const { organizationId, from, to, status, serviceId } = request.query as any;
    
    // Demo bookings data
    const demoBookings = [
      {
        id: "booking-1",
        organizationId: "org-1",
        organizationName: "Salon Krása",
        serviceId: "service-1",
        serviceName: "Střih a foukaná",
        customerName: "Anna Nováková",
        customerEmail: "anna.novakova@email.cz",
        customerPhone: "+420 777 888 999",
        startsAt: "2025-08-22T10:00:00Z",
        endsAt: "2025-08-22T11:00:00Z",
        status: "CONFIRMED",
        paymentStatus: "PAID",
        paymentAmount: 800,
        notes: "Zkrátit asi o 5cm"
      },
      {
        id: "booking-2",
        organizationId: "org-2", 
        organizationName: "Fitness Studio Active",
        serviceId: "service-2",
        serviceName: "Osobní trénink",
        customerName: "Pavel Dvořák",
        customerEmail: "pavel.dvorak@email.cz",
        customerPhone: "+420 666 555 444",
        startsAt: "2025-08-22T16:00:00Z",
        endsAt: "2025-08-22T17:30:00Z",
        status: "CONFIRMED",
        paymentStatus: "PENDING",
        paymentAmount: 600,
        notes: "Zaměření na kardio"
      }
    ];
    
    let filtered = demoBookings;
    
    if (organizationId) {
      filtered = filtered.filter(booking => booking.organizationId === organizationId);
    }
    
    if (status) {
      filtered = filtered.filter(booking => booking.status === status);
    }
    
    if (serviceId) {
      filtered = filtered.filter(booking => booking.serviceId === serviceId);
    }
    
    return filtered;
  });

  // Billing management  
  fastify.get("/admin/billing/summary", async (request, reply) => {
    return demoBillingPlans;
  });

  fastify.post("/admin/orgs/:id/plan", async (request, reply) => {
    const planData = request.body;
    
    return {
      success: true,
      message: "Plán byl vytvořen",
      id: `plan-${Date.now()}`
    };
  });

  // Invoices
  fastify.get("/admin/invoices", async (request, reply) => {
    const { organizationId, status, from, to } = request.query as any;
    
    let filtered = [...demoInvoices];
    
    if (organizationId) {
      filtered = filtered.filter(invoice => invoice.organizationId === organizationId);
    }
    
    if (status && status !== "all") {
      filtered = filtered.filter(invoice => invoice.status === status);
    }
    
    return filtered;
  });

  fastify.post("/admin/invoices/generate", async (request, reply) => {
    const invoiceData = request.body;
    
    return {
      success: true,
      message: "Faktura byla vygenerována",
      id: `inv-${Date.now()}`
    };
  });

  // Audit logs
  fastify.get("/super-admin/audit", async (request, reply) => {
    const { userId, organizationId, action, from, to, limit = 100 } = request.query as any;
    
    let filtered = [...demoAuditLogs];
    
    if (userId) {
      filtered = filtered.filter(log => log.userId === userId);
    }
    
    if (organizationId) {
      filtered = filtered.filter(log => log.organizationId === organizationId);
    }
    
    if (action) {
      filtered = filtered.filter(log => log.action === action);
    }
    
    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return filtered.slice(0, parseInt(limit));
  });

  // Booking payments
  fastify.get("/super-admin/booking-payments", async (request, reply) => {
    const { organizationId, status, from, to, limit = 100 } = request.query as any;
    
    let filtered = [...demoBookingPayments];
    
    if (organizationId && organizationId !== "all") {
      filtered = filtered.filter(payment => payment.organizationId === organizationId);
    }
    
    if (status && status !== "all") {
      filtered = filtered.filter(payment => payment.status === status);
    }
    
    // Sort by payment date descending
    filtered.sort((a, b) => {
      const dateA = a.paymentDate ? new Date(a.paymentDate).getTime() : 0;
      const dateB = b.paymentDate ? new Date(b.paymentDate).getTime() : 0;
      return dateB - dateA;
    });
    
    return filtered.slice(0, parseInt(limit));
  });

  // Organization billing status
  fastify.get("/super-admin/organizations/:id/billing", async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const organization = demoOrganizations.find(org => org.id === id);
    if (!organization) {
      return reply.status(404).send({ message: "Organizace nebyla nalezena" });
    }
    
    const invoices = demoInvoices.filter(inv => inv.organizationId === id);
    const payments = demoBookingPayments.filter(pay => pay.organizationId === id);
    
    const totalPaid = invoices.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = invoices.filter(inv => inv.status === "sent").reduce((sum, inv) => sum + inv.amount, 0);
    const totalBookingRevenue = payments.filter(pay => pay.status === "completed").reduce((sum, pay) => sum + pay.organizationReceived, 0);
    const totalPlatformFees = payments.filter(pay => pay.status === "completed").reduce((sum, pay) => sum + pay.platformFee, 0);
    
    return {
      organization,
      billingPlan: demoBillingPlans.find(plan => plan.id === `plan-${organization.plan}`),
      invoices,
      payments: payments.slice(0, 20), // Latest 20 payments
      summary: {
        totalPaid,
        totalPending,
        totalBookingRevenue,
        totalPlatformFees,
        nextBillingDate: "2025-09-01T00:00:00Z"
      }
    };
  });

  // Export endpoints
  fastify.get("/super-admin/organizations/export", async (request, reply) => {
    const csvHeaders = ["Název", "Email", "Slug", "Stav", "Plán", "Datum vytvoření", "Celkem rezervací", "Celkové tržby"];
    const csvRows = demoOrganizations.map(org => [
      org.name,
      org.email,
      org.slug,
      org.status,
      org.plan,
      format(new Date(org.createdAt), "d.M.yyyy"),
      org.totalBookings.toString(),
      `${org.totalRevenue} Kč`
    ]);
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="organizace-export.csv"');
    return csvContent;
  });

  fastify.get("/super-admin/bookings/export", async (request, reply) => {
    const csvHeaders = ["Datum", "Čas", "Organizace", "Služba", "Zákazník", "Email", "Stav", "Platba"];
    const csvRows = [
      ["22.8.2025", "10:00", "Salon Krása", "Střih a foukaná", "Anna Nováková", "anna.novakova@email.cz", "Potvrzeno", "800 Kč"],
      ["22.8.2025", "16:00", "Fitness Studio Active", "Osobní trénink", "Pavel Dvořák", "pavel.dvorak@email.cz", "Potvrzeno", "600 Kč"]
    ];
    
    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    
    reply.header('Content-Type', 'text/csv; charset=utf-8');
    reply.header('Content-Disposition', 'attachment; filename="rezervace-export.csv"');
    return csvContent;
  });
}