import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar, Clock, CreditCard } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { publicApi } from "@/lib/api";

export default function BookingSuccess() {
  const [location] = useLocation();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const booking = params.get('booking_id');
    const session = params.get('session_id');
    
    setBookingId(booking);
    setSessionId(session);
  }, [location]);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      // For now, we'll show a generic success message
      // In a full implementation, you'd fetch booking details
      return { id: bookingId };
    },
    enabled: !!bookingId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {sessionId ? "Platba úspěšná!" : "Rezervace potvrzena!"}
          </h1>
          
          <p className="text-slate-600 mb-6">
            {sessionId 
              ? "Vaše platba byla úspěšně zpracována a rezervace je nyní potvrzena."
              : "Vaše rezervace byla úspěšně vytvořena."
            }
          </p>

          {sessionId && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-2 text-green-700">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm font-medium">Platba dokončena</span>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2 text-slate-600">
              <Calendar className="h-5 w-5" />
              <span className="text-sm">Potvrzení obdržíte e-mailem</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-600">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Rezervace je aktivní</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.close()}
              className="w-full"
              data-testid="button-close-window"
            >
              Zavřít okno
            </Button>
            
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
              data-testid="button-home"
            >
              Zpět na hlavní stránku
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}