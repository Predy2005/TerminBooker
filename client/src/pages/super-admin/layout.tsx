import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Shield, 
  BarChart3, 
  Building2, 
  Users, 
  CreditCard, 
  FileText,
  Home
} from "lucide-react";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [location] = useLocation();

  const navigation = [
    {
      name: "Dashboard",
      href: "/super-admin",
      icon: BarChart3,
      current: location === "/super-admin"
    },
    {
      name: "Organizace",
      href: "/super-admin/organizations", 
      icon: Building2,
      current: location === "/super-admin/organizations"
    },
    {
      name: "Uživatelé",
      href: "/super-admin/users",
      icon: Users,
      current: location === "/super-admin/users"
    },
    {
      name: "Billing",
      href: "/super-admin/billing",
      icon: CreditCard,
      current: location === "/super-admin/billing"
    },
    {
      name: "Audit log",
      href: "/super-admin/audit",
      icon: FileText,
      current: location === "/super-admin/audit"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-xl font-bold text-foreground">
                Super Admin Panel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Hlavní stránka
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.name} href={item.href}>
                        <Button
                          variant={item.current ? "default" : "ghost"}
                          className="w-full justify-start"
                          data-testid={`nav-${item.name.toLowerCase()}`}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}