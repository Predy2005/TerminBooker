import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, AlertTriangle, Clock } from "lucide-react";

export default function BookingCancel() {
  const [location] = useLocation();
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const booking = params.get('booking_id');
    setBookingId(booking);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-8 w-8" />
          </div>
          
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            Platba zrušena
          </h1>
          
          <p className="text-slate-600 mb-6">
            Platba byla zrušena. Vaše rezervace zůstává dočasně blokována.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-amber-700 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Časový limit</span>
            </div>
            <p className="text-xs text-amber-600">
              Rezervace vyprší za 15 minut, pokud nebude zaplacena.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-center space-x-2 text-slate-600">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Slot zůstává rezervován</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => window.history.back()}
              className="w-full"
              data-testid="button-retry-payment"
            >
              Zkusit znovu
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