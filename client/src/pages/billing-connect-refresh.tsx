import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function BillingConnectRefreshPage() {
  const { toast } = useToast();

  const retryOnboarding = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/billing/connect/create");
      return response.json();
    },
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při opakování",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <CardTitle>Nastavení přerušeno</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Nastavení Stripe účtu bylo přerušeno. Můžete se vrátit zpět do administrace nebo pokračovat v nastavení.
            </p>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-amber-900 mb-2">Důležité</h3>
              <p className="text-sm text-amber-800">
                Pro příjem online plateb musíte dokončit nastavení Stripe účtu. 
                Bez aktivního účtu nebudete moci přijímat platby od zákazníků.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => retryOnboarding.mutate()}
                disabled={retryOnboarding.isPending}
                className="w-full"
              >
                {retryOnboarding.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Pokračuji...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Pokračovat v nastavení
                  </>
                )}
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/app/billing">
                  Zpět na fakturaci
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}