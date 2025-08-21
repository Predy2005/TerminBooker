export const FEATURES = {
  FREE: { 
    maxServices: 1, 
    maxBookingsPerMonth: 50, 
    branding: true, 
    richEmail: false, 
    admins: 1 
  },
  PRO: { 
    maxServices: 5, 
    maxBookingsPerMonth: 1000, 
    branding: false, 
    richEmail: true, 
    admins: 1 
  },
  BUSINESS: { 
    maxServices: -1, 
    maxBookingsPerMonth: -1, 
    branding: false, 
    richEmail: true, 
    admins: 5 
  }
} as const;

export type PlanType = keyof typeof FEATURES;
export type PlanFeatures = typeof FEATURES[PlanType];

export function getPlanFeatures(plan: PlanType): PlanFeatures {
  return FEATURES[plan] || FEATURES.FREE;
}

export function canCreateService(plan: PlanType, currentServicesCount: number): boolean {
  const features = getPlanFeatures(plan);
  return features.maxServices === -1 || currentServicesCount < features.maxServices;
}

export function canCreateBooking(plan: PlanType, currentBookingsThisMonth: number): boolean {
  const features = getPlanFeatures(plan);
  return features.maxBookingsPerMonth === -1 || currentBookingsThisMonth < features.maxBookingsPerMonth;
}