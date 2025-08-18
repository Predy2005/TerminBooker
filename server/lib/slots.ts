import { DateTime } from "luxon";
import type { AvailabilityTemplate, Blackout, Service } from "@shared/schema";
import { storage } from "../storage";

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export async function generateTimeSlots(
  organizationId: string,
  service: Service,
  fromDate: Date,
  toDate: Date,
  timezone: string = "Europe/Prague"
): Promise<TimeSlot[]> {
  const availabilityTemplates = await storage.getAvailabilityTemplates(organizationId);
  const blackouts = await storage.getBlackouts(organizationId);
  
  const slots: TimeSlot[] = [];
  let currentDate = DateTime.fromJSDate(fromDate).setZone(timezone).startOf('day');
  const endDate = DateTime.fromJSDate(toDate).setZone(timezone).startOf('day');

  while (currentDate <= endDate) {
    const daySlots = generateSlotsForDay(
      currentDate,
      service,
      availabilityTemplates,
      blackouts,
      timezone
    );
    slots.push(...daySlots);
    currentDate = currentDate.plus({ days: 1 });
  }

  // Remove slots that conflict with existing bookings
  const conflictingBookings = await storage.getBookings(organizationId, {
    from: fromDate,
    to: toDate
  });

  return slots.map(slot => {
    const hasConflict = conflictingBookings.some(booking => 
      booking.status !== "CANCELLED" &&
      DateTime.fromJSDate(booking.startsAt) < DateTime.fromJSDate(slot.end) &&
      DateTime.fromJSDate(booking.endsAt) > DateTime.fromJSDate(slot.start)
    );

    return {
      ...slot,
      available: slot.available && !hasConflict
    };
  });
}

function generateSlotsForDay(
  date: DateTime,
  service: Service,
  availabilityTemplates: AvailabilityTemplate[],
  blackouts: Blackout[],
  timezone: string
): TimeSlot[] {
  const weekday = date.weekday === 7 ? 0 : date.weekday; // Convert Luxon weekday (1-7) to our format (0-6, 0=Sunday)
  const dayTemplates = availabilityTemplates.filter(t => t.weekday === weekday);
  
  if (dayTemplates.length === 0) {
    return [];
  }

  const slots: TimeSlot[] = [];

  for (const template of dayTemplates) {
    const startTime = date.plus({ minutes: template.startMinutes });
    const endTime = date.plus({ minutes: template.endMinutes });
    
    let currentSlot = startTime;
    
    while (currentSlot.plus({ minutes: service.durationMin }) <= endTime) {
      const slotStart = currentSlot.toJSDate();
      const slotEnd = currentSlot.plus({ minutes: service.durationMin }).toJSDate();
      
      // Check if slot overlaps with any blackout
      const isBlackedOut = blackouts.some(blackout => {
        const blackoutStart = DateTime.fromJSDate(blackout.startsAt).setZone(timezone);
        const blackoutEnd = DateTime.fromJSDate(blackout.endsAt).setZone(timezone);
        
        return currentSlot < blackoutEnd && 
               currentSlot.plus({ minutes: service.durationMin }) > blackoutStart;
      });

      // Only add slots that are in the future
      const now = DateTime.now().setZone(timezone);
      const isInFuture = currentSlot > now;

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !isBlackedOut && isInFuture
      });

      currentSlot = currentSlot.plus({ minutes: template.slotStepMin });
    }
  }

  return slots;
}

export function formatTimeSlot(slot: TimeSlot, timezone: string = "Europe/Prague"): string {
  const start = DateTime.fromJSDate(slot.start).setZone(timezone);
  const end = DateTime.fromJSDate(slot.end).setZone(timezone);
  
  return `${start.toFormat('HH:mm')} - ${end.toFormat('HH:mm')}`;
}

export function isSlotAvailable(
  slot: TimeSlot,
  bookings: Array<{ startsAt: Date; endsAt: Date; status: string }>,
  blackouts: Blackout[]
): boolean {
  // Check for booking conflicts
  const hasBookingConflict = bookings.some(booking => 
    booking.status !== "CANCELLED" &&
    DateTime.fromJSDate(booking.startsAt) < DateTime.fromJSDate(slot.end) &&
    DateTime.fromJSDate(booking.endsAt) > DateTime.fromJSDate(slot.start)
  );

  // Check for blackout conflicts
  const hasBlackoutConflict = blackouts.some(blackout => 
    DateTime.fromJSDate(blackout.startsAt) < DateTime.fromJSDate(slot.end) &&
    DateTime.fromJSDate(blackout.endsAt) > DateTime.fromJSDate(slot.start)
  );

  return !hasBookingConflict && !hasBlackoutConflict;
}
