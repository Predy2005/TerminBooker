import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { blackoutsApi } from "@/lib/api";
import { Plus, Trash2, Ban, Calendar } from "lucide-react";
import type { Blackout } from "@/types";

const blackoutSchema = z.object({
  startsAt: z.string().min(1, "Začátek je povinný"),
  endsAt: z.string().min(1, "Konec je povinný"),
  reason: z.string().optional()
}).refine(data => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "Konec musí být po začátku",
  path: ["endsAt"]
});

type BlackoutForm = z.infer<typeof blackoutSchema>;

export default function Blackouts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blackouts = [], isLoading } = useQuery({
    queryKey: ["/api/blackouts"],
    queryFn: blackoutsApi.getAll
  });

  const createBlackout = useMutation({
    mutationFn: blackoutsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blackouts"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Blokace byla vytvořena",
        description: "Nová blokace času byla úspěšně přidána."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při vytváření blokace",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteBlackout = useMutation({
    mutationFn: blackoutsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blackouts"] });
      toast({
        title: "Blokace byla smazána",
        description: "Blokace času byla úspěšně odstraněna."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při mazání blokace",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const form = useForm<BlackoutForm>({
    resolver: zodResolver(blackoutSchema),
    defaultValues: {
      startsAt: "",
      endsAt: "",
      reason: ""
    }
  });

  const onSubmit = (data: BlackoutForm) => {
    createBlackout.mutate({
      startsAt: new Date(data.startsAt).toISOString(),
      endsAt: new Date(data.endsAt).toISOString(),
      reason: data.reason || undefined
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Opravdu chcete smazat tuto blokace? Tato akce je nevratná.")) {
      deleteBlackout.mutate(id);
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "d. MMMM yyyy 'v' HH:mm", { locale: cs });
  };

  const formatDateTimeShort = (dateString: string) => {
    return format(new Date(dateString), "d.M.yyyy HH:mm", { locale: cs });
  };

  // Get today's date in the correct format for datetime-local input
  const getTodayDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-blackouts-title">
                  Blokace
                </h1>
                <p className="text-slate-600 mt-1">Spravujte blokované termíny a období nedostupnosti</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-blackout">
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat blokaci
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Přidat novou blokaci</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="startsAt">Začátek</Label>
                      <Input
                        id="startsAt"
                        type="datetime-local"
                        min={getTodayDateTime()}
                        {...form.register("startsAt")}
                        data-testid="input-blackout-start"
                      />
                      {form.formState.errors.startsAt && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.startsAt.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endsAt">Konec</Label>
                      <Input
                        id="endsAt"
                        type="datetime-local"
                        min={getTodayDateTime()}
                        {...form.register("endsAt")}
                        data-testid="input-blackout-end"
                      />
                      {form.formState.errors.endsAt && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.endsAt.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="reason">Důvod (volitelný)</Label>
                      <Textarea
                        id="reason"
                        placeholder="Důvod blokace, např. dovolená, nemoc..."
                        className="h-20"
                        {...form.register("reason")}
                        data-testid="textarea-blackout-reason"
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Zrušit
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createBlackout.isPending}
                        data-testid="button-save-blackout"
                      >
                        Přidat blokaci
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Načítám blokace...</p>
            </div>
          ) : blackouts.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Ban className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Žádné blokace</h3>
                <p className="text-slate-600 mb-4">
                  Přidejte blokaci pro období, kdy nejste dostupní pro rezervace.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-first-blackout">
                      <Plus className="mr-2 h-4 w-4" />
                      Přidat první blokaci
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Přidat novou blokaci</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Label htmlFor="startsAt">Začátek</Label>
                        <Input
                          id="startsAt"
                          type="datetime-local"
                          min={getTodayDateTime()}
                          {...form.register("startsAt")}
                        />
                        {form.formState.errors.startsAt && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.startsAt.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="endsAt">Konec</Label>
                        <Input
                          id="endsAt"
                          type="datetime-local"
                          min={getTodayDateTime()}
                          {...form.register("endsAt")}
                        />
                        {form.formState.errors.endsAt && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.endsAt.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="reason">Důvod (volitelný)</Label>
                        <Textarea
                          id="reason"
                          placeholder="Důvod blokace, např. dovolená, nemoc..."
                          className="h-20"
                          {...form.register("reason")}
                        />
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsDialogOpen(false)}
                        >
                          Zrušit
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createBlackout.isPending}
                        >
                          Přidat blokaci
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {blackouts.map((blackout) => (
                <Card key={blackout.id} data-testid={`blackout-${blackout.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                            <Ban className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900" data-testid={`text-blackout-period-${blackout.id}`}>
                              {formatDateTimeShort(blackout.startsAt)} - {formatDateTimeShort(blackout.endsAt)}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600" data-testid={`text-blackout-full-period-${blackout.id}`}>
                            {formatDateTime(blackout.startsAt)} až {formatDateTime(blackout.endsAt)}
                          </p>
                          {blackout.reason && (
                            <p className="text-sm text-slate-600 mt-2" data-testid={`text-blackout-reason-${blackout.id}`}>
                              <strong>Důvod:</strong> {blackout.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blackout.id)}
                        className="text-red-500 hover:text-red-600"
                        data-testid={`button-delete-blackout-${blackout.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
