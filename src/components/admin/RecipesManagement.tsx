import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  prep_time_minutes: number;
  cook_time_minutes: number | null;
  base_servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  storage_fridge_days: number | null;
  storage_freezer_months: number | null;
  reheating_instructions: string | null;
  mom_tip: string | null;
  photo_url: string | null;
  created_at: string;
}

const AVAILABLE_TAGS = [
  "Snacks", "Finger Food", "Γρήγορα", "Χωρίς Ζάχαρη", "BLW", "Meal Prep",
  "Πρωινό", "Μεσημεριανό", "Βραδινό", "Vegan", "Vegetarian", "Gluten Free"
];

export default function RecipesManagement() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState(10);
  const [cookTime, setCookTime] = useState(0);
  const [baseServings, setBaseServings] = useState(2);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", amount: "", unit: "" }]);
  const [instructions, setInstructions] = useState<string[]>([""]);
  const [storageFridge, setStorageFridge] = useState<number | null>(null);
  const [storageFreezer, setStorageFreezer] = useState<number | null>(null);
  const [reheatingInstructions, setReheatingInstructions] = useState("");
  const [momTip, setMomTip] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data?.map(r => ({
        ...r,
        ingredients: r.ingredients as unknown as Ingredient[]
      })) || []);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Σφάλμα φόρτωσης συνταγών");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setPrepTime(10);
    setCookTime(0);
    setBaseServings(2);
    setIngredients([{ name: "", amount: "", unit: "" }]);
    setInstructions([""]);
    setStorageFridge(null);
    setStorageFreezer(null);
    setReheatingInstructions("");
    setMomTip("");
    setPhotoUrl("");
    setEditingRecipe(null);
  };

  const openEditDialog = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setTitle(recipe.title);
    setDescription(recipe.description || "");
    setTags(recipe.tags);
    setPrepTime(recipe.prep_time_minutes);
    setCookTime(recipe.cook_time_minutes || 0);
    setBaseServings(recipe.base_servings);
    setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients.map(i => ({ ...i, amount: String(i.amount) })) : [{ name: "", amount: "", unit: "" }]);
    setInstructions(recipe.instructions.length > 0 ? recipe.instructions : [""]);
    setStorageFridge(recipe.storage_fridge_days);
    setStorageFreezer(recipe.storage_freezer_months);
    setReheatingInstructions(recipe.reheating_instructions || "");
    setMomTip(recipe.mom_tip || "");
    setPhotoUrl(recipe.photo_url || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Ο τίτλος είναι υποχρεωτικός");
      return;
    }

    const validIngredients = ingredients.filter(i => i.name.trim());
    const validInstructions = instructions.filter(i => i.trim());

    if (validIngredients.length === 0) {
      toast.error("Προσθέστε τουλάχιστον ένα υλικό");
      return;
    }

    if (validInstructions.length === 0) {
      toast.error("Προσθέστε τουλάχιστον ένα βήμα εκτέλεσης");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Δεν είστε συνδεδεμένοι");
        return;
      }

      const recipeData = {
        title: title.trim(),
        description: description.trim() || null,
        tags,
        prep_time_minutes: prepTime,
        cook_time_minutes: cookTime || null,
        base_servings: baseServings,
        ingredients: validIngredients as unknown as Json,
        instructions: validInstructions,
        storage_fridge_days: storageFridge,
        storage_freezer_months: storageFreezer,
        reheating_instructions: reheatingInstructions.trim() || null,
        mom_tip: momTip.trim() || null,
        photo_url: photoUrl.trim() || null,
      };

      if (editingRecipe) {
        const { error } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq("id", editingRecipe.id);

        if (error) throw error;
        toast.success("Η συνταγή ενημερώθηκε!");
      } else {
        const { error } = await supabase
          .from("recipes")
          .insert({
            ...recipeData,
            created_by: session.user.id,
          });

        if (error) throw error;
        toast.success("Η συνταγή δημιουργήθηκε!");
      }

      setDialogOpen(false);
      resetForm();
      fetchRecipes();
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      toast.error(error.message || "Σφάλμα αποθήκευσης");
    }
  };

  const handleDelete = async (recipeId: string) => {
    if (!confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τη συνταγή;")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", recipeId);

      if (error) throw error;
      toast.success("Η συνταγή διαγράφηκε");
      fetchRecipes();
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα διαγραφής");
    }
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const addInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Φόρτωση...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>🧀 Διαχείριση Συνταγών</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Νέα Συνταγή
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingRecipe ? "Επεξεργασία Συνταγής" : "Νέα Συνταγή"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Τίτλος *</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="π.χ. Μπανάνα Pancakes"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Περιγραφή</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Σύντομη περιγραφή της συνταγής..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label htmlFor="photoUrl">URL Εικόνας</Label>
                      <Input
                        id="photoUrl"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Κατηγορίες / Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {AVAILABLE_TAGS.map((tag) => (
                        <Badge
                          key={tag}
                          variant={tags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Time & Servings */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prepTime">Προετοιμασία (λεπτά) *</Label>
                      <Input
                        id="prepTime"
                        type="number"
                        min={1}
                        value={prepTime}
                        onChange={(e) => setPrepTime(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cookTime">Ψήσιμο (λεπτά)</Label>
                      <Input
                        id="cookTime"
                        type="number"
                        min={0}
                        value={cookTime}
                        onChange={(e) => setCookTime(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="servings">Μερίδες *</Label>
                      <Input
                        id="servings"
                        type="number"
                        min={1}
                        value={baseServings}
                        onChange={(e) => setBaseServings(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Υλικά *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
                        <Plus className="w-4 h-4 mr-1" />
                        Προσθήκη
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {ingredients.map((ingredient, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Όνομα (π.χ. Αλεύρι)"
                            value={ingredient.name}
                            onChange={(e) => updateIngredient(index, "name", e.target.value)}
                            className="flex-1"
                          />
                          <Input
                            type="text"
                            placeholder="Ποσότητα"
                            value={ingredient.amount || ""}
                            onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                            className="w-24"
                          />
                          <Input
                            placeholder="Μονάδα"
                            value={ingredient.unit}
                            onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                            className="w-24"
                          />
                          {ingredients.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeIngredient(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Βήματα Εκτέλεσης *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addInstruction}>
                        <Plus className="w-4 h-4 mr-1" />
                        Προσθήκη
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-2">
                            {index + 1}
                          </span>
                          <Textarea
                            placeholder={`Βήμα ${index + 1}...`}
                            value={instruction}
                            onChange={(e) => updateInstruction(index, e.target.value)}
                            rows={2}
                            className="flex-1"
                          />
                          {instructions.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInstruction(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="storageFridge">Διατήρηση ψυγείο (μέρες)</Label>
                      <Input
                        id="storageFridge"
                        type="number"
                        min={0}
                        value={storageFridge || ""}
                        onChange={(e) => setStorageFridge(e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="storageFreezer">Διατήρηση κατάψυξη (μήνες)</Label>
                      <Input
                        id="storageFreezer"
                        type="number"
                        min={0}
                        value={storageFreezer || ""}
                        onChange={(e) => setStorageFreezer(e.target.value ? Number(e.target.value) : null)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reheating">Οδηγίες Ξαναζεστάματος</Label>
                    <Input
                      id="reheating"
                      value={reheatingInstructions}
                      onChange={(e) => setReheatingInstructions(e.target.value)}
                      placeholder="π.χ. Στον φούρνο για 5 λεπτά"
                    />
                  </div>

                  <div>
                    <Label htmlFor="momTip">Mom's Tip 💡</Label>
                    <Textarea
                      id="momTip"
                      value={momTip}
                      onChange={(e) => setMomTip(e.target.value)}
                      placeholder="Χρήσιμη συμβουλή από μαμά..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Ακύρωση
                    </Button>
                    <Button onClick={handleSave}>
                      {editingRecipe ? "Αποθήκευση" : "Δημιουργία"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Τίτλος</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Χρόνος</TableHead>
                <TableHead>Μερίδες</TableHead>
                <TableHead>Ημερομηνία</TableHead>
                <TableHead className="text-right">Ενέργειες</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell className="font-medium">{recipe.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {recipe.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {recipe.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{recipe.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.prep_time_minutes + (recipe.cook_time_minutes || 0)} λεπτά
                  </TableCell>
                  <TableCell>{recipe.base_servings}</TableCell>
                  <TableCell>
                    {new Date(recipe.created_at).toLocaleDateString("el-GR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(recipe)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(recipe.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {recipes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Δεν υπάρχουν συνταγές
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
