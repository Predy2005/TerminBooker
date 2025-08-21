import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown, Zap, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BillingStatus {
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  subscriptionStatus: string;
  currentPeriodEnd?: string;
}

const pricingPlans = [
  {
    id: 'FREE',
    name: 'FREE',
    price: '0 Kč',
    description: 'Pro začínající podniky',
    icon: Zap,
    features: [
      '1 organizace',
      'Maximálně 1 služba',
      'Maximálně 50 rezervací/měsíc',
      'Veřejná stránka /:orgSlug',
      'E-mail potvrzení rezervace (plain)',
      'Export CSV'
    ],
    limitations: [
      'Zobrazuje branding aplikace'
    ],
    popular: false
  },
  {
    id: 'PRO',
    name: 'PRO',
    price: '229 Kč',
    description: 'Pro rostoucí podniky',
    icon: Crown,
    features: [
      '1 organizace',
      'Až 5 služeb',
      '1000 rezervací/měsíc',
      'Vypnutí brandingu',
      'Vylepšené e-maily (logo, vlastní odesílatel)',
      'Blackouty + týdenní šablony',
      'Prioritní rate-limit (více požadavků/min)',
      'Export CSV'
    ],
    popular: true
  },
  {
    id: 'BUSINESS',
    name: 'BUSINESS',
    price: '649 Kč',
    description: 'Pro profesionální provozy',
    icon: Building2,
    features: [
      'Neomezené služby',
      'Neomezené rezervace/měsíc (férové použití)',
      'Více administrátorů (do 5 uživatelů)',
      'Příprava na integrace (Google Calendar, webhooks)',
      'Přednostní podpora',
      'Všechny PRO funkce'
    ],
    popular: false
  }
];

export default function Pricing() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const { data: billingStatus } = useQuery<BillingStatus>({
    queryKey: ["/api/billing/status"],
    queryFn: () => apiRequest("GET", "/api/billing/status").then(res => res.json())
  });

  const createCheckoutSession = useMutation({
    mutationFn: async (plan: 'PRO' | 'BUSINESS') => {
      const response = await apiRequest("POST", "/api/billing/checkout", { plan });
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    },
    onError: (error: any) => {
      toast({
        title: "Chyba při vytváření platby",
        description: error.message || "Zkuste to prosím znovu.",
        variant: "destructive"
      });
      setIsLoading(null);
    }
  });

  const handleUpgrade = async (planId: 'PRO' | 'BUSINESS') => {
    if (planId === billingStatus?.plan) return;
    
    setIsLoading(planId);
    createCheckoutSession.mutate(planId);
  };

  const getPlanButton = (plan: typeof pricingPlans[0]) => {
    const currentPlan = billingStatus?.plan || 'FREE';
    
    if (plan.id === 'FREE') {
      if (currentPlan === 'FREE') {
        return (
          <Button variant="outline" disabled data-testid={`button-current-${plan.id}`}>
            Aktuální plán
          </Button>
        );
      }
      return (
        <Button variant="outline" disabled data-testid={`button-downgrade-${plan.id}`}>
          Kontaktujte podporu pro downgrade
        </Button>
      );
    }

    if (plan.id === currentPlan) {
      return (
        <Button variant="outline" disabled data-testid={`button-current-${plan.id}`}>
          Aktuální plán
        </Button>
      );
    }

    return (
      <Button
        onClick={() => handleUpgrade(plan.id as 'PRO' | 'BUSINESS')}
        disabled={isLoading === plan.id}
        data-testid={`button-upgrade-${plan.id}`}
      >
        {isLoading === plan.id ? 'Načítám...' : 'Upgradeovat'}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-slate-900 mb-4" data-testid="text-pricing-title">
            Cenové plány
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto" data-testid="text-pricing-description">
            Vyberte si plán, který nejlépe vyhovuje potřebám vašeho podniku
          </p>
          
          {billingStatus && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg" data-testid="status-current-plan">
              <span className="font-medium">Aktuální plán:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${
                billingStatus.plan === 'FREE' 
                  ? 'bg-slate-100 text-slate-700' 
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {billingStatus.plan}
              </span>
              {billingStatus.currentPeriodEnd && (
                <span className="text-sm">
                  (do {new Date(billingStatus.currentPeriodEnd).toLocaleDateString('cs-CZ')})
                </span>
              )}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.id} 
                className={`relative ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-slate-200'}`}
                data-testid={`card-plan-${plan.id}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium" data-testid="badge-popular">
                      Nejpopulárnější
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-blue-100 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl" data-testid={`text-plan-name-${plan.id}`}>
                    {plan.name}
                  </CardTitle>
                  <CardDescription data-testid={`text-plan-description-${plan.id}`}>
                    {plan.description}
                  </CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold text-slate-900" data-testid={`text-plan-price-${plan.id}`}>
                      {plan.price}
                    </span>
                    {plan.id !== 'FREE' && (
                      <span className="text-slate-500 ml-1">/měsíc</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3" data-testid={`feature-${plan.id}-${index}`}>
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations && plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-start gap-3 text-slate-500" data-testid={`limitation-${plan.id}-${index}`}>
                        <span className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0">⚠</span>
                        <span>{limitation}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter>
                  {getPlanButton(plan)}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            Máte otázky? <a href="mailto:podpora@rezervace.cz" className="text-blue-600 hover:underline" data-testid="link-support">Kontaktujte podporu</a>
          </p>
          <p className="text-sm text-slate-500">
            Všechny ceny jsou uvedeny včetně DPH. Platby jsou zpracovávány bezpečně prostřednictvím Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}