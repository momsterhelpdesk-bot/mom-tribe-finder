import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { el } from "date-fns/locale";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface RecipeReviewsProps {
  recipeId: string;
}

export function RecipeReviews({ recipeId }: RecipeReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    getCurrentUser();
  }, [recipeId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchReviews = async () => {
    try {
      // Fetch reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("recipe_reviews")
        .select("*")
        .eq("recipe_id", recipeId)
        .order("created_at", { ascending: false });

      if (reviewsError) throw reviewsError;

      // Fetch user profiles
      if (reviewsData && reviewsData.length > 0) {
        const userIds = reviewsData.map((r) => r.user_id);
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles_safe")
          .select("id, full_name")
          .in("id", userIds);

        if (profilesError) throw profilesError;

        // Combine data
        const reviewsWithProfiles = reviewsData.map((review) => {
          const profile = profilesData?.find((p) => p.id === review.user_id);
          return {
            ...review,
            profiles: { full_name: profile?.full_name || "Ανώνυμη Μαμά" },
          };
        });

        setReviews(reviewsWithProfiles);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const submitReview = async () => {
    if (!currentUserId) {
      toast.error("Πρέπει να συνδεθείτε για να αφήσετε αξιολόγηση");
      return;
    }

    if (newRating === 0) {
      toast.error("Παρακαλώ επιλέξτε αστέρια");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("recipe_reviews").insert({
        recipe_id: recipeId,
        user_id: currentUserId,
        rating: newRating,
        comment: newComment,
      });

      if (error) throw error;

      toast.success("Η αξιολόγησή σας καταχωρήθηκε!");
      setNewRating(0);
      setNewComment("");
      fetchReviews();
    } catch (error: any) {
      console.error("Error submitting review:", error);
      toast.error(error.message || "Σφάλμα κατά την υποβολή");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">💬 Σχόλια & Αξιολογήσεις</h3>

      {/* Submit Review */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div>
            <p className="text-sm font-medium mb-2">Βαθμολογία Συνταγής</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoveredStar || newRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Textarea
              placeholder="Μοιραστείτε την εμπειρία σας με αυτή τη συνταγή..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={submitReview} disabled={submitting} className="w-full">
            {submitting ? "Υποβολή..." : "Ανέβασε το σχόλιό σου"}
          </Button>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Καμία αξιολόγηση ακόμα. Γίνε η πρώτη!
          </p>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{review.profiles.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), {
                        addSuffix: true,
                        locale: el,
                      })}
                    </p>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
