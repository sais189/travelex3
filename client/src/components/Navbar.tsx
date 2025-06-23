import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { User } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Home, 
  Map, 
  Calendar, 
  Users, 
  Phone, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  Settings,
  Tag,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import DestinationDropdown from "@/components/DestinationDropdown";
import { useTheme } from "@/components/ThemeProvider";

export default function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isValidRoute = (path: string) => {
    const validRoutes = ["/", "/destinations", "/booking", "/my-trips", "/admin", "/auth", "/about", "/contact"];
    return validRoutes.some(route => path.startsWith(route));
  };

  // Don't show navbar on 404 page
  if (location === "/404" || (location !== "/" && location.startsWith("/") && !isValidRoute(location))) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/destinations", label: "Destinations", icon: Map },
    ...(isAuthenticated ? [{ path: "/my-trips", label: "My Trips", icon: Calendar }] : []),
    { path: "/about", label: "About", icon: Users },
    { path: "/contact", label: "Contact", icon: Phone },
  ];

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-6">
      <div className="glass-morphism rounded-3xl h-16 lg:h-20 flex items-center justify-between px-8 lg:px-12 transition-all duration-300 shadow-lg">
        {/* Logo */}
        <Link href="/">
          <motion.div 
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Globe className="text-gold-accent text-2xl" />
            <span className="text-xl font-bold text-gold-accent">Travelex</span>
          </motion.div>
        </Link>



        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-12">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-300 cursor-pointer",
                    isActive(item.path) 
                      ? "text-white bg-white bg-opacity-20 shadow-lg" 
                      : "text-foreground hover:text-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Theme Toggle & Auth & Admin Buttons */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          {!isLoading && (
            <>
              {!isAuthenticated ? (
                <Link href="/auth">
                  <Button className="hidden lg:flex bg-lavender-accent hover:bg-lavender-accent/80 text-primary-foreground glow-hover">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              ) : (
                <div className="hidden lg:flex items-center space-x-3">
                  {user?.role === 'admin' && (
                    <Link href="/admin">
                      <Button className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground glow-hover">
                        <Settings className="w-4 h-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    className="border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-primary-foreground"
                    onClick={async () => {
                      try {
                        await apiRequest("POST", "/api/auth/logout");
                        window.location.href = "/";
                      } catch (error) {
                        console.error("Logout error:", error);
                        // Fallback: redirect anyway
                        window.location.href = "/";
                      }
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-foreground"
            onClick={handleMobileMenuToggle}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden mt-4 glass-morphism rounded-2xl p-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} href={item.path}>
                    <motion.div
                      className={cn(
                        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-300 cursor-pointer",
                        isActive(item.path) 
                          ? "text-white bg-white bg-opacity-20 shadow-lg" 
                          : "text-foreground hover:text-white"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </motion.div>
                  </Link>
                );
              })}

              <div className="border-t border-border pt-3 mt-3">
                {/* Mobile Theme Toggle */}
                <motion.div
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-foreground hover:bg-accent hover:bg-opacity-10 transition-colors duration-300 cursor-pointer"
                  onClick={toggleTheme}
                  whileTap={{ scale: 0.95 }}
                >
                  {theme === "dark" ? (
                    <>
                      <Sun className="w-5 h-5" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-5 h-5" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </motion.div>
                
                {!isLoading && (
                  <>
                    {!isAuthenticated ? (
                      <Link href="/auth">
                        <motion.div
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-lavender-accent hover:bg-lavender-accent hover:bg-opacity-10 transition-colors duration-300 cursor-pointer"
                          onClick={() => setIsMobileMenuOpen(false)}
                          whileTap={{ scale: 0.95 }}
                        >
                          <LogIn className="w-5 h-5" />
                          <span>Login</span>
                        </motion.div>
                      </Link>
                    ) : (
                      <>
                        {user?.role === 'admin' && (
                          <Link href="/admin">
                            <motion.div
                              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gold-accent hover:bg-gold-accent hover:bg-opacity-10 transition-colors duration-300 cursor-pointer"
                              onClick={() => setIsMobileMenuOpen(false)}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Settings className="w-5 h-5" />
                              <span>Admin</span>
                            </motion.div>
                          </Link>
                        )}
                        <motion.div
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-alert-red hover:bg-red-500 hover:bg-opacity-10 transition-colors duration-300 cursor-pointer"
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            try {
                              await apiRequest("POST", "/api/auth/logout");
                              window.location.href = "/";
                            } catch (error) {
                              console.error("Logout error:", error);
                              window.location.href = "/";
                            }
                          }}
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Logout</span>
                        </motion.div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
