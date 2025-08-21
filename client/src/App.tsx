import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "@/pages/landing";
import DocsPage from "@/pages/docs";
import SupportPage from "@/pages/support";
import NotFound from "@/pages/not-found";
import PublicBooking from "@/pages/public-booking";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Services from "@/pages/services";
import Availability from "@/pages/availability";
import Blackouts from "@/pages/blackouts";
import Bookings from "@/pages/bookings";
import Settings from "@/pages/settings";
import Pricing from "@/pages/pricing";
import BillingSuccess from "@/pages/billing-success";
import BookingSuccess from "@/pages/booking-success";
import BookingCancel from "@/pages/booking-cancel";

function Router() {
  return (
    <Switch>
      {/* Landing page */}
      <Route path="/" component={LandingPage} />
      
      {/* Static pages */}
      <Route path="/docs" component={DocsPage} />
      <Route path="/support" component={SupportPage} />
      
      {/* Public booking routes */}
      <Route path="/:orgSlug" component={PublicBooking} />
      
      {/* Auth routes */}
      <Route path="/app/auth/login" component={Login} />
      <Route path="/app/auth/register" component={Register} />
      
      {/* Dashboard routes */}
      <Route path="/app" component={Dashboard} />
      <Route path="/app/dashboard" component={Dashboard} />
      <Route path="/app/services" component={Services} />
      <Route path="/app/availability" component={Availability} />
      <Route path="/app/blackouts" component={Blackouts} />
      <Route path="/app/bookings" component={Bookings} />
      <Route path="/app/settings" component={Settings} />
      <Route path="/app/pricing" component={Pricing} />
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
