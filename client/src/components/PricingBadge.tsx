import { Badge } from "@/components/ui/badge";
import { Tag, Percent, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingBadgeProps {
  promoTag?: string | null;
  discountPercentage?: number;
  promoExpiry?: string | null;
  className?: string;
}

export default function PricingBadge({ 
  promoTag, 
  discountPercentage = 0, 
  promoExpiry, 
  className 
}: PricingBadgeProps) {
  if (!promoTag && !discountPercentage) return null;

  const getBadgeVariant = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'best offer':
        return 'default';
      case 'on sale':
        return 'secondary';
      case 'limited time':
        return 'destructive';
      case 'hot deal':
        return 'default';
      case 'early bird':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getBadgeIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case 'best offer':
        return <Star className="w-3 h-3" />;
      case 'on sale':
        return <Tag className="w-3 h-3" />;
      case 'limited time':
        return <Clock className="w-3 h-3" />;
      case 'hot deal':
        return <Tag className="w-3 h-3" />;
      case 'early bird':
        return <Clock className="w-3 h-3" />;
      default:
        return <Tag className="w-3 h-3" />;
    }
  };

  const isExpiringSoon = promoExpiry && new Date(promoExpiry) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {promoTag && (
        <Badge 
          variant={getBadgeVariant(promoTag)}
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isExpiringSoon && "animate-pulse"
          )}
        >
          {getBadgeIcon(promoTag)}
          {promoTag}
        </Badge>
      )}
      
      {discountPercentage > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <Percent className="w-3 h-3" />
          {discountPercentage}% OFF
        </Badge>
      )}
    </div>
  );
}