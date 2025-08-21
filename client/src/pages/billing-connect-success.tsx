import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function BillingConnectSuccessPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Invalidate organization query to refresh status
    queryClient.invalidateQueries({ queryKey: ["/api/org"] });
    
    toast({
      title: "Stripe účet vytvořen",
      description: "Váš Stripe účet byl úspěšně nastaven. Může trvat několik minut, než se status aktualizuje."
    });

    // Redirect to billing page after a short delay
    const timer = setTimeout(() => {
      setLocation("/app/billing");
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast, queryClient, setLocation]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Stripe účet nastaven</CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-slate-600">
              Váš Stripe účet byl úspěšně vytvořen. Nyní můžete přijímat online platby od zákazníků.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-medium text-blue-900 mb-2">Co dál?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Nastavte služby s požadovanou platbou</li>
                <li>• Otestujte rezervační proces</li>
                <li>• Zkontrolujte nastavení výplat v Stripe</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/app/billing">
                  Přejít na fakturaci
                </Link>
              </Button>
              
              <Button variant="outline" asChild>
                <Link href="/app">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zpět do dashboardu
                </Link>
              </Button>
            </div>

            <p className="text-xs text-slate-500">
              Automaticky vás přesměrujeme za chvíli...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}