import { Badge } from "@/components/ui/badge";
import { 
  Tag, Percent, Clock, Star, Zap, Gift, Users, Heart, Calendar, 
  Sparkles, Timer, TrendingUp, Flame, Crown, Trophy, Snowflake,
  Sun, Leaf, ShoppingBag, Coffee, Plane, Target, DollarSign,
  PartyPopper, Megaphone
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingBadgeProps {
  promoTag?: string | null;
  discountPercentage?: number;
  promoExpiry?: string | null;
  seasonalTag?: string | null;
  flashSale?: boolean;
  flashSaleEnd?: string | null;
  couponCode?: string | null;
  discountType?: string;
  groupDiscountMin?: number;
  loyaltyDiscount?: number;
  bundleDeal?: any;
  className?: string;
}

export default function PricingBadge({ 
  promoTag, 
  discountPercentage = 0, 
  promoExpiry,
  seasonalTag,
  flashSale = false,
  flashSaleEnd,
  couponCode,
  discountType = "percentage",
  groupDiscountMin = 0,
  loyaltyDiscount = 0,
  bundleDeal,
  className 
}: PricingBadgeProps) {
  const hasAnyPromotion = promoTag || discountPercentage > 0 || seasonalTag || flashSale || 
                         couponCode || groupDiscountMin > 0 || loyaltyDiscount > 0 || bundleDeal;
  
  if (!hasAnyPromotion) return null;

  const getBadgeVariant = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'best offer':
      case 'premium deal':
      case 'vip exclusive':
        return 'default';
      case 'flash sale':
      case 'mega sale':
      case 'blow out sale':
        return 'destructive';
      case 'on sale':
      case 'super saver':
      case 'budget friendly':
        return 'secondary';
      case 'limited time':
      case 'last chance':
      case 'selling fast':
        return 'destructive';
      case 'hot deal':
      case 'trending':
      case 'most popular':
        return 'default';
      case 'early bird':
      case 'advance booking':
      case 'pre-launch':
        return 'secondary';
      case 'new arrival':
      case 'just added':
      case 'fresh pick':
        return 'outline';
      case 'exclusive':
      case 'members only':
      case 'invite only':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getBadgeIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'best offer':
      case 'premium deal':
        return <Crown className="w-3 h-3" />;
      case 'flash sale':
      case 'mega sale':
        return <Zap className="w-3 h-3" />;
      case 'on sale':
      case 'super saver':
        return <Tag className="w-3 h-3" />;
      case 'limited time':
      case 'last chance':
        return <Timer className="w-3 h-3" />;
      case 'hot deal':
      case 'trending':
        return <Flame className="w-3 h-3" />;
      case 'early bird':
      case 'advance booking':
        return <Clock className="w-3 h-3" />;
      case 'new arrival':
      case 'just added':
        return <Sparkles className="w-3 h-3" />;
      case 'exclusive':
      case 'vip exclusive':
        return <Star className="w-3 h-3" />;
      case 'most popular':
      case 'bestseller':
        return <Trophy className="w-3 h-3" />;
      case 'selling fast':
      case 'almost sold out':
        return <TrendingUp className="w-3 h-3" />;
      case 'gift special':
      case 'bonus included':
        return <Gift className="w-3 h-3" />;
      case 'budget friendly':
      case 'value pack':
        return <DollarSign className="w-3 h-3" />;
      case 'blow out sale':
      case 'clearance':
        return <Megaphone className="w-3 h-3" />;
      case 'members only':
      case 'loyalty reward':
        return <Heart className="w-3 h-3" />;
      case 'group discount':
      case 'family deal':
        return <Users className="w-3 h-3" />;
      case 'weekend special':
      case 'holiday offer':
        return <PartyPopper className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  const getSeasonalIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'summer special':
      case 'beach season':
        return <Sun className="w-3 h-3" />;
      case 'winter wonderland':
      case 'snow adventure':
        return <Snowflake className="w-3 h-3" />;
      case 'spring break':
      case 'easter special':
        return <Leaf className="w-3 h-3" />;
      case 'holiday deal':
      case 'christmas offer':
        return <Gift className="w-3 h-3" />;
      case 'black friday':
      case 'cyber monday':
        return <ShoppingBag className="w-3 h-3" />;
      case 'valentine special':
      case 'romance package':
        return <Heart className="w-3 h-3" />;
      case 'new year deal':
      case 'fresh start':
        return <PartyPopper className="w-3 h-3" />;
      default:
        return <Calendar className="w-3 h-3" />;
    }
  };

  const getDiscountTypeText = () => {
    switch (discountType) {
      case 'fixed':
        return `$${discountPercentage} OFF`;
      case 'bogo':
        return 'Buy 1 Get 1 FREE';
      case 'group':
        return `Group Discount ${discountPercentage}%`;
      default:
        return `${discountPercentage}% OFF`;
    }
  };

  const isExpiringSoon = promoExpiry && new Date(promoExpiry) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isFlashSaleExpiringSoon = flashSaleEnd && new Date(flashSaleEnd) <= new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

  return (
    <div className={cn("flex gap-1.5 flex-wrap items-center", className)}>
      {/* Flash Sale Badge - Highest Priority */}
      {flashSale && (
        <Badge 
          variant="destructive" 
          className={cn(
            "flex items-center gap-1 text-xs font-bold bg-red-600 text-white border-red-700",
            isFlashSaleExpiringSoon && "animate-pulse"
          )}
        >
          <Zap className="w-3 h-3" />
          ⚡ FLASH SALE
        </Badge>
      )}

      {/* Main Promo Tag */}
      {promoTag && (
        <Badge 
          variant={getBadgeVariant(promoTag)}
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isExpiringSoon && "animate-pulse"
          )}
        >
          {getBadgeIcon(promoTag)}
          {promoTag.toUpperCase()}
        </Badge>
      )}

      {/* Seasonal Tag */}
      {seasonalTag && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 text-xs font-medium bg-gradient-to-r from-blue-50 to-purple-50 text-purple-700 border-purple-200 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300"
        >
          {getSeasonalIcon(seasonalTag)}
          {seasonalTag}
        </Badge>
      )}
      
      {/* Discount Percentage */}
      {discountPercentage > 0 && (
        <Badge 
          variant="secondary" 
          className={cn(
            "flex items-center gap-1 text-xs font-bold",
            discountType === 'bogo' 
              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" 
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          )}
        >
          {discountType === 'bogo' ? <Gift className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
          {getDiscountTypeText()}
        </Badge>
      )}

      {/* Group Discount */}
      {groupDiscountMin > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
          <Users className="w-3 h-3" />
          {groupDiscountMin}+ Group Deal
        </Badge>
      )}

      {/* Loyalty Discount */}
      {loyaltyDiscount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-medium bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300">
          <Heart className="w-3 h-3" />
          +{loyaltyDiscount}% Loyalty
        </Badge>
      )}

      {/* Coupon Code */}
      {couponCode && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-mono bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300">
          <Tag className="w-3 h-3" />
          {couponCode}
        </Badge>
      )}

      {/* Bundle Deal */}
      {bundleDeal && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300">
          <ShoppingBag className="w-3 h-3" />
          Bundle Deal
        </Badge>
      )}
    </div>
  );
}