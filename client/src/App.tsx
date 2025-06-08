import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect } from "react";
import { preloadCriticalResources } from "@/utils/performanceCache";

// Immediate load components
import Home from "@/pages/Home";
import Navbar from "@/components/Navbar";

// Lazy loaded pages for code splitting
const Destinations = lazy(() => import("@/pages/Destinations"));
const EnhancedBooking = lazy(() => import("@/pages/EnhancedBooking"));
const Payment = lazy(() => import("@/pages/Payment"));
const MyTrips = lazy(() => import("@/pages/MyTrips"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const NotFound = lazy(() => import("@/pages/not-found"));

// Lazy loaded components
const ChatBot = lazy(() => import("@/components/ChatBot"));
const Footer = lazy(() => import("@/components/Footer"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin w-8 h-8 border-4 border-gold-accent border-t-transparent rounded-full"></div>
  </div>
);

function Router() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<LoadingSpinner />}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/destinations" component={Destinations} />
          <Route path="/booking/:id" component={EnhancedBooking} />
          <Route path="/payment/:bookingId" component={Payment} />
          <Route path="/my-trips" component={MyTrips} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/:tab" component={AdminDashboard} />
          <Route path="/auth" component={Login} />
          <Route path="/signup" component={Signup} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <ChatBot />
      </Suspense>
    </>
  );
}

function App() {
  useEffect(() => {
    // Preload critical resources on app initialization
    preloadCriticalResources();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <div className="min-h-screen bg-deep-black text-foreground">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
