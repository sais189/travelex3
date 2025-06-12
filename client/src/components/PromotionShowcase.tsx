import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PricingBadge from "./PricingBadge";
import { formatCurrency } from "@/lib/utils";

interface PromotionShowcaseProps {
  className?: string;
}

export default function PromotionShowcase({ className }: PromotionShowcaseProps) {
  const promotionExamples = [
    {
      id: 1,
      title: "Santorini Romance Package",
      originalPrice: 2499,
      currentPrice: 1899,
      promoTag: "Best Offer",
      discountPercentage: 24,
      seasonalTag: "Valentine Special",
      couponCode: "LOVE24",
      loyaltyDiscount: 5,
      promoExpiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      title: "Bali Adventure Escape",
      originalPrice: 1599,
      currentPrice: 1199,
      promoTag: "Flash Sale",
      discountPercentage: 25,
      flashSale: true,
      flashSaleEnd: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      discountType: "percentage"
    },
    {
      id: 3,
      title: "Tokyo Cultural Journey",
      originalPrice: 3299,
      currentPrice: 2799,
      promoTag: "Early Bird",
      discountPercentage: 15,
      seasonalTag: "Spring Break",
      groupDiscountMin: 4,
      discountType: "percentage"
    },
    {
      id: 4,
      title: "Swiss Alps Winter Retreat",
      originalPrice: 2799,
      currentPrice: 2399,
      promoTag: "Limited Time",
      discountPercentage: 14,
      seasonalTag: "Winter Wonderland",
      bundleDeal: { 
        includes: ["Ski pass", "Hot chocolate tour", "Mountain spa"] 
      },
      promoExpiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      title: "Maldives Luxury Villa",
      originalPrice: 4999,
      currentPrice: 3999,
      promoTag: "VIP Exclusive",
      discountPercentage: 20,
      seasonalTag: "Summer Special",
      loyaltyDiscount: 10,
      couponCode: "LUXURY20"
    },
    {
      id: 6,
      title: "Amazon Rainforest Explorer",
      originalPrice: 1899,
      currentPrice: 1519,
      promoTag: "Hot Deal",
      discountPercentage: 20,
      seasonalTag: "Black Friday",
      discountType: "percentage",
      groupDiscountMin: 6
    },
    {
      id: 7,
      title: "Paris City Break",
      originalPrice: 999,
      currentPrice: 799,
      promoTag: "Super Saver",
      discountPercentage: 200,
      discountType: "fixed",
      seasonalTag: "Holiday Deal",
      couponCode: "PARIS200"
    },
    {
      id: 8,
      title: "Dubai Desert Safari",
      originalPrice: 1299,
      currentPrice: 1299,
      promoTag: "New Arrival",
      discountType: "bogo",
      discountPercentage: 1,
      seasonalTag: "New Year Deal",
      flashSale: false
    },
    {
      id: 9,
      title: "Iceland Northern Lights",
      originalPrice: 2199,
      currentPrice: 1759,
      promoTag: "Most Popular",
      discountPercentage: 20,
      seasonalTag: "Winter Wonderland",
      loyaltyDiscount: 8,
      groupDiscountMin: 3
    },
    {
      id: 10,
      title: "Costa Rica Eco Adventure",
      originalPrice: 1799,
      currentPrice: 1439,
      promoTag: "Trending",
      discountPercentage: 20,
      seasonalTag: "Easter Special",
      bundleDeal: { 
        includes: ["Zip-line tour", "Wildlife photography", "Organic cooking class"] 
      }
    },
    {
      id: 11,
      title: "Morocco Desert Expedition",
      originalPrice: 1599,
      currentPrice: 1279,
      promoTag: "Last Chance",
      discountPercentage: 20,
      seasonalTag: "Cyber Monday",
      flashSale: true,
      flashSaleEnd: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      promoExpiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 12,
      title: "Greek Island Hopping",
      originalPrice: 2299,
      currentPrice: 1839,
      promoTag: "Members Only",
      discountPercentage: 20,
      seasonalTag: "Beach Season",
      loyaltyDiscount: 15,
      couponCode: "MEMBER20",
      groupDiscountMin: 2
    }
  ];

  return (
    <div className={className}>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Special Offers & Promotions</h2>
        <p className="text-muted-foreground">Discover amazing deals with multiple discount types and seasonal offers</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {promotionExamples.map((promo) => (
          <Card key={promo.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{promo.title}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(promo.currentPrice)}
                </span>
                {promo.originalPrice > promo.currentPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(promo.originalPrice)}
                  </span>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <PricingBadge
                promoTag={promo.promoTag}
                discountPercentage={promo.discountPercentage}
                promoExpiry={promo.promoExpiry}
                seasonalTag={promo.seasonalTag}
                flashSale={promo.flashSale}
                flashSaleEnd={promo.flashSaleEnd}
                couponCode={promo.couponCode}
                discountType={promo.discountType}
                groupDiscountMin={promo.groupDiscountMin}
                loyaltyDiscount={promo.loyaltyDiscount}
                bundleDeal={promo.bundleDeal}
                className="mt-4"
              />
              
              {promo.bundleDeal && (
                <div className="mt-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1">Bundle Includes:</p>
                  <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-0.5">
                    {promo.bundleDeal.includes.map((item: string, index: number) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="text-center p-6">
          <h3 className="font-semibold mb-2">Flash Sales</h3>
          <p className="text-sm text-muted-foreground">Limited time offers with urgent countdowns</p>
        </Card>
        <Card className="text-center p-6">
          <h3 className="font-semibold mb-2">Seasonal Specials</h3>
          <p className="text-sm text-muted-foreground">Holiday and seasonal themed promotions</p>
        </Card>
        <Card className="text-center p-6">
          <h3 className="font-semibold mb-2">Group Discounts</h3>
          <p className="text-sm text-muted-foreground">Better deals for larger travel groups</p>
        </Card>
        <Card className="text-center p-6">
          <h3 className="font-semibold mb-2">Loyalty Rewards</h3>
          <p className="text-sm text-muted-foreground">Extra savings for returning customers</p>
        </Card>
      </div>
    </div>
  );
}