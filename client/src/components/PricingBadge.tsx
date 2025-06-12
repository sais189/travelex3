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
            "flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-red-500 to-red-600 text-white border-red-400 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 animate-pulse",
            "drop-shadow-md backdrop-blur-sm border-2"
          )}
        >
          <Zap className="w-3 h-3 animate-bounce" />
          ⚡ FLASH SALE
        </Badge>
      )}

      {/* Main Promo Tag */}
      {promoTag && (
        <Badge 
          variant={getBadgeVariant(promoTag)}
          className={cn(
            "flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300",
            "drop-shadow-md backdrop-blur-sm border-2",
            isExpiringSoon && "animate-pulse from-orange-500 to-orange-600 border-orange-400 shadow-orange-500/30"
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
          className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 drop-shadow-md backdrop-blur-sm border-2"
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
            "flex items-center gap-1 text-xs font-bold shadow-lg transition-all duration-300 drop-shadow-md backdrop-blur-sm border-2",
            discountType === 'bogo' 
              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-400 shadow-orange-500/30 hover:shadow-orange-500/50" 
              : "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 shadow-green-500/30 hover:shadow-green-500/50"
          )}
        >
          {discountType === 'bogo' ? <Gift className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
          {getDiscountTypeText()}
        </Badge>
      )}

      {/* Group Discount */}
      {groupDiscountMin > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 drop-shadow-md backdrop-blur-sm border-2">
          <Users className="w-3 h-3" />
          {groupDiscountMin}+ Group Deal
        </Badge>
      )}

      {/* Loyalty Discount */}
      {loyaltyDiscount > 0 && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transition-all duration-300 drop-shadow-md backdrop-blur-sm border-2">
          <Heart className="w-3 h-3" />
          +{loyaltyDiscount}% Loyalty
        </Badge>
      )}

      {/* Coupon Code */}
      {couponCode && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-mono font-bold bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-yellow-400 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300 drop-shadow-md backdrop-blur-sm border-2 animate-pulse">
          <Tag className="w-3 h-3" />
          {couponCode}
        </Badge>
      )}

      {/* Bundle Deal */}
      {bundleDeal && (
        <Badge variant="outline" className="flex items-center gap-1 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 drop-shadow-md backdrop-blur-sm border-2">
          <ShoppingBag className="w-3 h-3" />
          Bundle Deal
        </Badge>
      )}
    </div>
  );
}