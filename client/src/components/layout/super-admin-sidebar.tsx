import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Shield, 
  Settings,
  LogOut,
  UserX
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/super-admin",
    icon: LayoutDashboard,
    exact: true
  },
  {
    name: "Správa podniků",
    href: "/super-admin/organizations",
    icon: Building2
  },
  {
    name: "Správa uživatelů",
    href: "/super-admin/users",
    icon: Users
  },
  {
    name: "Billing & faktury",
    href: "/super-admin/billing",
    icon: CreditCard
  },
  {
    name: "Audit & bezpečnost",
    href: "/super-admin/audit",
    icon: Shield
  }
];

export default function SuperAdminSidebar() {
  const [location] = useLocation();

  // Check if user is impersonating
  const isImpersonating = false; // This would come from auth context

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center px-6 border-b border-slate-700">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-lg font-bold">Super Admin</h1>
              <p className="text-xs text-slate-300">Bookli.cz</p>
            </div>
          </div>
        </div>

        {/* Impersonation Warning */}
        {isImpersonating && (
          <div className="mx-4 mt-4 p-3 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <UserX className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-200">
                Impersonace aktivní
              </span>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs">
              Ukončit impersonaci
            </Button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => {
            const isActive = item.exact 
              ? location === item.href
              : location.startsWith(item.href);

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-left font-normal h-auto p-3",
                    isActive
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.name}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            data-testid="nav-settings"
          >
            <Settings className="mr-3 h-5 w-5" />
            Nastavení
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white"
            data-testid="nav-logout"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Odhlásit se
          </Button>

          <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
            <div>Přihlášen jako:</div>
            <div className="font-medium">admin@bookli.cz</div>
          </div>
        </div>
      </div>
    </div>
  );
}