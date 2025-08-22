import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { 
  Play, 
  Calendar, 
  CreditCard, 
  Settings, 
  Code, 
  Eye,
  Users,
  BarChart3,
  Edit
} from "lucide-react";

export default function DemoLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleDemoLogin = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest("POST", "/api/auth/demo");
      
      toast({
        title: "Demo přihlášení úspěšné",
        description: "Můžete začít prohlížet administraci",
      });
      
      setLocation("/app");
    } catch (error: any) {
      toast({
        title: "Chyba při demo přihlášení",
        description: error.message || "Něco se pokazilo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Calendar,
      title: "Správa rezervací",
      description: "Prohlédněte si přehled všech rezervací s možností filtrace podle datumu a služby"
    },
    {
      icon: Settings,
      title: "Správa služeb",
      description: "Konfigurace služeb s cenami, délkou trvání a možnostmi plateb"
    },
    {
      icon: Users,
      title: "Dostupnost & Blokace",
      description: "Nastavení pracovních hodin a blokování termínů pro dovolené či školení"
    },
    {
      icon: Edit,
      title: "Editor formuláře (PRO)",
      description: "Drag & drop editor s přednastavenými šablonami - vertikální, horizontální, průvodce, minimální"
    },
    {
      icon: Code,
      title: "Embed Widget",
      description: "Generátor kódu pro vložení rezervačního formuláře na vaše webové stránky"
    },
    {
      icon: CreditCard,
      title: "Platební systém",
      description: "Integrace se Stripe pro online platby s různými módy (povinné/volitelné)"
    },
    {
      icon: BarChart3,
      title: "Přehledy a statistiky",
      description: "Sledování výkonnosti a příjmů z rezervací"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Calendar className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Bookli.cz</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Moderní rezervační systém pro malé firmy
          </p>
          <Badge variant="secondary" className="text-sm">
            <Eye className="h-4 w-4 mr-1" />
            DEMO VERZE
          </Badge>
        </div>

        {/* Demo Login Card */}
        <Card className="mx-auto max-w-md">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              Vyzkoušet DEMO
            </CardTitle>
            <p className="text-sm text-gray-600">
              Prozkoumejte všechny funkce systému s testovacími daty
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Demo organizace:</h3>
              <p className="text-sm text-blue-800">
                <strong>Salon Krása</strong><br />
                Kompletní kadeřnictví s více službami
              </p>
            </div>
            
            <Button 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? "Načítám..." : "Spustit Demo"}
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Demo obsahuje pouze testovací data a nelze je upravovat
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Chcete spustit vlastní rezervační systém?
          </p>
          <Button variant="outline" size="sm">
            Kontaktovat nás
          </Button>
        </div>
      </div>
    </div>
  );
}