import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";

// Pages
import Home from "@/pages/Home";
import Destinations from "@/pages/Destinations";
import Booking from "@/pages/Booking";
import MyTrips from "@/pages/MyTrips";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/not-found";

// Components
import Navbar from "@/components/Navbar";
import ChatBot from "@/components/ChatBot";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/destinations" component={Destinations} />
        <Route path="/booking/:id" component={Booking} />
        <Route path="/my-trips" component={MyTrips} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin/:tab" component={Admin} />
        <Route path="/auth" component={Auth} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route component={NotFound} />
      </Switch>
      <ChatBot />
    </>
  );
}

function App() {
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
