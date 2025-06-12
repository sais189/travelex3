import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import PricingBadge from "@/components/PricingBadge";
import PromotionShowcase from "@/components/PromotionShowcase";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, Clock, Star, Gift, Users, TrendingUp } from "lucide-react";
import type { Destination } from "@shared/schema";

export default function Promotions() {
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  });

  const activePromotions = destinations?.filter(dest => 
    dest.promoTag || (dest.discountPercentage && dest.discountPercentage > 0) || dest.seasonalTag || dest.flashSale
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-6 w-1/2 mb-3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Special Offers & Promotions
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Discover incredible deals on premium travel experiences with flash sales, seasonal specials, 
            group discounts, and exclusive member benefits.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Clock className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm font-medium">Flash Sales</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Star className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium">Premium Deals</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium">Group Discounts</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-medium">Bundle Deals</p>
            </div>
          </div>
        </motion.div>

        {/* Active Promotions */}
        {activePromotions.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8 text-center">Active Promotions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activePromotions.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      <img
                        src={destination.imageUrl || "/placeholder.jpg"}
                        alt={destination.name}
                        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <PricingBadge
                          promoTag={destination.promoTag}
                          discountPercentage={destination.discountPercentage ?? 0}
                          promoExpiry={destination.promoExpiry ? destination.promoExpiry.toString() : undefined}
                          seasonalTag={destination.seasonalTag ?? undefined}
                          flashSale={destination.flashSale ?? false}
                          flashSaleEnd={destination.flashSaleEnd ? destination.flashSaleEnd.toString() : undefined}
                          couponCode={destination.couponCode ?? undefined}
                          discountType={destination.discountType || undefined}
                          groupDiscountMin={destination.groupDiscountMin ?? 0}
                          loyaltyDiscount={destination.loyaltyDiscount ?? 0}
                          bundleDeal={destination.bundleDeal}
                        />
                      </div>
                      {destination.flashSale && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="destructive" className="animate-pulse">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            URGENT
                          </Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-xl">{destination.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{destination.country}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-primary">
                          {formatCurrency(Number(destination.price))}
                        </span>
                        {destination.originalPrice && Number(destination.originalPrice) > Number(destination.price) && (
                          <span className="text-lg text-muted-foreground line-through">
                            {formatCurrency(Number(destination.originalPrice))}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {destination.description}
                      </p>
                      

                      
                      <Button className="w-full group" size="lg">
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Promotion Showcase */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <PromotionShowcase className="mb-16" />
        </motion.section>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl"
        >
          <h3 className="text-2xl font-bold mb-4">Don't Miss Out!</h3>
          <p className="mb-6 opacity-90">
            Subscribe to our newsletter to get notified about flash sales and exclusive deals.
          </p>
          <Button variant="secondary" size="lg">
            Subscribe for Deals
          </Button>
        </motion.div>
      </div>
    </div>
  );
}