import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { superAdminApi } from "@/lib/super-admin-api";
import { AlertTriangle, User, Shield, Search, Download, Eye, Clock } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

export default function SuperAdminAudit() {
  const [filters, setFilters] = useState({
    userId: "",
    organizationId: "",
    action: "",
    from: "",
    to: "",
    limit: 100
  });

  const { toast } = useToast();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["/api/super-admin/audit", filters],
    queryFn: () => superAdminApi.getAuditLogs(filters)
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ["/api/super-admin/organizations", { status: "all" }],
    queryFn: () => superAdminApi.getOrganizations({ status: "all" })
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/super-admin/users", {}],
    queryFn: () => superAdminApi.getUsers({})
  });

  const handleExport = async () => {
    try {
      // This would export audit logs as CSV
      const blob = new Blob([generateAuditCsv(auditLogs)], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Chyba exportu",
        description: "Nepodařilo se exportovat audit log",
        variant: "destructive"
      });
    }
  };

  const generateAuditCsv = (logs: any[]) => {
    const headers = ["Datum", "Čas", "Uživatel", "Organizace", "Akce", "Zdroj", "IP adresa", "Detaily"];
    const rows = logs.map(log => [
      format(new Date(log.timestamp), "d.M.yyyy", { locale: cs }),
      format(new Date(log.timestamp), "HH:mm:ss", { locale: cs }),
      log.userEmail,
      log.organizationName || "",
      log.action,
      log.resource,
      log.ipAddress,
      log.details ? JSON.stringify(log.details) : ""
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const getActionBadge = (action: string) => {
    const actionMap: { [key: string]: { color: string; label: string } } = {
      'login': { color: 'bg-green-100 text-green-800', label: 'Přihlášení' },
      'logout': { color: 'bg-gray-100 text-gray-800', label: 'Odhlášení' },
      'create': { color: 'bg-blue-100 text-blue-800', label: 'Vytvoření' },
      'update': { color: 'bg-yellow-100 text-yellow-800', label: 'Úprava' },
      'delete': { color: 'bg-red-100 text-red-800', label: 'Smazání' },
      'impersonate': { color: 'bg-purple-100 text-purple-800', label: 'Impersonace' },
      'export': { color: 'bg-cyan-100 text-cyan-800', label: 'Export' },
      'failed_login': { color: 'bg-red-100 text-red-800', label: 'Neúspěšné přihlášení' }
    };

    const config = actionMap[action] || { color: 'bg-gray-100 text-gray-800', label: action };
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getRiskLevel = (action: string, details?: any) => {
    const highRiskActions = ['delete', 'impersonate', 'failed_login'];
    const mediumRiskActions = ['update', 'export'];
    
    if (highRiskActions.includes(action)) {
      return <Badge variant="destructive">Vysoké riziko</Badge>;
    } else if (mediumRiskActions.includes(action)) {
      return <Badge className="bg-yellow-100 text-yellow-800">Střední riziko</Badge>;
    } else {
      return <Badge variant="outline">Nízké riziko</Badge>;
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
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-audit-title">
            Audit & Bezpečnost
          </h1>
          <p className="text-muted-foreground mt-2">
            Přehled všech bezpečnostních událostí a akcí uživatelů
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" data-testid="button-export-audit">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem událostí</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-events">
              {auditLogs.length.toLocaleString('cs-CZ')}
            </div>
            <p className="text-xs text-muted-foreground">
              Za vybrané období
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vysoké riziko</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="stat-high-risk">
              {auditLogs.filter(log => ['delete', 'impersonate', 'failed_login'].includes(log.action)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Události vysokého rizika
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivní uživatelé</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-active-users">
              {new Set(auditLogs.map(log => log.userId)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Unikátní uživatelé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Poslední událost</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold" data-testid="stat-last-event">
              {auditLogs.length > 0 ? format(new Date(auditLogs[0].timestamp), "HH:mm", { locale: cs }) : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {auditLogs.length > 0 ? format(new Date(auditLogs[0].timestamp), "d.M.yyyy", { locale: cs }) : "Žádné události"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Uživatel</Label>
              <Select
                value={filters.userId}
                onValueChange={(value) => setFilters({ ...filters, userId: value })}
              >
                <SelectTrigger data-testid="select-user-filter">
                  <SelectValue placeholder="Všichni uživatelé" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všichni uživatelé</SelectItem>
                  {users.slice(0, 50).map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Akce</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters({ ...filters, action: value })}
              >
                <SelectTrigger data-testid="select-action-filter">
                  <SelectValue placeholder="Všechny akce" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny akce</SelectItem>
                  <SelectItem value="login">Přihlášení</SelectItem>
                  <SelectItem value="logout">Odhlášení</SelectItem>
                  <SelectItem value="create">Vytvoření</SelectItem>
                  <SelectItem value="update">Úprava</SelectItem>
                  <SelectItem value="delete">Smazání</SelectItem>
                  <SelectItem value="impersonate">Impersonace</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="failed_login">Neúspěšné přihlášení</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Od</Label>
              <Input
                type="date"
                value={filters.from}
                onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                data-testid="input-date-from"
              />
            </div>

            <div className="space-y-2">
              <Label>Do</Label>
              <Input
                type="date"
                value={filters.to}
                onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                data-testid="input-date-to"
              />
            </div>

            <div className="space-y-2">
              <Label>Limit</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => setFilters({ ...filters, limit: parseInt(value) })}
              >
                <SelectTrigger data-testid="select-limit-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 záznamů</SelectItem>
                  <SelectItem value="100">100 záznamů</SelectItem>
                  <SelectItem value="200">200 záznamů</SelectItem>
                  <SelectItem value="500">500 záznamů</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
          <CardDescription>
            Chronologický přehled všech bezpečnostních událostí
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {auditLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionBadge(log.action)}
                        {getRiskLevel(log.action, log.details)}
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(log.timestamp), "d.M.yyyy HH:mm:ss", { locale: cs })}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm">
                          <span><strong>Uživatel:</strong> {log.userEmail}</span>
                          {log.organizationName && (
                            <span><strong>Organizace:</strong> {log.organizationName}</span>
                          )}
                          <span><strong>Zdroj:</strong> {log.resource}</span>
                          {log.resourceId && (
                            <span><strong>ID:</strong> {log.resourceId.slice(-8)}</span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span><strong>IP:</strong> {log.ipAddress}</span>
                          <span className="truncate max-w-md">
                            <strong>User Agent:</strong> {log.userAgent}
                          </span>
                        </div>
                        
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="text-sm">
                            <strong>Detaily:</strong>
                            <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {auditLogs.length === 0 && (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Žádné události</h3>
                <p className="text-muted-foreground">
                  Nenalezeny žádné audit události odpovídající zadaným filtrům
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}