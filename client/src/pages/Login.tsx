import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { LogIn, Globe, Sparkles, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Login() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/auth/login", {
        username,
        password
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Welcome back!",
          description: data.user.role === 'admin' ? "Admin access granted" : "Login successful",
        });

        // Invalidate auth queries to refresh user state
        queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });

        // Navigate based on role
        if (data.user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-space-blue via-deep-purple to-cosmic-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gold-accent/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-lavender-accent/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-cyan-accent/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="glass-morphism border-gold-accent/20 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <motion.div
                className="flex items-center justify-center mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-gold-accent to-lavender-accent rounded-full flex items-center justify-center shadow-lg">
                    <Globe className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1">
                    <Sparkles className="w-6 h-6 text-gold-accent animate-pulse" />
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gold-accent to-lavender-accent bg-clip-text text-transparent mb-2">
                  Welcome Back
                </CardTitle>
                <p className="text-muted-foreground text-lg">
                  Sign in to access your travel dashboard
                </p>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-6">
              <motion.form
                onSubmit={handleLogin}
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="glass-input h-12 text-lg"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="glass-input h-12 text-lg pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-gradient-to-r from-gold-accent to-lavender-accent hover:from-gold-accent/80 hover:to-lavender-accent/80 text-white font-semibold glow-hover"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="w-5 h-5" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </motion.form>

              <motion.div
                className="mt-6 p-4 bg-gradient-to-r from-gold-accent/10 to-lavender-accent/10 rounded-lg border border-gold-accent/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="font-semibold text-gold-accent mb-2">Demo Credentials:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><span className="font-medium">Admin Access:</span></p>
                  <p>Username: <span className="font-mono bg-muted px-2 py-1 rounded">admin</span></p>
                  <p>Password: <span className="font-mono bg-muted px-2 py-1 rounded">admin</span></p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}