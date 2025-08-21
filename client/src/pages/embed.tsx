import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Calendar, Clock, CreditCard, User, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { format, addMinutes } from "date-fns";
import { cs } from "date-fns/locale";

interface EmbedProps {
  orgSlug?: string;
  serviceId?: string;
  lang?: string;
  theme?: string;
  accent?: string;
}

export default function EmbedBooking() {
  const [, params] = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  
  const orgSlug = urlParams.get("org") || "";
  const serviceId = urlParams.get("service") || "";
  const lang = urlParams.get("lang") || "cs";
  const theme = urlParams.get("theme") || "light";
  const accent = urlParams.get("accent") || "#3b82f6";

  const [selectedService, setSelectedService] = useState(serviceId);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerData, setCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
    note: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch organization data
  const { data: organization } = useQuery({
    queryKey: [`/api/public/org/${orgSlug}`],
    queryFn: () => apiRequest("GET", `/api/public/org/${orgSlug}`),
    enabled: !!orgSlug
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: [`/api/public/org/${orgSlug}/services`],
    queryFn: () => apiRequest("GET", `/api/public/org/${orgSlug}/services`),
    enabled: !!orgSlug
  });

  // Fetch available time slots
  const { data: timeSlots = [] } = useQuery({
    queryKey: [`/api/public/org/${orgSlug}/slots`, selectedService, selectedDate],
    queryFn: () => apiRequest("GET", `/api/public/org/${orgSlug}/slots`, {
      serviceId: selectedService,
      date: selectedDate
    }),
    enabled: !!(orgSlug && selectedService && selectedDate)
  });

  // Auto-resize iframe
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight;
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'bookli-resize',
          height: height
        }, '*');
      }
    });

    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (accent) {
      document.documentElement.style.setProperty('--accent-color', accent);
    }
  }, [theme, accent]);

  // Auto-select service if provided
  useEffect(() => {
    if (serviceId && services.length > 0) {
      const service = services.find((s: any) => s.id === serviceId);
      if (service) {
        setSelectedService(serviceId);
      }
    }
  }, [serviceId, services]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    try {
      const service = services.find((s: any) => s.id === selectedService);
      const [hours, minutes] = selectedTime.split(':');
      const startsAt = new Date(selectedDate);
      startsAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const endsAt = addMinutes(startsAt, service.duration);

      const bookingData = {
        serviceId: selectedService,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        customerName: customerData.name,
        customerEmail: customerData.email,
        customerPhone: customerData.phone || undefined,
        note: customerData.note || undefined
      };

      const response: any = await apiRequest("POST", `/api/public/org/${orgSlug}/bookings`, bookingData);
      
      // Handle payment if required
      if (response.paymentUrl) {
        // Notify parent to open payment in new tab
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'bookli-payment',
            url: response.paymentUrl
          }, '*');
        } else {
          window.open(response.paymentUrl, '_blank');
        }
      } else {
        // Show success message
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'bookli-success',
            booking: response
          }, '*');
        }
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'bookli-error',
          message: error.message || 'Chyba při vytváření rezervace'
        }, '*');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">Načítám rezervační formulář...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4" style={{ 
      colorScheme: theme,
      accentColor: accent 
    }}>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            {organization.logoUrl && (
              <img 
                src={organization.logoUrl} 
                alt={organization.name}
                className="w-16 h-16 object-contain mx-auto mb-4"
              />
            )}
            <CardTitle className="text-2xl font-bold text-slate-900">
              {organization.name}
            </CardTitle>
            <p className="text-slate-600">Online rezervace</p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Service Selection */}
              {!serviceId && (
                <div>
                  <Label htmlFor="service" className="text-sm font-medium text-slate-700">
                    Vyberte službu *
                  </Label>
                  <Select 
                    value={selectedService} 
                    onValueChange={setSelectedService}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Zvolte službu" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service: any) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex justify-between w-full">
                            <span>{service.name}</span>
                            <span className="text-slate-500 ml-4">
                              {service.duration}min • {service.price}Kč
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Date Selection */}
              <div>
                <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                  Vyberte datum *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(""); // Reset time when date changes
                  }}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="mt-1"
                  required
                />
              </div>

              {/* Time Selection */}
              {selectedDate && timeSlots.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-slate-700">
                    Vyberte čas *
                  </Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {timeSlots.map((slot: any) => (
                      <Button
                        key={slot.time}
                        type="button"
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(slot.time)}
                        className="text-sm"
                        style={{ 
                          backgroundColor: selectedTime === slot.time ? accent : undefined 
                        }}
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedDate && timeSlots.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-slate-500">Pro vybrané datum nejsou dostupné žádné termíny</p>
                </div>
              )}

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                    Jméno a příjmení *
                  </Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Jan Novák"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                    E-mail *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="jan@example.com"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                  Telefon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+420 123 456 789"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="note" className="text-sm font-medium text-slate-700">
                  Poznámka
                </Label>
                <Textarea
                  id="note"
                  value={customerData.note}
                  onChange={(e) => setCustomerData(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Dodatečné požadavky..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                disabled={!selectedService || !selectedDate || !selectedTime || isSubmitting}
                style={{ backgroundColor: accent }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Vytvářím rezervaci...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Rezervovat
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}