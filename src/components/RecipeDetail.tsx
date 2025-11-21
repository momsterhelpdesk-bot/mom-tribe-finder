import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Star, Snowflake, Flame } from "lucide-react";
import { toast } from "sonner";
import { RecipeReviews } from "./RecipeReviews";
import { RecipePhotos } from "./RecipePhotos";

interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  tags: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  base_servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  storage_fridge_days: number;
  storage_freezer_months: number;
  reheating_instructions: string;
  mom_tip: string;
  photo_url: string;
  average_rating: number;
  reviews_count: number;
}

interface RecipeDetailProps {
  recipeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecipeDetail({ recipeId, open, onOpenChange }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [desiredServings, setDesiredServings] = useState(2);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (recipeId && open) {
      fetchRecipe();
    }
  }, [recipeId, open]);

  const fetchRecipe = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", recipeId)
        .single();

      if (error) throw error;
      setRecipe({
        ...data,
        ingredients: data.ingredients as unknown as Ingredient[],
      });
      setDesiredServings(data.base_servings);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      toast.error("Σφάλμα φόρτωσης συνταγής");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !recipe) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <p className="text-center py-8">Φόρτωση...</p>
        </DialogContent>
      </Dialog>
    );
  }

  const multiplier = desiredServings / recipe.base_servings;

  const calculateAmount = (amount: number) => {
    const calculated = amount * multiplier;
    return Number.isInteger(calculated) ? calculated : calculated.toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
        </DialogHeader>

        {recipe.photo_url && (
          <img
            src={recipe.photo_url}
            alt={recipe.title}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Time & Servings Info */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Προετοιμασία</p>
                  <p className="font-medium">{recipe.prep_time_minutes} λεπτά</p>
                </div>
              </div>
              {recipe.cook_time_minutes > 0 && (
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ψήσιμο</p>
                    <p className="font-medium">{recipe.cook_time_minutes} λεπτά</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Servings Calculator */}
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <label className="text-sm font-medium mb-2 block">
              ✏️ Επιθυμητές Μερίδες
            </label>
            <Input
              type="number"
              min="1"
              value={desiredServings}
              onChange={(e) => setDesiredServings(Number(e.target.value) || 1)}
              className="w-24"
            />
          </CardContent>
        </Card>

        {/* Ingredients */}
        <div>
          <h3 className="font-bold text-lg mb-3">🧺 Υλικά</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Για {desiredServings} {desiredServings === 1 ? "μερίδα" : "μερίδες"}:
          </p>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>
                  <strong>{ingredient.name}:</strong>{" "}
                  {calculateAmount(ingredient.amount)} {ingredient.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h3 className="font-bold text-lg mb-3">🔪 Εκτέλεση</h3>
          <ol className="space-y-3">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="flex-1 pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Storage */}
        {(recipe.storage_fridge_days || recipe.storage_freezer_months) && (
          <Card>
            <CardContent className="p-4">
              <h3 className="font-bold mb-3">🧊 Αποθήκευση & Χρόνος Διατήρησης</h3>
              <div className="space-y-2 text-sm">
                {recipe.storage_fridge_days && (
                  <p>🧊 Στο ψυγείο: έως {recipe.storage_fridge_days} μέρες</p>
                )}
                {recipe.storage_freezer_months && (
                  <p>❄️ Στην κατάψυξη: έως {recipe.storage_freezer_months} μήνες</p>
                )}
                {recipe.reheating_instructions && (
                  <p>⚡ Ξαναζέσταμα: {recipe.reheating_instructions}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mom Tip */}
        {recipe.mom_tip && (
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="p-4">
              <p className="text-sm">
                <strong>💡 Tip Μαμάς:</strong> {recipe.mom_tip}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Rating Summary */}
        {recipe.reviews_count > 0 && (
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">
                {recipe.average_rating.toFixed(1)}
              </span>
            </div>
            <span className="text-muted-foreground">
              ({recipe.reviews_count} αξιολογήσεις)
            </span>
          </div>
        )}

        {/* Reviews */}
        <RecipeReviews recipeId={recipe.id} />

        {/* User Photos */}
        <RecipePhotos recipeId={recipe.id} />
      </DialogContent>
    </Dialog>
  );
}
