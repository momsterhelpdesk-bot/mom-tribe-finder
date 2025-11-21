import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { RecipeDetail } from "@/components/RecipeDetail";
import { useLanguage } from "@/contexts/LanguageContext";

interface Recipe {
  id: string;
  title: string;
  description: string;
  tags: string[];
  prep_time_minutes: number;
  cook_time_minutes: number;
  base_servings: number;
  photo_url: string;
  average_rating: number;
  reviews_count: number;
}

const FILTER_CATEGORIES = [
  { key: "Snacks", emoji: "🍿" },
  { key: "Finger Food", emoji: "👶" },
  { key: "Γρήγορα", emoji: "⚡" },
  { key: "Χωρίς Ζάχαρη", emoji: "🚫🍬" },
  { key: "BLW", emoji: "🍼" },
  { key: "Meal Prep", emoji: "📦" },
];

export default function Recipes() {
  const { t } = useLanguage();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (selectedFilters.length === 0) {
      setFilteredRecipes(recipes);
    } else {
      setFilteredRecipes(
        recipes.filter((recipe) =>
          selectedFilters.some((filter) => recipe.tags.includes(filter))
        )
      );
    }
  }, [selectedFilters, recipes]);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
      setFilteredRecipes(data || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/10 p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🧀 Momster Ταπεράκι
        </h1>
        <p className="text-muted-foreground">
          Υγιεινές και εύκολες συνταγές για μικρά χεράκια
        </p>
      </div>

      {/* Filters */}
      <div className="p-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              🔍 Φίλτρα Συνταγών {selectedFilters.length > 0 && `(${selectedFilters.length})`}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Επιλέξτε Κατηγορίες</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {FILTER_CATEGORIES.map((category) => (
                <div key={category.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.key}
                    checked={selectedFilters.includes(category.key)}
                    onCheckedChange={() => toggleFilter(category.key)}
                  />
                  <label
                    htmlFor={category.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {category.emoji} {category.key}
                  </label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {selectedFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedFilters.map((filter) => (
              <Badge
                key={filter}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleFilter(filter)}
              >
                {filter} ✕
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Recipes Grid */}
      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground">Φόρτωση συνταγών...</p>
        ) : filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Δεν βρέθηκαν συνταγές με αυτά τα φίλτρα
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedRecipe(recipe.id)}
            >
              {recipe.photo_url && (
                <img
                  src={recipe.photo_url}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">
                      {recipe.title}
                    </h3>
                    {recipe.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {recipe.description}
                      </p>
                    )}
                  </div>
                  {recipe.average_rating > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        {recipe.average_rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {recipe.prep_time_minutes + (recipe.cook_time_minutes || 0)}'
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {recipe.base_servings} μερίδες
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recipe Detail Dialog */}
      {selectedRecipe && (
        <RecipeDetail
          recipeId={selectedRecipe}
          open={!!selectedRecipe}
          onOpenChange={(open) => !open && setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
