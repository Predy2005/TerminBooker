import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cs } from "date-fns/locale";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { bookingsApi, servicesApi } from "@/lib/api";
import { Calendar, Download, Edit, Trash2, User, Mail, Phone, Clock, DollarSign } from "lucide-react";
import type { Booking, Service } from "@/types";

const statusOptions = [
  { value: "PENDING", label: "K potvrzení", color: "bg-amber-100 text-amber-800" },
  { value: "CONFIRMED", label: "Potvrzeno", color: "bg-green-100 text-green-800" },
  { value: "CANCELLED", label: "Zrušeno", color: "bg-red-100 text-red-800" }
];

export default function Bookings() {
  const [filters, setFilters] = useState({
    from: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    to: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    serviceId: "",
    status: ""
  });
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [editStatus, setEditStatus] = useState<"PENDING" | "CONFIRMED" | "CANCELLED">("PENDING");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading: loadingBookings } = useQuery({
    queryKey: ["/api/bookings", filters],
    queryFn: () => {
      const params: any = {};
      if (filters.from) params.from = new Date(filters.from + "T00:00:00").toISOString();
      if (filters.to) params.to = new Date(filters.to + "T23:59:59").toISOString();
      if (filters.serviceId && filters.serviceId !== "all") params.serviceId = filters.serviceId;
      if (filters.status && filters.status !== "all") params.status = filters.status;
      return bookingsApi.getAll(params);
    }
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: servicesApi.getAll
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: string; note?: string } }) =>
      bookingsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsDialogOpen(false);
      setEditingBooking(null);
      toast({
        title: "Rezervace byla aktualizována",
        description: "Změny byly úspěšně uloženy."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při aktualizaci rezervace",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const deleteBooking = useMutation({
    mutationFn: bookingsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Rezervace byla zrušena",
        description: "Rezervace byla úspěšně zrušena."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při rušení rezervace",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const exportBookings = useMutation({
    mutationFn: () => {
      const params: any = {};
      if (filters.from) params.from = new Date(filters.from + "T00:00:00").toISOString();
      if (filters.to) params.to = new Date(filters.to + "T23:59:59").toISOString();
      if (filters.serviceId && filters.serviceId !== "all") params.serviceId = filters.serviceId;
      if (filters.status && filters.status !== "all") params.status = filters.status;
      return bookingsApi.exportCsv(params);
    },
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rezervace-${format(new Date(), "yyyy-MM-dd")}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export byl úspěšný",
        description: "CSV soubor byl stažen."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při exportu",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setEditNote(booking.note || "");
    setEditStatus(booking.status);
    setIsDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingBooking) return;
    
    updateBooking.mutate({
      id: editingBooking.id,
      data: {
        status: editStatus,
        note: editNote
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Opravdu chcete zrušit tuto rezervaci? Tato akce je nevratná.")) {
      deleteBooking.mutate(id);
    }
  };

  const getStatusBadge = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return (
      <Badge className={option?.color} variant="secondary">
        {option?.label || status}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "d.M.yyyy HH:mm", { locale: cs });
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
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-bookings-title">
                  Rezervace
                </h1>
                <p className="text-slate-600 mt-1">Spravujte všechny rezervace a jejich stavy</p>
              </div>
              <Button
                onClick={() => exportBookings.mutate()}
                disabled={exportBookings.isPending}
                data-testid="button-export-csv"
              >
                <Download className="mr-2 h-4 w-4" />
                {exportBookings.isPending ? "Exportuji..." : "Export CSV"}
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="px-6 py-4 bg-white border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="from">Od</Label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                onChange={(e) => setFilters(prev => ({ ...prev, from: e.target.value }))}
                data-testid="input-filter-from"
              />
            </div>
            <div>
              <Label htmlFor="to">Do</Label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                onChange={(e) => setFilters(prev => ({ ...prev, to: e.target.value }))}
                data-testid="input-filter-to"
              />
            </div>
            <div>
              <Label htmlFor="service">Služba</Label>
              <Select
                value={filters.serviceId}
                onValueChange={(value) => setFilters(prev => ({ ...prev, serviceId: value }))}
              >
                <SelectTrigger data-testid="select-filter-service">
                  <SelectValue placeholder="Všechny služby" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny služby</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="Všechny stavy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny stavy</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content */}
        <main className="p-6">
          {loadingBookings ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Načítám rezervace...</p>
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <div className="text-slate-400 mb-4">
                  <Calendar className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Žádné rezervace</h3>
                <p className="text-slate-600">
                  Pro zvolené filtry nebyly nalezeny žádné rezervace.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} data-testid={`booking-${booking.id}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-slate-900" data-testid={`text-booking-customer-${booking.id}`}>
                              {booking.customerName}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div>
                              <div className="flex items-center mb-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                <span className="font-medium">Termín:</span>
                              </div>
                              <p data-testid={`text-booking-datetime-${booking.id}`}>
                                {formatDateTime(booking.startsAt)} - {format(new Date(booking.endsAt), "HH:mm")}
                              </p>
                              <p className="text-slate-500" data-testid={`text-booking-service-${booking.id}`}>
                                {booking.service?.name}
                              </p>
                            </div>
                            
                            <div>
                              <div className="flex items-center mb-1">
                                <Mail className="h-4 w-4 mr-2" />
                                <span className="font-medium">Kontakt:</span>
                              </div>
                              <p data-testid={`text-booking-email-${booking.id}`}>
                                {booking.customerEmail}
                              </p>
                              {booking.customerPhone && (
                                <p className="flex items-center" data-testid={`text-booking-phone-${booking.id}`}>
                                  <Phone className="h-3 w-3 mr-1" />
                                  {booking.customerPhone}
                                </p>
                              )}
                            </div>
                            
                            <div>
                              <div className="flex items-center mb-1">
                                <Clock className="h-4 w-4 mr-2" />
                                <span className="font-medium">Detaily:</span>
                              </div>
                              <p>Délka: {booking.service?.durationMin} min</p>
                              {booking.service?.priceCzk && (
                                <p className="flex items-center">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  {booking.service.priceCzk.toLocaleString()} Kč
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {booking.note && (
                            <div className="mt-3 p-2 bg-slate-50 rounded text-sm">
                              <span className="font-medium text-slate-700">Poznámka:</span> {booking.note}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(booking)}
                          className="text-primary hover:text-blue-600"
                          data-testid={`button-edit-booking-${booking.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(booking.id)}
                          className="text-red-500 hover:text-red-600"
                          data-testid={`button-delete-booking-${booking.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upravit rezervaci</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">
                  {editingBooking.customerName} - {editingBooking.service?.name}
                </h4>
                <p className="text-sm text-slate-600">
                  {formatDateTime(editingBooking.startsAt)} - {format(new Date(editingBooking.endsAt), "HH:mm")}
                </p>
              </div>

              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(value: any) => setEditStatus(value)}
                >
                  <SelectTrigger data-testid="select-edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editNote">Poznámka</Label>
                <Textarea
                  id="editNote"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Interní poznámka k rezervaci..."
                  className="h-20"
                  data-testid="textarea-edit-note"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-edit"
                >
                  Zrušit
                </Button>
                <Button 
                  onClick={handleUpdate}
                  disabled={updateBooking.isPending}
                  data-testid="button-save-booking"
                >
                  {updateBooking.isPending ? "Ukládám..." : "Uložit změny"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
