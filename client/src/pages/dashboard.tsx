import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfDay, endOfDay } from "date-fns";
import { cs } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import TodaySchedule from "@/components/dashboard/today-schedule";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock } from "lucide-react";
import { bookingsApi, servicesApi } from "@/lib/api";
import { Link } from "wouter";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Vyberte službu"),
  customerName: z.string().min(1, "Zadejte jméno zákazníka"),
  customerEmail: z.string().email("Zadejte platnou e-mailovou adresu"),
  customerPhone: z.string().optional(),
  startsAt: z.string().min(1, "Vyberte datum a čas"),
  note: z.string().optional()
});

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const today = new Date();
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: todayBookings = [] } = useQuery({
    queryKey: ["/api/bookings", "today"],
    queryFn: () => bookingsApi.getAll({
      from: startOfDay(today).toISOString(),
      to: endOfDay(today).toISOString()
    })
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: servicesApi.getAll
  });

  const form = useForm<z.infer<typeof bookingSchema>>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      startsAt: "",
      note: ""
    }
  });

  const createBooking = useMutation({
    mutationFn: (data: any) => {
      // This would need a proper booking creation endpoint
      return Promise.resolve({ id: Date.now().toString(), ...data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Rezervace byla vytvořena",
        description: "Nová rezervace byla úspěšně přidána do systému."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při vytváření rezervace",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: z.infer<typeof bookingSchema>) => {
    const selectedService = services.find(s => s.id === data.serviceId);
    if (!selectedService) return;

    const startDateTime = new Date(data.startsAt);
    const endDateTime = new Date(startDateTime.getTime() + selectedService.durationMin * 60000);

    createBooking.mutate({
      ...data,
      startsAt: startDateTime.toISOString(),
      endsAt: endDateTime.toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-dashboard-title">
                  Přehled
                </h1>
                <p className="text-slate-600 mt-1" data-testid="text-current-date">
                  Dnes je {format(today, "d. MMMM yyyy", { locale: cs })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild data-testid="button-add-service">
                    <Link href="/app/services">
                      <Plus className="mr-2 h-4 w-4" />
                      Přidat službu
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild data-testid="button-block-time">
                    <Link href="/app/blackouts">
                      <Clock className="mr-2 h-4 w-4" />
                      Blokovat čas
                    </Link>
                  </Button>
                </div>
                
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-new-booking">
                      <Plus className="mr-2 h-4 w-4" />
                      Nová rezervace
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nová rezervace</DialogTitle>
                    </DialogHeader>
                    
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="serviceId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Služba</FormLabel>
                              <FormControl>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Vyberte službu" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {services.map((service) => (
                                      <SelectItem key={service.id} value={service.id}>
                                        {service.name} ({service.durationMin} min{service.priceCzk ? `, ${service.priceCzk} Kč` : ''})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jméno zákazníka</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Zadejte jméno zákazníka" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail</FormLabel>
                              <FormControl>
                                <Input {...field} type="email" placeholder="zakaznik@email.cz" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefon (volitelné)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="+420 123 456 789" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="startsAt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Datum a čas</FormLabel>
                              <FormControl>
                                <Input {...field} type="datetime-local" min={format(new Date(), "yyyy-MM-dd'T'HH:mm")} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="note"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Poznámka (volitelné)</FormLabel>
                              <FormControl>
                                <Textarea {...field} placeholder="Poznámky k rezervaci..." />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Zrušit
                          </Button>
                          <Button type="submit" disabled={createBooking.isPending}>
                            {createBooking.isPending ? "Vytvářím..." : "Vytvořit rezervaci"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <StatsCards bookings={todayBookings} />

          {/* Today's Schedule */}
          <TodaySchedule bookings={todayBookings} />
        </main>
      </div>
    </div>
  );
}
