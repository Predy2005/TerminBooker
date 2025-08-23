import React, { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addWeeks, 
  addMonths, 
  isSameMonth, 
  isSameDay, 
  isToday,
  startOfDay,
  endOfDay,
  addHours,
  getHours,
  getMinutes
} from 'date-fns';
import { cs } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  Eye
} from 'lucide-react';
import type { Booking, Service } from '@/types';

interface CalendarViewProps {
  bookings: Booking[];
  services: Service[];
  onCreateBooking: (date: Date) => void;
  onEditBooking: (booking: Booking) => void;
}

type ViewType = 'day' | 'week' | 'month';

const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  services,
  onCreateBooking,
  onEditBooking
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('month');

  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      switch (view) {
        case 'day':
          return direction === 'next' ? addDays(prev, 1) : addDays(prev, -1);
        case 'week':
          return direction === 'next' ? addWeeks(prev, 1) : addWeeks(prev, -1);
        case 'month':
          return direction === 'next' ? addMonths(prev, 1) : addMonths(prev, -1);
        default:
          return prev;
      }
    });
  };

  const getDateTitle = () => {
    switch (view) {
      case 'day':
        return format(currentDate, 'd. MMMM yyyy', { locale: cs });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd.M.')} - ${format(weekEnd, 'd.M.yyyy')}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: cs });
      default:
        return '';
    }
  };

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(new Date(booking.startsAt), date)
    );
  };

  const getBookingsForTimeSlot = (date: Date, hour: number) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.startsAt);
      return isSameDay(bookingDate, date) && 
             getHours(bookingDate) === hour;
    });
  };

  const getServiceById = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // Denní pohled
  const renderDayView = () => {
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

    return (
      <div className="grid grid-cols-1 gap-2">
        {hours.map(hour => {
          const timeSlotBookings = getBookingsForTimeSlot(currentDate, hour);
          return (
            <div 
              key={hour}
              className="border rounded-lg p-3 min-h-20 hover:bg-slate-50 cursor-pointer transition-colors"
              onClick={() => {
                const slotDate = new Date(currentDate);
                slotDate.setHours(hour, 0, 0, 0);
                onCreateBooking(slotDate);
              }}
              data-testid={`time-slot-${hour}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-600">
                  {hour.toString().padStart(2, '0')}:00
                </span>
                {timeSlotBookings.length === 0 && (
                  <Plus className="h-4 w-4 text-slate-400" />
                )}
              </div>
              
              <div className="space-y-1">
                {timeSlotBookings.map(booking => {
                  const service = getServiceById(booking.serviceId);
                  return (
                    <div
                      key={booking.id}
                      className={`p-2 rounded border text-xs ${getStatusColor(booking.status)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditBooking(booking);
                      }}
                      data-testid={`booking-${booking.id}`}
                    >
                      <div className="font-medium">{booking.customerName}</div>
                      <div className="text-xs opacity-75">
                        {service?.name} • {format(new Date(booking.startsAt), 'HH:mm')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Týdenní pohled
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    const hours = Array.from({ length: 12 }, (_, i) => i + 8);

    return (
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header s dny */}
          <div className="grid grid-cols-8 gap-1 mb-2">
            <div className="p-2"></div> {/* Prostor pro hodiny */}
            {days.map(day => (
              <div 
                key={day.toISOString()}
                className={`p-2 text-center border rounded ${
                  isToday(day) ? 'bg-blue-100 text-blue-800' : 'bg-slate-50'
                }`}
              >
                <div className="text-xs text-slate-600">
                  {format(day, 'EEEE', { locale: cs })}
                </div>
                <div className="font-medium">
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Grid s hodinami a rezervacemi */}
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-8 gap-1 mb-1">
              <div className="p-2 text-xs text-slate-600 text-right">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map(day => {
                const dayBookings = getBookingsForTimeSlot(day, hour);
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border rounded p-1 min-h-12 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onCreateBooking(slotDate);
                    }}
                    data-testid={`week-slot-${format(day, 'yyyy-MM-dd')}-${hour}`}
                  >
                    {dayBookings.map(booking => {
                      const service = getServiceById(booking.serviceId);
                      return (
                        <div
                          key={booking.id}
                          className={`text-xs p-1 rounded mb-1 ${getStatusColor(booking.status)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBooking(booking);
                          }}
                        >
                          <div className="font-medium truncate">{booking.customerName}</div>
                          <div className="truncate opacity-75">{service?.name}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Měsíční pohled
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = calendarStart;
    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="space-y-2">
        {/* Header s dny v týdnu */}
        <div className="grid grid-cols-7 gap-2">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(dayName => (
            <div key={dayName} className="p-2 text-center text-sm font-medium text-slate-600">
              {dayName}
            </div>
          ))}
        </div>

        {/* Týdny */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-2">
            {week.map(day => {
              const dayBookings = getBookingsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`border rounded-lg p-2 min-h-24 cursor-pointer transition-colors ${
                    isCurrentMonth ? 'hover:bg-slate-50' : 'bg-slate-50/50'
                  } ${isToday(day) ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => onCreateBooking(day)}
                  data-testid={`month-day-${format(day, 'yyyy-MM-dd')}`}
                >
                  <div className={`text-sm mb-1 ${
                    isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                  } ${isToday(day) ? 'font-bold text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.slice(0, 3).map(booking => {
                      const service = getServiceById(booking.serviceId);
                      return (
                        <div
                          key={booking.id}
                          className={`text-xs p-1 rounded truncate ${getStatusColor(booking.status)}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditBooking(booking);
                          }}
                          title={`${booking.customerName} - ${service?.name} (${format(new Date(booking.startsAt), 'HH:mm')})`}
                        >
                          {booking.customerName}
                        </div>
                      );
                    })}
                    {dayBookings.length > 3 && (
                      <div className="text-xs text-slate-600 text-center">
                        +{dayBookings.length - 3} dalších
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Kalendářový přehled
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
                PRO
              </Badge>
            </CardTitle>
            
            {/* Přepínače pohledů */}
            <div className="flex bg-slate-100 rounded-lg p-1">
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
                data-testid="view-day"
              >
                Den
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
                data-testid="view-week"
              >
                Týden
              </Button>
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
                data-testid="view-month"
              >
                Měsíc
              </Button>
            </div>
          </div>

          {/* Navigace */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              data-testid="nav-prev"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-48 text-center font-medium" data-testid="date-title">
              {getDateTitle()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              data-testid="nav-next"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              data-testid="nav-today"
            >
              Dnes
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </CardContent>
    </Card>
  );
};

export default CalendarView;