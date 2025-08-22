import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { superAdminApi } from "@/lib/super-admin-api";
import { Building2, Users, Calendar, CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { format, subMonths } from "date-fns";
import { cs } from "date-fns/locale";

export default function SuperAdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/super-admin/analytics"],
    queryFn: superAdminApi.getAnalytics
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center text-muted-foreground">
        Nepodařilo se načíst analytická data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-superadmin-title">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Přehled celého systému Bookli.cz
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem podniků</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-organizations">
              {analytics.totalOrganizations}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeOrganizations} aktivních
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-users">
              {analytics.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              Registrovaných účtů
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkem rezervací</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-bookings">
              {analytics.totalBookings.toLocaleString('cs-CZ')}
            </div>
            <p className="text-xs text-muted-foreground">
              Za celou dobu provozu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="stat-total-revenue">
              {analytics.totalRevenue.toLocaleString('cs-CZ')} Kč
            </div>
            <p className="text-xs text-muted-foreground">
              Zpracované platby
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Měsíční trendy</CardTitle>
          <CardDescription>
            Vývoj klíčových metrik za posledních 6 měsíců
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {analytics.monthlyStats.slice(-6).map((stat, index) => (
              <div key={stat.month} className="space-y-2">
                <h4 className="font-medium">
                  {format(new Date(stat.month), "MMMM yyyy", { locale: cs })}
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Podniky:</span>
                    <span>{stat.organizations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rezervace:</span>
                    <span>{stat.bookings.toLocaleString('cs-CZ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tržby:</span>
                    <span>{stat.revenue.toLocaleString('cs-CZ')} Kč</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Správa podniků
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Spravovat organizace, jejich stav a nastavení
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Správa uživatelů
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Spravovat uživatelské účty a oprávnění
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing & faktury
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Spravovat předplatné a generovat faktury
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Audit & bezpečnost
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Audit log, bezpečnostní události
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}