import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Ban } from "lucide-react";
import type { Booking } from "@/types";

interface TodayScheduleProps {
  bookings: Booking[];
}

export default function TodaySchedule({ bookings }: TodayScheduleProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-amber-500";
      case "CANCELLED":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      CONFIRMED: "bg-green-100 text-green-800",
      PENDING: "bg-amber-100 text-amber-800", 
      CANCELLED: "bg-red-100 text-red-800"
    };

    const labels = {
      CONFIRMED: "Potvrzeno",
      PENDING: "K potvrzení",
      CANCELLED: "Zrušeno"
    };

    return (
      <Badge className={colors[status as keyof typeof colors]} variant="secondary">
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const sortedBookings = [...bookings].sort((a, b) => 
    new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                Dnešní program
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
                  Den
                </Button>
                <Button size="sm">
                  Týden
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
                  Měsíc
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {sortedBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mx-auto">
                    📅
                  </div>
                </div>
                <p className="text-slate-600">Žádné rezervace na dnes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className="flex items-center p-4 bg-slate-50 rounded-lg"
                    data-testid={`today-booking-${booking.id}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-2 h-12 ${getStatusColor(booking.status)} rounded-full`}></div>
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-slate-900" data-testid={`text-booking-customer-name-${booking.id}`}>
                            {booking.customerName}
                          </h3>
                          <p className="text-sm text-slate-600" data-testid={`text-booking-service-name-${booking.id}`}>
                            {booking.service?.name}
                          </p>
                          {booking.customerPhone && (
                            <p className="text-xs text-slate-500" data-testid={`text-booking-phone-${booking.id}`}>
                              {booking.customerPhone}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900" data-testid={`text-booking-time-${booking.id}`}>
                            {formatTime(booking.startsAt)} - {formatTime(booking.endsAt)}
                          </p>
                          {getStatusBadge(booking.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Rychlé akce</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start bg-primary/5 text-primary hover:bg-primary/10"
                data-testid="button-add-service"
              >
                <Plus className="mr-3 h-4 w-4" />
                Přidat službu
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-700 hover:bg-slate-100"
                data-testid="button-export-csv"
              >
                <Download className="mr-3 h-4 w-4" />
                Export CSV
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-700 hover:bg-slate-100"
                data-testid="button-block-time"
              >
                <Ban className="mr-3 h-4 w-4" />
                Blokovat čas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle>Nejnovější rezervace</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-4">
                Žádné nové rezervace
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((booking) => (
                  <div 
                    key={`recent-${booking.id}`}
                    className="flex items-center justify-between"
                    data-testid={`recent-booking-${booking.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900" data-testid={`text-recent-customer-${booking.id}`}>
                        {booking.customerName}
                      </p>
                      <p className="text-xs text-slate-500" data-testid={`text-recent-time-${booking.id}`}>
                        {format(new Date(booking.createdAt), "HH:mm")}
                      </p>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={
                        booking.status === "PENDING" ? "bg-amber-100 text-amber-800" :
                        booking.status === "CONFIRMED" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }
                      data-testid={`badge-recent-status-${booking.id}`}
                    >
                      {booking.status === "PENDING" ? "Nová" :
                       booking.status === "CONFIRMED" ? "Potvrzena" :
                       "Zrušena"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
