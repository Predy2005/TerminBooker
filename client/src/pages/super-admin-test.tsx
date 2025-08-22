import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminTest() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["/api/super-admin/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/super-admin/analytics");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Super Admin Panel Test
          </h1>
          <p className="text-muted-foreground mt-2">
            Testování API připojení a základních funkcí
          </p>
        </div>

        {analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Celkem podniků</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalOrganizations}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.activeOrganizations} aktivních
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalUsers}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Celkem rezervací</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalBookings.toLocaleString('cs-CZ')}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalRevenue.toLocaleString('cs-CZ')} Kč
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium mb-2 text-red-600">
                Chyba při načítání dat
              </h3>
              <p className="text-muted-foreground">
                Nepodařilo se připojit k Super Admin API
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}