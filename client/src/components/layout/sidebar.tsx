import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useOrganization, useLogout } from "@/lib/auth";
import { 
  BarChart3, 
  Calendar, 
  Bell, 
  Clock, 
  Ban, 
  Settings, 
  CreditCard,
  LogOut 
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { data: organization } = useOrganization();
  const logout = useLogout();

  const navigation = [
    { name: "Přehled", href: "/app", icon: BarChart3 },
    { name: "Rezervace", href: "/app/bookings", icon: Calendar },
    { name: "Služby", href: "/app/services", icon: Bell },
    { name: "Dostupnost", href: "/app/availability", icon: Clock },
    { name: "Blokace", href: "/app/blackouts", icon: Ban },
    { name: "Fakturace", href: "/app/billing", icon: CreditCard },
    { name: "Nastavení platební brány", href: "/app/billing-symfony", icon: CreditCard },
    { name: "Cenové plány", href: "/app/pricing", icon: CreditCard },
    { name: "Nastavení", href: "/app/settings", icon: Settings }
  ];

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-sm border-r border-slate-200">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Rezervační systém</h1>
          <p className="text-sm text-slate-600 mt-1">{organization?.name}</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-slate-700 hover:text-primary hover:bg-slate-50"
                  }`}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>
        
        {/* User Menu */}
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                {organization?.name?.[0]?.toUpperCase() || "U"}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-slate-900">Admin</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="ml-3 text-slate-400 hover:text-slate-600"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
