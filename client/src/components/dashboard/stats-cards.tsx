import { Calendar, Clock, TrendingUp, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking } from "@/types";

interface StatsCardsProps {
  bookings: Booking[];
}

export default function StatsCards({ bookings }: StatsCardsProps) {
  const todayBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED").length;
  const totalRevenue = bookings
    .filter(b => b.status === "CONFIRMED" && b.service?.priceCzk)
    .reduce((sum, b) => sum + (b.service?.priceCzk || 0), 0);

  const stats = [
    {
      name: "Dnes rezervace",
      value: todayBookings,
      icon: Calendar,
      color: "primary"
    },
    {
      name: "K potvrzení",
      value: pendingBookings,
      icon: Clock,
      color: "warning"
    },
    {
      name: "Dnes tržby",
      value: `${totalRevenue.toLocaleString()} Kč`,
      icon: TrendingUp,
      color: "success"
    },
    {
      name: "Potvrzené",
      value: confirmedBookings,
      icon: Bell,
      color: "secondary"
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "warning":
        return "bg-amber-100 text-amber-600";
      case "success":
        return "bg-green-100 text-green-600";
      case "secondary":
        return "bg-slate-100 text-slate-600";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-slate-900" data-testid={`stat-${stat.name.toLowerCase().replace(/\s+/g, "-")}`}>
                    {stat.value}
                  </p>
                  <p className="text-sm text-slate-600">{stat.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
