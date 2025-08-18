import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, startOfDay } from "date-fns";
import { cs } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { publicApi } from "@/lib/api";
import type { Service, Organization, TimeSlot } from "@/types";

interface TimeSlotPickerProps {
  service: Service | null;
  organization: Organization;
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
}

export default function TimeSlotPicker({ service, organization, selectedSlot, onSelectSlot }: TimeSlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: slots, isLoading } = useQuery({
    queryKey: ["/api/public", organization.slug, "slots", service?.id, selectedDate.toISOString()],
    queryFn: () => {
      if (!service) return [];
      
      const from = startOfDay(selectedDate);
      const to = startOfDay(addDays(selectedDate, 1));
      
      return publicApi.getSlots(organization.slug, {
        from: from.toISOString(),
        to: to.toISOString(),
        serviceId: service.id
      });
    },
    enabled: !!service
  });

  if (!service) {
    return (
      <div className="space-y-6">
        <div className="bg-slate-100 rounded-lg p-8 text-center">
          <p className="text-slate-600">Nejprve vyberte službu</p>
        </div>
      </div>
    );
  }

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const generateCalendarDays = () => {
    const days = [];
    const firstDay = startOfDay(currentMonth);
    const today = startOfDay(new Date());
    
    // Generate days for current month view
    for (let i = 0; i < 21; i++) {
      const date = addDays(firstDay, i);
      const isToday = date.getTime() === today.getTime();
      const isSelected = date.getTime() === startOfDay(selectedDate).getTime();
      const isPast = date < today;
      
      days.push({
        date,
        day: date.getDate(),
        isToday,
        isSelected,
        isPast,
        isCurrentMonth: date.getMonth() === currentMonth.getMonth()
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Vyberte termín</h2>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addDays(currentMonth, -7))}
            data-testid="button-prev-week"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-medium text-slate-900">
            {format(currentMonth, "LLLL yyyy", { locale: cs })}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentMonth(addDays(currentMonth, 7))}
            data-testid="button-next-week"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
              {day}
            </div>
          ))}
          
          {calendarDays.map((day, index) => (
            <Button
              key={index}
              variant={day.isSelected ? "default" : "ghost"}
              size="sm"
              className={`h-8 w-8 p-0 ${
                day.isPast 
                  ? "text-slate-300 cursor-not-allowed" 
                  : day.isCurrentMonth 
                    ? "" 
                    : "text-slate-300"
              }`}
              onClick={() => !day.isPast && setSelectedDate(day.date)}
              disabled={day.isPast}
              data-testid={`calendar-day-${day.day}`}
            >
              {day.day}
            </Button>
          ))}
        </div>

        {/* Time Slots */}
        <div>
          <h4 className="font-medium text-slate-900 mb-3">
            Dostupné časy - {format(selectedDate, "d. MMMM", { locale: cs })}
          </h4>
          
          {isLoading ? (
            <div className="text-center py-4">
              <p className="text-slate-600">Načítám dostupné časy...</p>
            </div>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot, index) => (
                <Button
                  key={index}
                  variant={selectedSlot?.start === slot.start ? "default" : "outline"}
                  size="sm"
                  className="text-sm"
                  onClick={() => onSelectSlot(slot)}
                  data-testid={`time-slot-${formatTime(slot.start)}`}
                >
                  {formatTime(slot.start)}
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600">Žádné dostupné časy pro vybraný den</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
