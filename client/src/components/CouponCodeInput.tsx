import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Tag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CouponCodeInputProps {
  availableCouponCode?: string | null;
  onCouponApplied: (couponCode: string, discount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: {
    code: string;
    discount: number;
  } | null;
  className?: string;
}

export default function CouponCodeInput({
  availableCouponCode,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  className
}: CouponCodeInputProps) {
  const [couponInput, setCouponInput] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateCouponCode = async (code: string) => {
    setIsValidating(true);
    setValidationError("");

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if the code matches the available coupon
    if (availableCouponCode && code.toUpperCase() === availableCouponCode.toUpperCase()) {
      // For demo purposes, apply a 15% discount
      const discount = 15;
      onCouponApplied(code.toUpperCase(), discount);
      setCouponInput("");
    } else {
      setValidationError("Invalid coupon code");
    }

    setIsValidating(false);
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    validateCouponCode(couponInput.trim());
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    setValidationError("");
  };

  const handleQuickApply = () => {
    if (availableCouponCode) {
      validateCouponCode(availableCouponCode);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Quick Apply Available Coupon */}
      {availableCouponCode && !appliedCoupon && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <Tag className="w-4 h-4 text-yellow-600" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Available coupon: <span className="font-mono font-bold">{availableCouponCode}</span>
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleQuickApply}
            disabled={isValidating}
            className="ml-auto bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300"
          >
            {isValidating ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
          </Button>
        </div>
      )}

      {/* Applied Coupon Display */}
      {appliedCoupon && (
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Coupon applied: <span className="font-mono font-bold">{appliedCoupon.code}</span>
          </span>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {appliedCoupon.discount}% OFF
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveCoupon}
            className="ml-auto text-green-600 hover:text-green-800 hover:bg-green-100"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Manual Coupon Input */}
      {!appliedCoupon && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
              className="flex-1 font-mono"
              disabled={isValidating}
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={!couponInput.trim() || isValidating}
              variant="outline"
            >
              {isValidating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Tag className="w-4 h-4 mr-1" />
                  Apply
                </>
              )}
            </Button>
          </div>
          {validationError && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <X className="w-3 h-3" />
              {validationError}
            </div>
          )}
        </div>
      )}
    </div>
  );
}