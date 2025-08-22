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
import { Users, Search, UserCheck, Edit, Eye, Settings } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

export default function SuperAdminUsers() {
  const [filters, setFilters] = useState({
    organizationId: "all",
    search: "",
    status: "all"
  });
  const [impersonateUser, setImpersonateUser] = useState<any>(null);
  const [impersonateReason, setImpersonateReason] = useState("");
  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/super-admin/users", filters],
    queryFn: () => superAdminApi.getUsers(filters)
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["/api/super-admin/organizations", { status: "all" }],
    queryFn: () => superAdminApi.getOrganizations({ status: "all" })
  });

  const impersonateMutation = useMutation({
    mutationFn: ({ targetUserId, reason }: { targetUserId: string; reason: string }) =>
      superAdminApi.impersonateUser({ targetUserId, reason }),
    onSuccess: (data) => {
      setIsImpersonateOpen(false);
      setImpersonateReason("");
      toast({
        title: "Impersonace spuštěna",
        description: "Nyní jste přihlášeni jako vybraný uživatel"
      });
      // Redirect to the user's dashboard
      window.location.href = "/app";
    },
    onError: (error: any) => {
      toast({
        title: "Chyba impersonace",
        description: error.message || "Nepodařilo se spustit impersonaci",
        variant: "destructive"
      });
    }
  });

  const handleImpersonate = (user: any) => {
    setImpersonateUser(user);
    setIsImpersonateOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800">Aktivní</Badge>;
      case "inactive":
        return <Badge variant="secondary">Neaktivní</Badge>;
      case "pending":
        return <Badge variant="outline">Čeká na ověření</Badge>;
      case "suspended":
        return <Badge variant="destructive">Pozastavený</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
      case "editor":
        return <Badge variant="outline">Editor</Badge>;
      case "viewer":
        return <Badge variant="secondary">Prohlížeč</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
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
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-users-title">
          Správa uživatelů
        </h1>
        <p className="text-muted-foreground mt-2">
          Správa všech uživatelských účtů v systému
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Hledat</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email nebo jméno..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                  data-testid="input-search-users"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Organizace</Label>
              <Select
                value={filters.organizationId}
                onValueChange={(value) => setFilters({ ...filters, organizationId: value })}
              >
                <SelectTrigger data-testid="select-organization-filter">
                  <SelectValue placeholder="Všechny organizace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny organizace</SelectItem>
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
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny</SelectItem>
                  <SelectItem value="active">Aktivní</SelectItem>
                  <SelectItem value="inactive">Neaktivní</SelectItem>
                  <SelectItem value="pending">Čeká na ověření</SelectItem>
                  <SelectItem value="suspended">Pozastavený</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-4">
        {users.map((user: any) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" data-testid={`user-name-${user.id}`}>
                      {user.username || user.email}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user.organizationName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {getStatusBadge(user.status)}
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="text-xs text-muted-foreground">
                      Registrován {format(new Date(user.createdAt), "d.M.yyyy", { locale: cs })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Poslední přihlášení {user.lastLoginAt ? format(new Date(user.lastLoginAt), "d.M.yyyy HH:mm", { locale: cs }) : "Nikdy"}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      data-testid={`button-view-user-${user.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      data-testid={`button-edit-user-${user.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImpersonate(user)}
                      data-testid={`button-impersonate-user-${user.id}`}
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Žádní uživatelé</h3>
              <p className="text-muted-foreground">
                Nenalezeni žádní uživatelé odpovídající zadaným filtrům
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Impersonate Dialog */}
      <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonovat uživatele</DialogTitle>
            <DialogDescription>
              Opravdu se chcete přihlásit jako uživatel "{impersonateUser?.email}"? 
              Tato akce bude zaznamenána v audit logu.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Důvod impersonace</Label>
              <Textarea
                id="reason"
                placeholder="Zadejte důvod impersonace (povinné)..."
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                data-testid="textarea-impersonate-reason"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsImpersonateOpen(false)}>
                Zrušit
              </Button>
              <Button
                onClick={() => {
                  if (impersonateUser && impersonateReason.trim()) {
                    impersonateMutation.mutate({
                      targetUserId: impersonateUser.id,
                      reason: impersonateReason.trim()
                    });
                  }
                }}
                disabled={!impersonateReason.trim() || impersonateMutation.isPending}
                data-testid="button-confirm-impersonate"
              >
                {impersonateMutation.isPending ? "Spouštím..." : "Impersonovat"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}