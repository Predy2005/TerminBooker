import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";
import ServiceSelector from "@/components/booking/service-selector";
import TimeSlotPicker from "@/components/booking/time-slot-picker";
import BookingForm from "@/components/booking/booking-form";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import type { Service, TimeSlot } from "@/types";

export default function PublicBooking() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["/api/public", slug, "services"],
    queryFn: () => publicApi.getServices(slug!),
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div>Načítám...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Organizace nebyla nalezena</h1>
            <p className="text-slate-600">Zkontrolujte prosím URL adresu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { organization, services } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Public Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Logo - pouze pro PRO/BUSINESS plány */}
              {(organization.plan === 'PRO' || organization.plan === 'BUSINESS') && organization.logoUrl && (
                <img 
                  src={organization.logoUrl.startsWith('/objects/') ? `/api${organization.logoUrl}` : organization.logoUrl} 
                  alt={`${organization.name} logo`}
                  className="h-12 w-auto object-contain"
                  data-testid="img-organization-logo"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-organization-name">
                  {organization.name}
                </h1>
                <p className="text-slate-600 mt-1">Rezervace online termínů</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              <Clock className="inline mr-1 h-4 w-4" />
              <span data-testid="text-timezone">{organization.timezone}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Service Selection */}
          <ServiceSelector
            services={services}
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />

          {/* Time Slot Selection */}
          <TimeSlotPicker
            service={selectedService}
            organization={organization}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        </div>

        {/* Booking Form */}
        {selectedService && selectedSlot && (
          <BookingForm
            service={selectedService}
            slot={selectedSlot}
            organization={organization}
          />
        )}
      </main>
    </div>
  );
}
