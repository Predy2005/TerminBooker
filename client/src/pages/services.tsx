import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { servicesApi } from "@/lib/api";
import { Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react";
import type { Service } from "@/types";

const serviceSchema = z.object({
  name: z.string().min(2, "Název služby musí mít alespoň 2 znaky").max(80, "Název služby může mít maximálně 80 znaků"),
  durationMin: z.number().min(5, "Minimální délka služby je 5 minut").max(480, "Maximální délka služby je 480 minut"),
  priceCzk: z.number().positive("Cena musí být kladné číslo").optional(),
  isActive: z.boolean().optional()
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function Services() {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["/api/services"],
    queryFn: servicesApi.getAll
  });

  const createService = useMutation({
    mutationFn: servicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
      toast({
        title: "Služba byla vytvořena",
        description: "Nová služba byla úspěšně přidána."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při vytváření služby",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const updateService = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceForm> }) => 
      servicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      setIsDialogOpen(false);
      setEditingService(null);
      toast({
        title: "Služba byla aktualizována",
        description: "Změny byly úspěšně uloženy."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při aktualizaci služby",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteService = useMutation({
    mutationFn: servicesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Služba byla smazána",
        description: "Služba byla úspěšně odstraněna."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při mazání služby",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const form = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: "",
      durationMin: 60,
      priceCzk: undefined,
      isActive: true
    }
  });

  const openCreateDialog = () => {
    setEditingService(null);
    form.reset({
      name: "",
      durationMin: 60,
      priceCzk: undefined,
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    form.reset({
      name: service.name,
      durationMin: service.durationMin,
      priceCzk: service.priceCzk || undefined,
      isActive: service.isActive
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ServiceForm) => {
    if (editingService) {
      updateService.mutate({
        id: editingService.id,
        data
      });
    } else {
      createService.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Opravdu chcete smazat tuto službu? Tato akce je nevratná.")) {
      deleteService.mutate(id);
    }
  };

  const toggleServiceStatus = (service: Service) => {
    updateService.mutate({
      id: service.id,
      data: { isActive: !service.isActive }
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
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-services-title">
                  Služby
                </h1>
                <p className="text-slate-600 mt-1">Spravujte své služby a jejich nastavení</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} data-testid="button-add-service">
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat službu
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingService ? "Upravit službu" : "Přidat novou službu"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Název služby</Label>
                      <Input
                        id="name"
                        placeholder="Název služby"
                        {...form.register("name")}
                        data-testid="input-service-name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="durationMin">Délka (minuty)</Label>
                      <Input
                        id="durationMin"
                        type="number"
                        min="5"
                        max="480"
                        {...form.register("durationMin", { valueAsNumber: true })}
                        data-testid="input-service-duration"
                      />
                      {form.formState.errors.durationMin && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.durationMin.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="priceCzk">Cena (Kč)</Label>
                      <Input
                        id="priceCzk"
                        type="number"
                        min="0"
                        placeholder="Volitelné"
                        {...form.register("priceCzk", { 
                          setValueAs: v => v === "" ? undefined : Number(v)
                        })}
                        data-testid="input-service-price"
                      />
                      {form.formState.errors.priceCzk && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.priceCzk.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        {...form.register("isActive")}
                        defaultChecked={form.getValues("isActive")}
                        onCheckedChange={(checked) => form.setValue("isActive", checked)}
                        data-testid="switch-service-active"
                      />
                      <Label htmlFor="isActive">Aktivní služba</Label>
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
                        disabled={createService.isPending || updateService.isPending}
                        data-testid="button-save-service"
                      >
                        {editingService ? "Uložit změny" : "Přidat službu"}
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
              <p className="text-slate-600">Načítám služby...</p>
            </div>
          ) : services.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Clock className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Žádné služby</h3>
                <p className="text-slate-600 mb-4">
                  Začněte přidáním první služby pro vaše zákazníky.
                </p>
                <Button onClick={openCreateDialog} data-testid="button-add-first-service">
                  <Plus className="mr-2 h-4 w-4" />
                  Přidat první službu
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Seznam služeb</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Název
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Délka
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Cena
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Akce
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {services.map((service) => (
                        <tr key={service.id} data-testid={`service-row-${service.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900" data-testid={`text-service-name-${service.id}`}>
                              {service.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900" data-testid={`text-service-duration-${service.id}`}>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-slate-400" />
                              {service.durationMin} min
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900" data-testid={`text-service-price-${service.id}`}>
                            {service.priceCzk ? (
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1 text-slate-400" />
                                {service.priceCzk.toLocaleString()} Kč
                              </div>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={service.isActive ? "default" : "secondary"}
                              className={service.isActive ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
                              data-testid={`badge-service-status-${service.id}`}
                            >
                              {service.isActive ? "Aktivní" : "Neaktivní"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleServiceStatus(service)}
                                className="text-slate-600 hover:text-primary"
                                data-testid={`button-toggle-${service.id}`}
                              >
                                <Switch 
                                  checked={service.isActive}
                                  className="h-4 w-4"
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(service)}
                                className="text-primary hover:text-blue-600"
                                data-testid={`button-edit-${service.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(service.id)}
                                className="text-red-500 hover:text-red-600"
                                data-testid={`button-delete-${service.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
