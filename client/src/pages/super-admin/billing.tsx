import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { superAdminApi } from "@/lib/super-admin-api";
import { CreditCard, FileText, Plus, Edit, Download, Send, CheckCircle, X } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

export default function SuperAdminBilling() {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invoiceFilters, setInvoiceFilters] = useState({
    organizationId: "",
    status: "all",
    from: "",
    to: ""
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["/api/super-admin/billing/plans"],
    queryFn: superAdminApi.getBillingPlans
  });

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/super-admin/billing/invoices", invoiceFilters],
    queryFn: () => superAdminApi.getInvoices(invoiceFilters)
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["/api/super-admin/organizations", { status: "all" }],
    queryFn: () => superAdminApi.getOrganizations({ status: "all" })
  });

  const createPlanMutation = useMutation({
    mutationFn: superAdminApi.createBillingPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/billing/plans"] });
      setIsCreatePlanOpen(false);
      toast({
        title: "Plán vytvořen",
        description: "Nový plán byl úspěšně vytvořen"
      });
    }
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: superAdminApi.generateInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/billing/invoices"] });
      setIsCreateInvoiceOpen(false);
      toast({
        title: "Faktura vygenerována",
        description: "Nová faktura byla úspěšně vygenerována"
      });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-100 text-green-800">Zaplaceno</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800">Odesláno</Badge>;
      case "draft":
        return <Badge variant="outline">Koncept</Badge>;
      case "overdue":
        return <Badge variant="destructive">Po splatnosti</Badge>;
      case "cancelled":
        return <Badge variant="secondary">Stornováno</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (plansLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-billing-title">
          Billing & Faktury
        </h1>
        <p className="text-muted-foreground mt-2">
          Správa předplatných plánů a fakturace
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans" data-testid="tab-plans">Plány</TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Faktury</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          {/* Plans Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Předplatné plány</h2>
            <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-plan">
                  <Plus className="mr-2 h-4 w-4" />
                  Nový plán
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Vytvořit nový plán</DialogTitle>
                </DialogHeader>
                <CreatePlanForm 
                  onSubmit={(data) => createPlanMutation.mutate(data)}
                  isLoading={createPlanMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {plan.name}
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    {plan.price.toLocaleString('cs-CZ')} {plan.currency} / {plan.interval === "month" ? "měsíc" : "rok"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Funkce:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {plan.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="text-sm">
                      <div><strong>Max služeb:</strong> {plan.maxServices || "Neomezeno"}</div>
                      <div><strong>Max rezervací:</strong> {plan.maxBookings || "Neomezeno"}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {plans.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Žádné plány</h3>
                  <p className="text-muted-foreground">
                    Zatím nejsou vytvořeny žádné předplatné plány
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          {/* Invoices Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Faktury</h2>
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-invoice">
                  <Plus className="mr-2 h-4 w-4" />
                  Nová faktura
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Vygenerovat fakturu</DialogTitle>
                </DialogHeader>
                <CreateInvoiceForm 
                  organizations={organizations}
                  onSubmit={(data) => generateInvoiceMutation.mutate(data)}
                  isLoading={generateInvoiceMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>

          {/* Invoice Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filtry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Organizace</Label>
                  <Select
                    value={invoiceFilters.organizationId}
                    onValueChange={(value) => setInvoiceFilters({ ...invoiceFilters, organizationId: value })}
                  >
                    <SelectTrigger data-testid="select-organization-filter">
                      <SelectValue placeholder="Všechny organizace" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Všechny organizace</SelectItem>
                      {organizations.map((org: any) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stav</Label>
                  <Select
                    value={invoiceFilters.status}
                    onValueChange={(value) => setInvoiceFilters({ ...invoiceFilters, status: value })}
                  >
                    <SelectTrigger data-testid="select-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Všechny</SelectItem>
                      <SelectItem value="draft">Koncept</SelectItem>
                      <SelectItem value="sent">Odesláno</SelectItem>
                      <SelectItem value="paid">Zaplaceno</SelectItem>
                      <SelectItem value="overdue">Po splatnosti</SelectItem>
                      <SelectItem value="cancelled">Stornováno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Od</Label>
                  <Input
                    type="date"
                    value={invoiceFilters.from}
                    onChange={(e) => setInvoiceFilters({ ...invoiceFilters, from: e.target.value })}
                    data-testid="input-date-from"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Do</Label>
                  <Input
                    type="date"
                    value={invoiceFilters.to}
                    onChange={(e) => setInvoiceFilters({ ...invoiceFilters, to: e.target.value })}
                    data-testid="input-date-to"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices List */}
          <div className="grid grid-cols-1 gap-4">
            {invoices.map((invoice) => (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold text-lg" data-testid={`invoice-${invoice.id}`}>
                          Faktura #{invoice.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {invoice.organizationName}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-lg">
                          {invoice.amount.toLocaleString('cs-CZ')} {invoice.currency}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Splatnost: {format(new Date(invoice.dueDate), "d.M.yyyy", { locale: cs })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Vytvořeno: {format(new Date(invoice.createdAt), "d.M.yyyy", { locale: cs })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="outline" data-testid={`button-download-${invoice.id}`}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === "draft" && (
                          <Button size="sm" variant="outline" data-testid={`button-send-${invoice.id}`}>
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {invoices.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Žádné faktury</h3>
                  <p className="text-muted-foreground">
                    Nenalezeny žádné faktury odpovídající zadaným filtrům
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CreatePlanForm({ onSubmit, isLoading }: { onSubmit: (data: any) => void; isLoading: boolean }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    currency: "CZK",
    interval: "month",
    features: "",
    maxServices: "",
    maxBookings: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price),
      features: formData.features.split('\n').filter(f => f.trim()),
      maxServices: formData.maxServices ? parseInt(formData.maxServices) : null,
      maxBookings: formData.maxBookings ? parseInt(formData.maxBookings) : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Název plánu</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-plan-name"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Cena</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            data-testid="input-plan-price"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="interval">Interval</Label>
          <Select value={formData.interval} onValueChange={(value) => setFormData({ ...formData, interval: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Měsíční</SelectItem>
              <SelectItem value="year">Roční</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="features">Funkce (jedna na řádek)</Label>
        <Textarea
          id="features"
          value={formData.features}
          onChange={(e) => setFormData({ ...formData, features: e.target.value })}
          placeholder="Online rezervace&#10;Email notifikace&#10;Dashboard"
          data-testid="textarea-plan-features"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="maxServices">Max služeb</Label>
          <Input
            id="maxServices"
            type="number"
            value={formData.maxServices}
            onChange={(e) => setFormData({ ...formData, maxServices: e.target.value })}
            placeholder="Nevyplněno = neomezeno"
            data-testid="input-max-services"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="maxBookings">Max rezervací</Label>
          <Input
            id="maxBookings"
            type="number"
            value={formData.maxBookings}
            onChange={(e) => setFormData({ ...formData, maxBookings: e.target.value })}
            placeholder="Nevyplněno = neomezeno"
            data-testid="input-max-bookings"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} data-testid="button-submit-plan">
          {isLoading ? "Vytvářím..." : "Vytvořit plán"}
        </Button>
      </div>
    </form>
  );
}

function CreateInvoiceForm({ 
  organizations, 
  onSubmit, 
  isLoading 
}: { 
  organizations: any[];
  onSubmit: (data: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    organizationId: "",
    dueDate: "",
    items: [{ description: "", quantity: 1, unitPrice: 0 }]
  });

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="organizationId">Organizace</Label>
        <Select
          value={formData.organizationId}
          onValueChange={(value) => setFormData({ ...formData, organizationId: value })}
        >
          <SelectTrigger data-testid="select-invoice-organization">
            <SelectValue placeholder="Vyberte organizaci" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org: any) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Datum splatnosti</Label>
        <Input
          id="dueDate"
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          required
          data-testid="input-due-date"
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Položky faktury</Label>
          <Button type="button" size="sm" onClick={addItem} data-testid="button-add-item">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {formData.items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <Input
                placeholder="Popis položky"
                value={item.description}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                data-testid={`input-item-description-${index}`}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Množství"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                data-testid={`input-item-quantity-${index}`}
              />
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                placeholder="Jednotková cena"
                value={item.unitPrice}
                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                data-testid={`input-item-price-${index}`}
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => removeItem(index)}
                disabled={formData.items.length === 1}
                data-testid={`button-remove-item-${index}`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isLoading} data-testid="button-submit-invoice">
          {isLoading ? "Generuji..." : "Vygenerovat fakturu"}
        </Button>
      </div>
    </form>
  );
}