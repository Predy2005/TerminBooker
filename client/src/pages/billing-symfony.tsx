import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import { 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ExternalLink,
  Loader2,
  Shield,
  Banknote
} from "lucide-react";

export default function BillingSymfonyPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch Stripe Connect status from Symfony API
  const { data: connectStatus, isLoading } = useQuery<{stripeAccountId: string | null, status: string}>({
    queryKey: ['/api/billing/connect/status'],
    staleTime: 30000 // 30 seconds
  });

  const createStripeAccount = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/billing/connect/create");
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to Stripe onboarding
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při vytváření účtu",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'active':
        return {
          badge: <Badge variant="default" className="bg-green-500">Aktivní</Badge>,
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: "Stripe účet je aktivní",
          description: "Můžete přijímat online platby od zákazníků"
        };
      case 'restricted':
        return {
          badge: <Badge variant="secondary">Omezený</Badge>,
          icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
          title: "Stripe účet vyžaduje dodatečné informace",
          description: "Dokončete prosím nastavení účtu pro plnou funkcionalitu"
        };
      case 'pending':
      default:
        return {
          badge: <Badge variant="outline">Čeká na nastavení</Badge>,
          icon: <Clock className="h-5 w-5 text-gray-500" />,
          title: "Stripe účet není nastaven",
          description: "Založte si Stripe účet pro příjem online plateb"
        };
    }
  };

  const statusInfo = getStatusInfo(connectStatus?.status);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64 overflow-auto">
        <div className="p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Platby a fakturace</h1>
              <p className="text-slate-600">Nastavení a správa platební brány</p>
            </div>

      {/* Stripe Connect Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Online platby (Stripe Connect)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {statusInfo.icon}
              <div>
                <h3 className="font-medium">{statusInfo.title}</h3>
                <p className="text-sm text-slate-600">{statusInfo.description}</p>
              </div>
            </div>
            {statusInfo.badge}
          </div>

          {!connectStatus?.stripeAccountId ? (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Pro příjem online plateb potřebujete Stripe Express účet. Stripe zajišťuje bezpečné zpracování 
                  platebních karet a automatické výplaty na váš bankovní účet.
                </AlertDescription>
              </Alert>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Co budete potřebovat:</h4>
                <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                  <li>IČO nebo rodné číslo</li>
                  <li>Číslo bankovního účtu</li>
                  <li>Doklad totožnosti (občanský průkaz/pas)</li>
                  <li>Adresu podnikání nebo bydliště</li>
                </ul>
              </div>
              
              <Button 
                onClick={() => createStripeAccount.mutate()}
                disabled={createStripeAccount.isPending}
                className="w-full sm:w-auto"
                data-testid="button-create-stripe-symfony"
              >
                {createStripeAccount.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vytvářím účet...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Založit Stripe Express účet
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Stripe Account ID:</span>
                    <p className="font-mono text-xs mt-1">{connectStatus.stripeAccountId}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Stav:</span>
                    <div className="mt-1">{statusInfo.badge}</div>
                  </div>
                </div>
              </div>

              {connectStatus.status !== 'active' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Váš Stripe účet vyžaduje dodatečné nastavení. Klikněte níže pro dokončení ověření.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={() => createStripeAccount.mutate()}
                    disabled={createStripeAccount.isPending}
                    variant="outline"
                    data-testid="button-complete-stripe-symfony"
                  >
                    {createStripeAccount.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Připravuji...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Dokončit ověření ve Stripe
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Fees Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Poplatky za platby
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Stripe poplatky</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• Platební karty: 1.4% + 7 Kč</p>
                <p>• Výplaty na účet: zdarma</p>
                <p>• Měsíční fixní náklady: žádné</p>
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-2">Bookli poplatky</h3>
              <div className="text-sm text-slate-600 space-y-1">
                <p>• FREE plán: 5% z každé platby</p>
                <p>• PRO plán: 3% z každé platby</p>
                <p>• BUSINESS plán: 2% z každé platby</p>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertDescription className="text-sm">
              Bookli poplatky se automaticky odečítají z každé platby před výplatou na váš účet. 
              Všechny poplatky jsou uvedeny bez DPH.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Success and Refresh Pages Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informace o onboardingu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 space-y-2">
            <p>Po dokončení ověření ve Stripe se automaticky vrátíte zpět do administrace.</p>
            <p>Stav vašeho účtu se aktualizuje automaticky prostřednictvím webhooků.</p>
            <p>V případě problémů kontaktujte naši podporu.</p>
          </div>
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
    </div>
  );
}