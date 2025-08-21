import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function BillingConnectRefreshPage() {
  const { toast } = useToast();

  const refreshStripeLink = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/billing/connect/create");
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to new Stripe onboarding link
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při obnovování odkazu",
        description: error.message || "Něco se pokazilo",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Odkaz vypršel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Odkaz pro dokončení nastavení Stripe účtu vypršel nebo došlo k chybě. 
              Můžete získat nový odkaz a pokračovat v nastavování.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <Button 
              onClick={() => refreshStripeLink.mutate()}
              disabled={refreshStripeLink.isPending}
              className="w-full"
              data-testid="button-refresh-stripe-link"
            >
              {refreshStripeLink.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Získávám nový odkaz...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Získat nový odkaz
                </>
              )}
            </Button>
            
            <Link href="/app/billing">
              <Button variant="outline" className="w-full" data-testid="button-back-to-billing-refresh">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zpět na správu plateb
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}