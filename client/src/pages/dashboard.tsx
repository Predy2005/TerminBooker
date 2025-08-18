import { useQuery } from "@tanstack/react-query";
import { format, startOfDay, endOfDay } from "date-fns";
import { cs } from "date-fns/locale";
import Sidebar from "@/components/layout/sidebar";
import StatsCards from "@/components/dashboard/stats-cards";
import TodaySchedule from "@/components/dashboard/today-schedule";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { bookingsApi } from "@/lib/api";

export default function Dashboard() {
  const today = new Date();
  
  const { data: todayBookings = [] } = useQuery({
    queryKey: ["/api/bookings", "today"],
    queryFn: () => bookingsApi.getAll({
      from: startOfDay(today).toISOString(),
      to: endOfDay(today).toISOString()
    })
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900" data-testid="text-dashboard-title">
                  Přehled
                </h1>
                <p className="text-slate-600 mt-1" data-testid="text-current-date">
                  Dnes je {format(today, "d. MMMM yyyy", { locale: cs })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button data-testid="button-new-booking">
                  <Plus className="mr-2 h-4 w-4" />
                  Nová rezervace
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Cards */}
          <StatsCards bookings={todayBookings} />

          {/* Today's Schedule */}
          <TodaySchedule bookings={todayBookings} />
        </main>
      </div>
    </div>
  );
}
