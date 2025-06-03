import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { LogIn, Globe, Sparkles, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function Auth() {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-gold-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen pt-32 pb-16 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-morphism">
            <CardContent className="p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  className="flex items-center justify-center mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="w-16 h-16 bg-gold-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Globe className="w-8 h-8 text-gold-accent" />
                  </div>
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Welcome to Globetrotter</h1>
                <p className="text-muted-foreground">
                  Sign in to access your travel dashboard and book amazing destinations
                </p>
              </div>

              {/* Features */}
              <motion.div
                className="space-y-4 mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-lavender-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-lavender-accent" />
                  </div>
                  <span className="text-sm">Access exclusive travel packages</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-mint-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-mint-accent" />
                  </div>
                  <span className="text-sm">Secure booking and payment processing</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gold-accent bg-opacity-20 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-gold-accent" />
                  </div>
                  <span className="text-sm">Personalized trip management</span>
                </div>
              </motion.div>

              {/* Login Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <a href="/api/login" className="block">
                  <Button className="w-full bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground font-bold py-4 glow-hover">
                    <LogIn className="w-5 h-5 mr-2" />
                    Continue with Replit
                  </Button>
                </a>
              </motion.div>

              {/* Footer */}
              <motion.div
                className="text-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Background Elements */}
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 bg-gold-accent bg-opacity-10 rounded-full blur-3xl"
          animate={{
            y: [-20, 20, -20],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-24 h-24 bg-lavender-accent bg-opacity-10 rounded-full blur-3xl"
          animate={{
            y: [20, -20, 20],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>
    </div>
  );
}
