import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BillingStatus {
  plan: string;
  subscriptionStatus: string;
  currentPeriodEnd?: string;
}

export default function BillingSuccess() {
  const [, navigate] = useLocation();
  
  // Get session_id from URL params
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session_id');

  const { data: billingStatus, refetch } = useQuery<BillingStatus>({
    queryKey: ["/api/billing/status"],
    queryFn: () => apiRequest("GET", "/api/billing/status").then(res => res.json()),
    refetchInterval: 2000, // Poll every 2 seconds
    refetchIntervalInBackground: false
  });

  useEffect(() => {
    // Refetch billing status when component mounts to get latest data
    refetch();
  }, [refetch]);

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Neplatný odkaz</h1>
            <p className="text-slate-600 mb-6">Tento odkaz pro potvrzení platby není platný.</p>
            <Button onClick={() => navigate('/pricing')} data-testid="button-back-to-pricing">
              Zpět na cenové plány
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-green-100 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-slate-900" data-testid="text-success-title">
            Platba byla úspěšná!
          </CardTitle>
          <CardDescription data-testid="text-success-description">
            Váš účet byl úspěšně upgradován
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {billingStatus && (
            <div className="text-center p-4 bg-green-50 rounded-lg" data-testid="status-upgrade-info">
              <p className="font-medium text-green-800">
                Nový plán: <span className="font-bold">{billingStatus.plan}</span>
              </p>
              <p className="text-sm text-green-600 mt-1">
                Status: {billingStatus.subscriptionStatus === 'active' ? 'Aktivní' : 'Zpracovává se'}
              </p>
              {billingStatus.currentPeriodEnd && (
                <p className="text-sm text-green-600">
                  Platný do: {new Date(billingStatus.currentPeriodEnd).toLocaleDateString('cs-CZ')}
                </p>
              )}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-medium text-slate-900">Co se stalo:</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Platba byla úspěšně zpracována
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Váš účet byl upgradován
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Nové funkce jsou nyní dostupné
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="w-full"
              data-testid="button-go-to-dashboard"
            >
              Přejít na dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/pricing')}
              data-testid="button-view-pricing"
            >
              Zobrazit cenové plány
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-slate-500">
              E-mail s potvrzením platby vám byl zaslán na vaši e-mailovou adresu.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}