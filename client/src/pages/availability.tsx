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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { availabilityApi } from "@/lib/api";
import { Plus, Trash2, Clock } from "lucide-react";
import type { AvailabilityTemplate } from "@/types";

const availabilitySchema = z.object({
  weekday: z.number().min(0).max(6),
  startMinutes: z.number().min(0).max(1439),
  endMinutes: z.number().min(1).max(1440),
  slotStepMin: z.number().min(5).max(60)
}).refine(data => data.endMinutes > data.startMinutes, {
  message: "Konec musí být po začátku",
  path: ["endMinutes"]
});

type AvailabilityForm = z.infer<typeof availabilitySchema>;

const weekdayNames = [
  "Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"
];

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

export default function Availability() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/availability"],
    queryFn: availabilityApi.getAll
  });

  const createTemplate = useMutation({
    mutationFn: availabilityApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Šablona dostupnosti byla vytvořena",
        description: "Nová šablona byla úspěšně přidána."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při vytváření šablony",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteTemplate = useMutation({
    mutationFn: availabilityApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({
        title: "Šablona byla smazána",
        description: "Šablona dostupnosti byla úspěšně odstraněna."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při mazání šablony",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const form = useForm<AvailabilityForm>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      weekday: 1,
      startMinutes: 540, // 9:00
      endMinutes: 1020, // 17:00
      slotStepMin: 30
    }
  });

  const onSubmit = (data: AvailabilityForm) => {
    createTemplate.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("Opravdu chcete smazat tuto šablonu dostupnosti? Tato akce je nevratná.")) {
      deleteTemplate.mutate(id);
    }
  };

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.weekday]) {
      acc[template.weekday] = [];
    }
    acc[template.weekday].push(template);
    return acc;
  }, {} as Record<number, AvailabilityTemplate[]>);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-availability-title">
                  Dostupnost
                </h1>
                <p className="text-slate-600 mt-1">Nastavte své pracovní hodiny a dostupnost</p>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-availability">
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat dostupnost
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Přidat novou dostupnost</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="weekday">Den v týdnu</Label>
                      <Select
                        onValueChange={(value) => form.setValue("weekday", Number(value))}
                        defaultValue="1"
                      >
                        <SelectTrigger data-testid="select-weekday">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {weekdayNames.map((name, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Začátek</Label>
                        <Input
                          id="startTime"
                          type="time"
                          defaultValue="09:00"
                          onChange={(e) => form.setValue("startMinutes", timeToMinutes(e.target.value))}
                          data-testid="input-start-time"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">Konec</Label>
                        <Input
                          id="endTime"
                          type="time"
                          defaultValue="17:00"
                          onChange={(e) => form.setValue("endMinutes", timeToMinutes(e.target.value))}
                          data-testid="input-end-time"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="slotStepMin">Krok slotů (minuty)</Label>
                      <Select
                        onValueChange={(value) => form.setValue("slotStepMin", Number(value))}
                        defaultValue="30"
                      >
                        <SelectTrigger data-testid="select-slot-step">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minut</SelectItem>
                          <SelectItem value="30">30 minut</SelectItem>
                          <SelectItem value="60">60 minut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {form.formState.errors.endMinutes && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.endMinutes.message}
                      </p>
                    )}

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
                        disabled={createTemplate.isPending}
                        data-testid="button-save-availability"
                      >
                        Přidat dostupnost
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
              <p className="text-slate-600">Načítám dostupnost...</p>
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Clock className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Žádná dostupnost</h3>
                <p className="text-slate-600 mb-4">
                  Nastavte své pracovní hodiny pro jednotlivé dny v týdnu.
                </p>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-add-first-availability">
                      <Plus className="mr-2 h-4 w-4" />
                      Přidat první dostupnost
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Přidat novou dostupnost</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Label htmlFor="weekday">Den v týdnu</Label>
                        <Select
                          onValueChange={(value) => form.setValue("weekday", Number(value))}
                          defaultValue="1"
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {weekdayNames.map((name, index) => (
                              <SelectItem key={index} value={index.toString()}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startTime">Začátek</Label>
                          <Input
                            id="startTime"
                            type="time"
                            defaultValue="09:00"
                            onChange={(e) => form.setValue("startMinutes", timeToMinutes(e.target.value))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endTime">Konec</Label>
                          <Input
                            id="endTime"
                            type="time"
                            defaultValue="17:00"
                            onChange={(e) => form.setValue("endMinutes", timeToMinutes(e.target.value))}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="slotStepMin">Krok slotů (minuty)</Label>
                        <Select
                          onValueChange={(value) => form.setValue("slotStepMin", Number(value))}
                          defaultValue="30"
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minut</SelectItem>
                            <SelectItem value="30">30 minut</SelectItem>
                            <SelectItem value="60">60 minut</SelectItem>
                          </SelectContent>
                        </Select>
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
                          disabled={createTemplate.isPending}
                        >
                          Přidat dostupnost
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {weekdayNames.map((dayName, dayIndex) => {
                const dayTemplates = groupedTemplates[dayIndex] || [];
                return (
                  <Card key={dayIndex}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Clock className="mr-2 h-5 w-5" />
                        {dayName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {dayTemplates.length === 0 ? (
                        <p className="text-slate-600 text-sm">Žádná dostupnost nastavena</p>
                      ) : (
                        <div className="space-y-2">
                          {dayTemplates.map((template) => (
                            <div
                              key={template.id}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                              data-testid={`availability-${template.id}`}
                            >
                              <div className="flex items-center space-x-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {minutesToTime(template.startMinutes)} - {minutesToTime(template.endMinutes)}
                                </div>
                                <div className="text-sm text-slate-600">
                                  Krok: {template.slotStepMin} min
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(template.id)}
                                className="text-red-500 hover:text-red-600"
                                data-testid={`button-delete-availability-${template.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
