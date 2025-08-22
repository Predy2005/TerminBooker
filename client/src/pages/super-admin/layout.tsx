import { ReactNode } from "react";
import SuperAdminSidebar from "@/components/layout/super-admin-sidebar";

interface SuperAdminLayoutProps {
  children: ReactNode;
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SuperAdminSidebar />
      
      <div className="ml-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}