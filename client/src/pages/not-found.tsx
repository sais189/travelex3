import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Home, Map, AlertCircle, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <motion.div
        className="text-center max-w-lg w-full"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="glass-morphism">
          <CardContent className="p-12">
            {/* Animated 404 */}
            <motion.div
              className="mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative">
                <h1 className="text-8xl font-bold text-gold-accent mb-4">404</h1>
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Compass className="w-16 h-16 text-lavender-accent opacity-50" />
                </motion.div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-alert-red mr-3" />
                <h2 className="text-3xl font-bold">Lost in Space</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-4">
                Oops! Looks like this destination doesn't exist in our galaxy.
              </p>
              <p className="text-muted-foreground">
                The page you're looking for might have been moved, deleted, or you might have entered the wrong URL.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => navigate("/")}
                  className="flex-1 bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground font-semibold py-3 glow-hover"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Return Home
                </Button>
                <Button
                  onClick={() => navigate("/destinations")}
                  variant="outline"
                  className="flex-1 border-lavender-accent text-lavender-accent hover:bg-lavender-accent hover:text-primary-foreground py-3"
                >
                  <Map className="w-5 h-5 mr-2" />
                  Explore Trips
                </Button>
              </div>
            </motion.div>

            {/* Helpful Links */}
            <motion.div
              className="mt-8 pt-6 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-sm text-muted-foreground mb-4">Looking for something specific?</p>
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => navigate("/about")}
                  className="text-sm text-mint-accent hover:text-mint-accent/80 underline"
                >
                  About Us
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="text-sm text-mint-accent hover:text-mint-accent/80 underline"
                >
                  Contact Support
                </button>
                <button
                  onClick={() => navigate("/my-trips")}
                  className="text-sm text-mint-accent hover:text-mint-accent/80 underline"
                >
                  My Trips
                </button>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Floating Animation Elements */}
        <motion.div
          className="absolute top-20 right-10 w-24 h-24 bg-gold-accent bg-opacity-10 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-10 w-32 h-32 bg-lavender-accent bg-opacity-10 rounded-full blur-3xl"
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
      </motion.div>
    </div>
  );
}
