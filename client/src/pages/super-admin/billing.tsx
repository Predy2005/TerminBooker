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
import { CreditCard, Search, Plus, Download, FileText, DollarSign, Receipt, TrendingUp, Eye } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

function BillingPlansTab() {
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/super-admin/billing/plans"],
    queryFn: superAdminApi.getBillingPlans
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/super-admin/billing/invoices"],
    queryFn: () => superAdminApi.getInvoices({})
  });

  if (plansLoading || invoicesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Billing Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Billing plány
          </CardTitle>
          <CardDescription>
            Přehled všech dostupných plánů pro organizace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans?.map((plan: any) => (
              <Card key={plan.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{plan.name}</h3>
                    <Badge variant={plan.popular ? "default" : "secondary"}>
                      {plan.popular ? "Populární" : "Standard"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">
                    {plan.price} Kč
                    <span className="text-sm font-normal text-muted-foreground">/měsíc</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground">
                      Limit rezervací: {plan.features.bookingLimit === -1 ? "Neomezeno" : plan.features.bookingLimit}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Stripe Connect: {plan.features.stripeConnect ? "Ano" : "Ne"}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nedávné faktury
          </CardTitle>
          <CardDescription>
            Nejnovější faktury za předplatné organizací
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices?.slice(0, 5).map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{invoice.organizationName}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.items[0]?.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vytvořeno: {format(new Date(invoice.createdAt), "d. M. yyyy", { locale: cs })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">{invoice.amount} Kč</p>
                  <Badge variant={
                    invoice.status === "paid" ? "default" : 
                    invoice.status === "sent" ? "secondary" : "destructive"
                  }>
                    {invoice.status === "paid" ? "Zaplaceno" : 
                     invoice.status === "sent" ? "Odesláno" : "Neúspěšné"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BookingPaymentsTab() {
  const [filters, setFilters] = useState({
    organizationId: "all",
    status: "all"
  });

  const { data: organizations } = useQuery({
    queryKey: ["/api/super-admin/organizations"],
    queryFn: () => superAdminApi.getOrganizations({})
  });

  const { data: payments, isLoading } = useQuery({
    queryKey: ["/api/super-admin/booking-payments", filters],
    queryFn: () => superAdminApi.getBookingPayments(filters)
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const totalRevenue = payments?.filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + p.organizationReceived, 0) || 0;
  const totalFees = payments?.filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + p.platformFee, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové tržby podniků</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('cs-CZ')} Kč</div>
            <p className="text-xs text-muted-foreground">Za dokončené platby</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platformové poplatky</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFees.toLocaleString('cs-CZ')} Kč</div>
            <p className="text-xs text-muted-foreground">4% z dokončených plateb</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Počet plateb</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Celkem plateb</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Organizace</Label>
              <Select
                value={filters.organizationId}
                onValueChange={(value) => setFilters({ ...filters, organizationId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Všechny organizace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny organizace</SelectItem>
                  {organizations?.map((org: any) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stav platby</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Všechny stavy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny stavy</SelectItem>
                  <SelectItem value="completed">Dokončeno</SelectItem>
                  <SelectItem value="pending">Čekající</SelectItem>
                  <SelectItem value="failed">Neúspěšné</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <Card>
        <CardHeader>
          <CardTitle>Platby za rezervace</CardTitle>
          <CardDescription>
            Přehled všech plateb od klientů za rezervace služeb
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments?.map((payment: any) => (
              <div key={payment.id} className="border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium">{payment.organizationName}</p>
                    <p className="text-sm text-muted-foreground">{payment.serviceName}</p>
                  </div>
                  <div>
                    <p className="font-medium">{payment.customerName}</p>
                    <p className="text-sm text-muted-foreground">{payment.customerEmail}</p>
                  </div>
                  <div>
                    <p className="font-medium">{payment.amount} Kč</p>
                    <p className="text-sm text-muted-foreground">
                      Podnik: {payment.organizationReceived} Kč | Poplatek: {payment.platformFee} Kč
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant={
                        payment.status === "completed" ? "default" : 
                        payment.status === "pending" ? "secondary" : "destructive"
                      }>
                        {payment.status === "completed" ? "Dokončeno" : 
                         payment.status === "pending" ? "Čekající" : "Neúspěšné"}
                      </Badge>
                      {payment.paymentDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(payment.paymentDate), "d. M. yyyy H:mm", { locale: cs })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function OrganizationBillingTab() {
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  const { data: organizations } = useQuery({
    queryKey: ["/api/super-admin/organizations"],
    queryFn: () => superAdminApi.getOrganizations({})
  });

  const { data: billingDetails, isLoading } = useQuery({
    queryKey: ["/api/super-admin/organizations", selectedOrgId, "billing"],
    queryFn: () => superAdminApi.getOrganizationBilling(selectedOrgId),
    enabled: !!selectedOrgId
  });

  return (
    <div className="space-y-6">
      {/* Organization Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Vyberte organizaci</CardTitle>
          <CardDescription>
            Zobrazí detailní billing informace pro vybranou organizaci
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte organizaci..." />
            </SelectTrigger>
            <SelectContent>
              {organizations?.map((org: any) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name} - {org.plan} plán
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Billing Details */}
      {selectedOrgId && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : billingDetails ? (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Aktuální plán</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{billingDetails.billingPlan?.name}</div>
                    <p className="text-xs text-muted-foreground">
                      {billingDetails.billingPlan?.price} Kč/měsíc
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Zaplaceno celkem</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {billingDetails.summary.totalPaid.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-xs text-muted-foreground">Za předplatné</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Tržby z rezervací</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {billingDetails.summary.totalBookingRevenue.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-xs text-muted-foreground">Přijato organizací</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Naše poplatky</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">
                      {billingDetails.summary.totalPlatformFees.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-xs text-muted-foreground">4% z rezervací</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Invoices */}
              <Card>
                <CardHeader>
                  <CardTitle>Faktury za předplatné</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingDetails.invoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{invoice.items[0]?.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(invoice.createdAt), "d. M. yyyy", { locale: cs })}
                            {invoice.paidAt && (
                              <span> - Zaplaceno {format(new Date(invoice.paidAt), "d. M. yyyy", { locale: cs })}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{invoice.amount} Kč</p>
                          <Badge variant={invoice.status === "paid" ? "default" : "secondary"}>
                            {invoice.status === "paid" ? "Zaplaceno" : "Odesláno"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Booking Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Nedávné platby za rezervace</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {billingDetails.payments.map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{payment.serviceName}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.customerName} - {payment.customerEmail}
                          </p>
                          {payment.paymentDate && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(payment.paymentDate), "d. M. yyyy H:mm", { locale: cs })}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{payment.amount} Kč</p>
                          <p className="text-sm text-muted-foreground">
                            Organizace: {payment.organizationReceived} Kč | Poplatek: {payment.platformFee} Kč
                          </p>
                          <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                            {payment.status === "completed" ? "Dokončeno" : "Čekající"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Nepodařilo se načíst billing informace</p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function SuperAdminBilling() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-billing-title">
          Billing & Faktury
        </h1>
        <p className="text-muted-foreground mt-2">
          Správa předplatného, faktur a plateb za rezervace
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plans" data-testid="tab-billing-plans">
            Plány & Faktury
          </TabsTrigger>
          <TabsTrigger value="payments" data-testid="tab-booking-payments">
            Platby za rezervace
          </TabsTrigger>
          <TabsTrigger value="organization" data-testid="tab-organization-billing">
            Detail organizace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans">
          <BillingPlansTab />
        </TabsContent>

        <TabsContent value="payments">
          <BookingPaymentsTab />
        </TabsContent>

        <TabsContent value="organization">
          <OrganizationBillingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}