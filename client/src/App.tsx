import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/org/:slug" component={PublicBooking} />
      
      {/* Auth routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Dashboard routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/services" component={Services} />
      <Route path="/availability" component={Availability} />
      <Route path="/blackouts" component={Blackouts} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/settings" component={Settings} />
      
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
