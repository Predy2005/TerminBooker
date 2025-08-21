import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function BillingConnectSuccessPage() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate billing status to refresh the data
    queryClient.invalidateQueries({ queryKey: ['/api/billing/connect/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/billing/status'] });
    queryClient.invalidateQueries({ queryKey: ['/api/org'] });
  }, [queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl">Stripe účet byl úspěšně nastaven!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-600">
            Váš Stripe Express účet byl úspěšně vytvořen a ověřen. Nyní můžete přijímat online platby od zákazníků.
          </p>
          
          <div className="pt-4">
            <Link href="/app/billing">
              <Button className="w-full" data-testid="button-back-to-billing">
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