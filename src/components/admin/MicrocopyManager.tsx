import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, Plus, Edit, Trash2, Save, X, FileText, 
  Globe, Loader2, Filter
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Microcopy {
  id: string;
  key: string;
  label: string;
  text_el: string;
  text_en: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "general", label: "Γενικά" },
  { value: "onboarding", label: "Onboarding" },
  { value: "discover", label: "Discover" },
  { value: "matching", label: "Matching" },
  { value: "profile", label: "Profile" },
  { value: "popups", label: "Popups" },
  { value: "buttons", label: "Buttons" },
  { value: "errors", label: "Errors" },
  { value: "notifications", label: "Notifications" },
];

const emptyMicrocopy: Omit<Microcopy, "id" | "created_at" | "updated_at"> = {
  key: "",
  label: "",
  text_el: "",
  text_en: "",
  description: "",
  category: "general",
};

export default function MicrocopyManager() {
  const [items, setItems] = useState<Microcopy[]>([]);
  const [filteredItems, setFilteredItems] = useState<Microcopy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<Partial<Microcopy> | null>(null);
  const [deleteItem, setDeleteItem] = useState<Microcopy | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [searchTerm, categoryFilter, items]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("app_microcopy")
        .select("*")
        .order("category", { ascending: true })
        .order("key", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      console.error("Error fetching microcopy:", error);
      toast({
        title: "Σφάλμα",
        description: "Αποτυχία φόρτωσης microcopy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = [...items];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.key.toLowerCase().includes(term) ||
          item.label.toLowerCase().includes(term) ||
          item.text_el.toLowerCase().includes(term) ||
          item.text_en.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    setFilteredItems(filtered);
  };

  const handleSave = async () => {
    if (!editingItem || !editingItem.key || !editingItem.label) {
      toast({
        title: "Σφάλμα",
        description: "Συμπληρώστε τουλάχιστον Key και Label",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingItem.id) {
        // Update existing
        const { error } = await supabase
          .from("app_microcopy")
          .update({
            key: editingItem.key,
            label: editingItem.label,
            text_el: editingItem.text_el || "",
            text_en: editingItem.text_en || "",
            description: editingItem.description,
            category: editingItem.category,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Αποθηκεύτηκε ✅" });
      } else {
        // Create new
        const { error } = await supabase
          .from("app_microcopy")
          .insert({
            key: editingItem.key,
            label: editingItem.label,
            text_el: editingItem.text_el || "",
            text_en: editingItem.text_en || "",
            description: editingItem.description,
            category: editingItem.category || "general",
          });

        if (error) throw error;
        toast({ title: "Δημιουργήθηκε ✅" });
      }

      setEditingItem(null);
      fetchItems();
    } catch (error: any) {
      console.error("Error saving microcopy:", error);
      toast({
        title: "Σφάλμα",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    try {
      const { error } = await supabase
        .from("app_microcopy")
        .delete()
        .eq("id", deleteItem.id);

      if (error) throw error;

      toast({ title: "Διαγράφηκε" });
      setDeleteItem(null);
      fetchItems();
    } catch (error: any) {
      console.error("Error deleting microcopy:", error);
      toast({
        title: "Σφάλμα",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Micro-copy Editor
              </CardTitle>
              <CardDescription>
                Επεξεργασία κειμένων και labels (EL/EN) που εμφανίζονται στο app
              </CardDescription>
            </div>
            <Button onClick={() => setEditingItem({ ...emptyMicrocopy })}>
              <Plus className="w-4 h-4 mr-2" />
              Νέο Entry
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Αναζήτηση key, label, κείμενο..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Κατηγορία" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Όλες</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="px-3">
              {filteredItems.length} entries
            </Badge>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                        {item.key}
                      </code>
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryLabel(item.category)}
                      </Badge>
                    </div>
                    <p className="font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    )}
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" /> EL:
                        </span>
                        <p className="truncate">{item.text_el || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Globe className="w-3 h-3" /> EN:
                        </span>
                        <p className="truncate">{item.text_en || "—"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingItem({ ...item })}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Δεν βρέθηκαν entries
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editingItem !== null} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.id ? "Επεξεργασία" : "Νέο"} Micro-copy
            </DialogTitle>
            <DialogDescription>
              Τα κείμενα εφαρμόζονται live σε όλο το app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key *</Label>
                <Input
                  id="key"
                  placeholder="welcome_title"
                  value={editingItem?.key || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, key: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Unique identifier (snake_case)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Κατηγορία</Label>
                <Select
                  value={editingItem?.category || "general"}
                  onValueChange={(value) =>
                    setEditingItem({ ...editingItem, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                placeholder="Welcome Title"
                value={editingItem?.label || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, label: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Περιγραφή για εσάς (δεν εμφανίζεται στο app)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Σημειώσεις</Label>
              <Input
                id="description"
                placeholder="Πού εμφανίζεται αυτό το κείμενο..."
                value={editingItem?.description || ""}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="text_el" className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> Ελληνικά
                </Label>
                <Textarea
                  id="text_el"
                  placeholder="Το κείμενο στα ελληνικά..."
                  value={editingItem?.text_el || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, text_el: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="text_en" className="flex items-center gap-1">
                  <Globe className="w-4 h-4" /> English
                </Label>
                <Textarea
                  id="text_en"
                  placeholder="The text in English..."
                  value={editingItem?.text_en || ""}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, text_en: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              <X className="w-4 h-4 mr-2" />
              Ακύρωση
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Αποθήκευση
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={deleteItem !== null} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Διαγραφή Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Θέλετε σίγουρα να διαγράψετε το <strong>{deleteItem?.key}</strong>; 
              Αυτή η ενέργεια δεν μπορεί να αναιρεθεί.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ακύρωση</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Διαγραφή
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
