import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "@/pages/landing";
import DocsPage from "@/pages/docs";
import SupportPage from "@/pages/support";
import NotFound from "@/pages/not-found";
import PublicBooking from "@/pages/public-booking";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";
import Services from "@/pages/services";
import Availability from "@/pages/availability";
import Blackouts from "@/pages/blackouts";
import Bookings from "@/pages/bookings";
import Settings from "@/pages/settings";
import EmbedBooking from "@/pages/embed";
import EmbedGenerator from "@/pages/embed-generator";
import FormEditor from "@/pages/form-editor";
import Pricing from "@/pages/pricing";
import BillingSuccess from "@/pages/billing-success";
import BillingPage from "@/pages/billing";
import BillingSymfonyPage from "@/pages/billing-symfony";
import BillingConnectSuccessPage from "@/pages/billing-connect-success";
import BillingConnectRefreshPage from "@/pages/billing-connect-refresh";
import BookingSuccess from "@/pages/booking-success";
import BookingCancel from "@/pages/booking-cancel";
import DemoLogin from "@/pages/demo-login";

// Super Admin imports
import SuperAdminLayout from "@/pages/super-admin/layout";
import SuperAdminDashboard from "@/pages/super-admin/dashboard";
import SuperAdminOrganizations from "@/pages/super-admin/organizations";
import SuperAdminUsers from "@/pages/super-admin/users";
import SuperAdminBilling from "@/pages/super-admin/billing";
import SuperAdminAudit from "@/pages/super-admin/audit";
import SuperAdminTest from "@/pages/super-admin-test";

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={LandingPage} />
      
      {/* Demo login */}
      <Route path="/demo" component={DemoLogin} />
      
      {/* Super Admin Test - PROTECTED */}
      <Route path="/super-admin-test" component={() => <ProtectedRoute><SuperAdminTest /></ProtectedRoute>} />
      
      {/* Super Admin routes - PROTECTED - MUST BE BEFORE /:orgSlug */}
      <Route path="/super-admin" component={() => (
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminDashboard />
          </SuperAdminLayout>
        </ProtectedRoute>
      )} />
      <Route path="/super-admin/organizations" component={() => (
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminOrganizations />
          </SuperAdminLayout>
        </ProtectedRoute>
      )} />
      <Route path="/super-admin/users" component={() => (
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminUsers />
          </SuperAdminLayout>
        </ProtectedRoute>
      )} />
      <Route path="/super-admin/billing" component={() => (
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminBilling />
          </SuperAdminLayout>
        </ProtectedRoute>
      )} />
      <Route path="/super-admin/audit" component={() => (
        <ProtectedRoute>
          <SuperAdminLayout>
            <SuperAdminAudit />
          </SuperAdminLayout>
        </ProtectedRoute>
      )} />
      
      {/* Static pages */}
      <Route path="/docs" component={DocsPage} />
      <Route path="/support" component={SupportPage} />
      
      {/* Embed booking widget */}
      <Route path="/embed" component={EmbedBooking} />
      
      {/* Public booking routes - MUST BE AFTER super-admin routes */}
      <Route path="/:orgSlug" component={PublicBooking} />
      
      {/* Auth routes */}
      <Route path="/app/auth/login" component={Login} />
      <Route path="/app/auth/register" component={Register} />
      <Route path="/app/auth/forgot-password" component={ForgotPassword} />
      <Route path="/app/auth/reset-password" component={ResetPassword} />
      
      {/* Dashboard routes - PROTECTED */}
      <Route path="/app" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app/dashboard" component={() => <ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app/services" component={() => <ProtectedRoute><Services /></ProtectedRoute>} />
      <Route path="/app/availability" component={() => <ProtectedRoute><Availability /></ProtectedRoute>} />
      <Route path="/app/blackouts" component={() => <ProtectedRoute><Blackouts /></ProtectedRoute>} />
      <Route path="/app/bookings" component={() => <ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/app/settings" component={() => <ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/app/form-editor" component={() => <ProtectedRoute><FormEditor /></ProtectedRoute>} />
      <Route path="/app/embed" component={() => <ProtectedRoute><EmbedGenerator /></ProtectedRoute>} />
      <Route path="/app/billing" component={() => <ProtectedRoute><BillingPage /></ProtectedRoute>} />
      <Route path="/app/billing-symfony" component={() => <ProtectedRoute><BillingSymfonyPage /></ProtectedRoute>} />
      <Route path="/app/billing/connect/success" component={() => <ProtectedRoute><BillingConnectSuccessPage /></ProtectedRoute>} />
      <Route path="/app/billing/connect/refresh" component={() => <ProtectedRoute><BillingConnectRefreshPage /></ProtectedRoute>} />
      <Route path="/app/pricing" component={() => <ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/billing/success" component={BillingSuccess} />
      
      {/* Booking payment routes */}
      <Route path="/booking/success" component={BookingSuccess} />
      <Route path="/booking/cancel" component={BookingCancel} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
