import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Calendar, User, ThumbsUp, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface Review {
  id: number;
  destinationId: number;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  tripDate: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ReviewsProps {
  destinationId: number;
  destinationName: string;
}

export default function Reviews({ destinationId, destinationName }: ReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/destinations/${destinationId}/reviews`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/destinations/${destinationId}/reviews`);
      return response.json();
    },
  });

  const { data: stats } = useQuery<ReviewStats>({
    queryKey: [`/api/destinations/${destinationId}/review-stats`],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/destinations/${destinationId}/review-stats`);
      return response.json();
    },
  });

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating
            ? "fill-yellow-400 text-yellow-400"
            : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 4) return "text-blue-600";
    if (rating >= 3) return "text-orange-600";
    return "text-red-600";
  };

  const getDisplayName = (user: Review['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || "Anonymous Traveler";
  };

  if (reviewsLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <MessageCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
          <p className="text-gray-500">Be the first to share your experience at {destinationName}!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Header with Stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Guest Reviews
          </h2>
          {stats && (
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(stats.averageRating))}
                <span className={`text-lg font-semibold ml-2 ${getRatingColor(stats.averageRating)}`}>
                  {stats.averageRating}
                </span>
              </div>
              <Separator orientation="vertical" className="h-5" />
              <span className="text-gray-600 dark:text-gray-400">
                {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          )}
        </div>
        
        {reviews.length > 3 && (
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(!showAllReviews)}
            className="flex items-center gap-2"
          >
            {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
          </Button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {displayedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="hover:shadow-md transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {review.rating}/5
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-1">
                        {review.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{getDisplayName(review.user)}</span>
                    </div>
                    {review.tripDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Traveled {format(new Date(review.tripDate), 'MMM yyyy')}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
                  
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <span className="text-xs text-gray-400">
                      Reviewed {format(new Date(review.createdAt), 'MMM d, yyyy')}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Rating Distribution (if we have enough reviews) */}
      {stats && stats.totalReviews >= 5 && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Rating Breakdown</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = (count / reviews.length) * 100;
                
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-8">{star}★</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-8">{count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}