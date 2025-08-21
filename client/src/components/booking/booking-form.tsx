import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { publicApi } from "@/lib/api";
import { CalendarCheck } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Service, Organization, TimeSlot } from "@/types";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Jméno musí mít alespoň 2 znaky").max(80, "Jméno může mít maximálně 80 znaků"),
  customerEmail: z.string().email("Neplatná e-mailová adresa"),
  customerPhone: z.string().optional(),
  note: z.string().max(500, "Poznámka může mít maximálně 500 znaků").optional(),
  terms: z.boolean().refine(val => val, "Musíte souhlasit se zpracováním osobních údajů")
});

type BookingForm = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  service: Service;
  slot: TimeSlot;
  organization: Organization;
}

export default function BookingForm({ service, slot, organization }: BookingFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      note: "",
      terms: false
    }
  });

  const createBooking = useMutation({
    mutationFn: (data: BookingForm) => publicApi.createBooking(organization.slug, {
      serviceId: service.id,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      note: data.note,
      startsAt: slot.start,
      endsAt: slot.end
    })
  });

  const onSubmit = async (data: BookingForm) => {
    try {
      const result = await createBooking.mutateAsync(data);
      
      // If payment is required, redirect to checkout immediately
      if (result.requiresPayment && result.booking?.id) {
        try {
          const checkoutResponse = await publicApi.createCheckout(organization.slug, result.booking.id);
          window.location.href = checkoutResponse.url;
          return;
        } catch (checkoutError: any) {
          toast({
            title: "Chyba při přesměrování na platbu",
            description: checkoutError.message || "Zkuste to prosím znovu",
            variant: "destructive"
          });
          return;
        }
      }
      
      setIsSubmitted(true);
      setBookingResult(result);
      
      toast({
        title: "Rezervace byla úspěšně vytvořena",
        description: "Na váš e-mail bude zaslané potvrzení."
      });
    } catch (error: any) {
      toast({
        title: "Chyba při vytváření rezervace",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  };

  const handleOptionalPayment = async () => {
    if (!bookingResult?.booking?.id) return;
    
    setIsPaymentLoading(true);
    try {
      const checkoutResponse = await publicApi.createCheckout(organization.slug, bookingResult.booking.id);
      window.location.href = checkoutResponse.url;
    } catch (error: any) {
      toast({
        title: "Chyba při přesměrování na platbu",
        description: error.message || "Zkuste to prosím znovu",
        variant: "destructive"
      });
      setIsPaymentLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarCheck className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Rezervace byla úspěšně vytvořena!</h2>
        <p className="text-slate-600 mb-2">
          Vaše rezervace na <strong>{service.name}</strong> byla přijata.
        </p>
        <p className="text-slate-600 mb-4">
          Termín: <strong>
            {format(new Date(slot.start), "d. MMMM yyyy 'v' HH:mm", { locale: cs })}
          </strong>
        </p>
        
        {/* Optional payment section */}
        {bookingResult?.optionalPayment && service.priceCzk && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-blue-900 mb-2">Chcete zaplatit online?</h3>
            <p className="text-sm text-blue-700 mb-3">
              Můžete zaplatit online kartou nebo si nechat službu na místě.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleOptionalPayment}
                disabled={isPaymentLoading}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="button-pay-online"
              >
                {isPaymentLoading ? "Přesměrovávám..." : `Zaplatit online (${service.priceCzk} Kč)`}
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                data-testid="button-pay-later"
              >
                Zaplatím na místě
              </Button>
            </div>
          </div>
        )}
        
        <p className="text-sm text-slate-500">
          Na váš e-mail bude zasláno potvrzení s dalšími informacemi.
        </p>
      </div>
    );
  }

  return (
    <Card className="mt-8 shadow-sm border">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Dokončit rezervaci</h2>
        
        {/* Booking Summary */}
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-slate-900" data-testid="text-booking-service">
                {service.name}
              </h3>
              <p className="text-sm text-slate-600 mt-1" data-testid="text-booking-datetime">
                {format(new Date(slot.start), "d. MMMM yyyy, HH:mm", { locale: cs })} - {format(new Date(slot.end), "HH:mm")}
              </p>
              <p className="text-sm text-slate-600" data-testid="text-booking-duration">
                Délka: {service.durationMin} minut
              </p>
            </div>
            {service.priceCzk && (
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900" data-testid="text-booking-price">
                  {service.priceCzk} Kč
                </div>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="customerName">Jméno a příjmení *</Label>
              <Input
                id="customerName"
                placeholder="Zadejte celé jméno"
                {...form.register("customerName")}
                data-testid="input-customerName"
              />
              {form.formState.errors.customerName && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.customerName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="customerEmail">E-mail *</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="vas@email.cz"
                {...form.register("customerEmail")}
                data-testid="input-customerEmail"
              />
              {form.formState.errors.customerEmail && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.customerEmail.message}
                </p>
              )}
            </div>
          </div>
          
          <div>
            <Label htmlFor="customerPhone">Telefon</Label>
            <Input
              id="customerPhone"
              type="tel"
              placeholder="+420 123 456 789"
              {...form.register("customerPhone")}
              data-testid="input-customerPhone"
            />
          </div>
          
          <div>
            <Label htmlFor="note">Poznámka</Label>
            <Textarea
              id="note"
              placeholder="Případné požadavky nebo poznámky..."
              className="h-20"
              {...form.register("note")}
              data-testid="textarea-note"
            />
          </div>
          
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-terms"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm text-slate-600">
                    Souhlasím se zpracováním osobních údajů pro účely rezervace *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full"
            disabled={createBooking.isPending}
            data-testid="button-submit-booking"
          >
            <CalendarCheck className="mr-2 h-4 w-4" />
            {createBooking.isPending ? "Vytvářím rezervaci..." : "Potvrdit rezervaci"}
          </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
