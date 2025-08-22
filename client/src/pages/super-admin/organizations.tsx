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
import { useToast } from "@/hooks/use-toast";
import { superAdminApi } from "@/lib/super-admin-api";
import { Building2, Search, Download, Eye, Ban, CheckCircle, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import type { OrganizationFilter } from "@shared/super-admin-schema";

export default function SuperAdminOrganizations() {
  const [filters, setFilters] = useState<OrganizationFilter>({});
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ["/api/super-admin/organizations", filters],
    queryFn: () => superAdminApi.getOrganizations(filters)
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      superAdminApi.deactivateOrganization(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      setIsDeactivateOpen(false);
      setDeactivateReason("");
      toast({
        title: "Podnik deaktivován",
        description: "Podnik byl úspěšně deaktivován"
      });
    }
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => superAdminApi.activateOrganization(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/super-admin/organizations"] });
      toast({
        title: "Podnik aktivován",
        description: "Podnik byl úspěšně aktivován"
      });
    }
  });

  const handleExport = async () => {
    try {
      const blob = await superAdminApi.exportOrganizations(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `podniky-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Chyba exportu",
        description: "Nepodařilo se exportovat data",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktivní</Badge>;
      case "inactive":
        return <Badge variant="secondary">Neaktivní</Badge>;
      case "trial":
        return <Badge variant="outline">Zkušební</Badge>;
      case "suspended":
        return <Badge variant="destructive">Pozastavený</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "free":
        return <Badge variant="outline">Zdarma</Badge>;
      case "basic":
        return <Badge variant="secondary">Základní</Badge>;
      case "pro":
        return <Badge className="bg-blue-100 text-blue-800">Pro</Badge>;
      case "enterprise":
        return <Badge className="bg-purple-100 text-purple-800">Enterprise</Badge>;
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-organizations-title">
            Správa podniků
          </h1>
          <p className="text-muted-foreground mt-2">
            Správa všech organizací v systému
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" data-testid="button-export-organizations">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Hledat</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Název podniku..."
                  value={filters.search || ""}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                  data-testid="input-search-organizations"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Stav</Label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => setFilters({ ...filters, status: value as any })}
              >
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="inactive">Neaktivní</SelectItem>
                  <SelectItem value="trial">Zkušební</SelectItem>
                  <SelectItem value="paid">Placené</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plán</Label>
              <Select
                value={filters.plan || "all"}
                onValueChange={(value) => setFilters({ ...filters, plan: value as any })}
              >
                <SelectTrigger data-testid="select-plan-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  <SelectItem value="free">Zdarma</SelectItem>
                  <SelectItem value="basic">Základní</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Řazení</Label>
              <Select
                value={filters.sortBy || "name"}
                onValueChange={(value) => setFilters({ ...filters, sortBy: value as any })}
              >
                <SelectTrigger data-testid="select-sort-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Název</SelectItem>
                  <SelectItem value="created">Datum vytvoření</SelectItem>
                  <SelectItem value="revenue">Tržby</SelectItem>
                  <SelectItem value="bookings">Počet rezervací</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <div className="grid grid-cols-1 gap-4">
        {organizations.map((org: any) => (
          <Card key={org.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`org-name-${org.id}`}>
                      {org.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {org.email} • {org.slug}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(org.status)}
                      {getPlanBadge(org.plan)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="font-medium">
                      {org.totalBookings} rezervací
                    </div>
                    <div className="text-muted-foreground">
                      {org.totalRevenue?.toLocaleString('cs-CZ')} Kč
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Vytvořeno {format(new Date(org.createdAt), "d.M.yyyy", { locale: cs })}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedOrg(org)}
                      data-testid={`button-view-org-${org.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    {org.status === "active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrg(org);
                          setIsDeactivateOpen(true);
                        }}
                        data-testid={`button-deactivate-org-${org.id}`}
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => activateMutation.mutate(org.id)}
                        disabled={activateMutation.isPending}
                        data-testid={`button-activate-org-${org.id}`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {organizations.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Žádné podniky</h3>
              <p className="text-muted-foreground">
                Nenalezeny žádné podniky odpovídající zadaným filtrům
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Deactivate Dialog */}
      <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deaktivovat podnik</DialogTitle>
            <DialogDescription>
              Opravdu chcete deaktivovat podnik "{selectedOrg?.name}"? 
              Tato akce znemožní přístup k systému.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Důvod deaktivace</Label>
              <Textarea
                id="reason"
                placeholder="Zadejte důvod deaktivace..."
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                data-testid="textarea-deactivate-reason"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeactivateOpen(false)}>
                Zrušit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (selectedOrg && deactivateReason.trim()) {
                    deactivateMutation.mutate({
                      id: selectedOrg.id,
                      reason: deactivateReason.trim()
                    });
                  }
                }}
                disabled={!deactivateReason.trim() || deactivateMutation.isPending}
                data-testid="button-confirm-deactivate"
              >
                {deactivateMutation.isPending ? "Deaktivuji..." : "Deaktivovat"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}