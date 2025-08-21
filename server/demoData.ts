// Demo data for client presentations
export const demoOrganization = {
  id: "demo-org-id",
  name: "Salon Krása",
  slug: "salon-krasa",
  email: "info@salonkrasa.cz",
  phone: "+420 777 123 456",
  address: "Václavské náměstí 1, Praha 1",
  website: "https://salonkrasa.cz",
  timezone: "Europe/Prague",
  businessVerified: true,
  ico: "12345678",
  dic: "CZ12345678",
  bankAccount: "123456789/0100",
  stripeAccountId: "acct_demo123",
  stripeAccountStatus: "complete"
};

export const demoUser = {
  id: "demo-user-id",
  email: "demo@bookli.cz",
  name: "Demo Uživatel",
  organizationId: "demo-org-id"
};

export const demoServices = [
  {
    id: "service-1",
    organizationId: "demo-org-id",
    name: "Střih a foukaná",
    description: "Profesionální střih s následnou foukanou pro dokonalý výsledek",
    duration: 60,
    price: 800,
    paymentMode: "REQUIRED"
  },
  {
    id: "service-2",
    organizationId: "demo-org-id",
    name: "Barvení vlasů",
    description: "Kompletní barvení vlasů s prémiovou barvou",
    duration: 120,
    price: 1500,
    paymentMode: "OPTIONAL"
  },
  {
    id: "service-3",
    organizationId: "demo-org-id",
    name: "Manikúra",
    description: "Klasická manikúra s lakováním",
    duration: 45,
    price: 450,
    paymentMode: "OFF"
  },
  {
    id: "service-4",
    organizationId: "demo-org-id",
    name: "Pedikúra",
    description: "Kompletní pedikúra s ošetřením",
    duration: 75,
    price: 650,
    paymentMode: "OPTIONAL"
  }
];

export const demoAvailability = [
  {
    id: "avail-1",
    organizationId: "demo-org-id",
    dayOfWeek: 1, // Monday
    startTime: "08:00",
    endTime: "18:00"
  },
  {
    id: "avail-2", 
    organizationId: "demo-org-id",
    dayOfWeek: 2, // Tuesday
    startTime: "08:00",
    endTime: "18:00"
  },
  {
    id: "avail-3",
    organizationId: "demo-org-id", 
    dayOfWeek: 3, // Wednesday
    startTime: "08:00",
    endTime: "18:00"
  },
  {
    id: "avail-4",
    organizationId: "demo-org-id",
    dayOfWeek: 4, // Thursday
    startTime: "08:00",
    endTime: "18:00"
  },
  {
    id: "avail-5",
    organizationId: "demo-org-id",
    dayOfWeek: 5, // Friday
    startTime: "08:00",
    endTime: "20:00"
  },
  {
    id: "avail-6",
    organizationId: "demo-org-id",
    dayOfWeek: 6, // Saturday
    startTime: "09:00",
    endTime: "16:00"
  }
];

export const demoBookings = [
  {
    id: "booking-1",
    organizationId: "demo-org-id",
    serviceId: "service-1",
    customerName: "Anna Nováková",
    customerEmail: "anna.novakova@email.cz",
    customerPhone: "+420 777 888 999",
    date: "2025-08-22",
    time: "10:00",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentAmount: 800,
    notes: "Zkrátit asi o 5cm, rovný střih"
  },
  {
    id: "booking-2",
    organizationId: "demo-org-id",
    serviceId: "service-2",
    customerName: "Petra Svobodová",
    customerEmail: "petra.svobodova@email.cz",
    customerPhone: "+420 666 777 888",
    date: "2025-08-22",
    time: "14:00",
    status: "CONFIRMED",
    paymentStatus: "PENDING",
    paymentAmount: 1500,
    notes: "Tmavší odstín, přirozený look"
  },
  {
    id: "booking-3",
    organizationId: "demo-org-id",
    serviceId: "service-1",
    customerName: "Marie Kratochvílová",
    customerEmail: "marie.k@email.cz",
    customerPhone: "+420 555 666 777",
    date: "2025-08-23",
    time: "09:00",
    status: "PENDING",
    paymentStatus: "NOT_REQUIRED",
    paymentAmount: 0,
    notes: ""
  },
  {
    id: "booking-4",
    organizationId: "demo-org-id",
    serviceId: "service-3",
    customerName: "Jana Dvořáková",
    customerEmail: "jana.dvorakova@email.cz",
    customerPhone: "+420 444 555 666",
    date: "2025-08-23",
    time: "11:30",
    status: "CONFIRMED",
    paymentStatus: "NOT_REQUIRED",
    paymentAmount: 0,
    notes: "Francouzská manikúra"
  },
  {
    id: "booking-5",
    organizationId: "demo-org-id",
    serviceId: "service-4",
    customerName: "Lucie Procházková",
    customerEmail: "lucie.prochazka@email.cz",
    customerPhone: "+420 333 444 555",
    date: "2025-08-24",
    time: "15:00",
    status: "CONFIRMED",
    paymentStatus: "PAID",
    paymentAmount: 650,
    notes: "Gelový lak - červená barva"
  }
];

export const demoBlackouts = [
  {
    id: "blackout-1",
    organizationId: "demo-org-id",
    title: "Školení - Nové techniky",
    startDate: "2025-08-25",
    endDate: "2025-08-25",
    startTime: "09:00",
    endTime: "17:00",
    reason: "Vzdělávací akce"
  },
  {
    id: "blackout-2",
    organizationId: "demo-org-id",
    title: "Dovolená",
    startDate: "2025-09-01",
    endDate: "2025-09-07",
    startTime: "00:00",
    endTime: "23:59",
    reason: "Osobní volno"
  }
];

export const demoPayments = [
  {
    id: "payment-1",
    bookingId: "booking-1",
    amount: 800,
    currency: "CZK",
    status: "COMPLETED",
    stripePaymentId: "pi_demo123",
    createdAt: "2025-08-20T10:30:00Z",
    paidAt: "2025-08-20T10:31:00Z"
  },
  {
    id: "payment-2",
    bookingId: "booking-5",
    amount: 650,
    currency: "CZK", 
    status: "COMPLETED",
    stripePaymentId: "pi_demo456",
    createdAt: "2025-08-19T14:15:00Z",
    paidAt: "2025-08-19T14:16:00Z"
  },
  {
    id: "payment-3",
    bookingId: "booking-2",
    amount: 1500,
    currency: "CZK",
    status: "PENDING",
    stripePaymentId: "pi_demo789",
    createdAt: "2025-08-21T09:20:00Z",
    paidAt: null
  }
];

export const isDemoMode = () => {
  return process.env.DEMO_MODE === "true" || process.env.NODE_ENV === "demo";
};