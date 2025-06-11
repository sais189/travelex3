import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ImageUrlDemo from "@/components/ImageUrlDemo";

export default function ImageValidationTest() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link href="/admin">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Dashboard
              </Button>
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Image URL Validation System
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Test the comprehensive duplicate prevention system for destination cover images
            </p>
          </div>

          <ImageUrlDemo />
        </motion.div>
      </div>
    </div>
  );
}