import { ReactNode, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackPath?: string;
}

export function ProtectedRoute({ children, fallbackPath = "/app/auth/login" }: ProtectedRouteProps) {
  const { data: user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation(fallbackPath);
    }
  }, [user, isLoading, setLocation, fallbackPath]);

  // Zobrazit loading stav během načítání
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Pokud uživatel není autentifikován, nezobrazujeme nic (redirect proběhne v useEffect)
  if (!user) {
    return null;
  }

  // Pokud je uživatel autentifikován, zobrazíme děti
  return <>{children}</>;
}