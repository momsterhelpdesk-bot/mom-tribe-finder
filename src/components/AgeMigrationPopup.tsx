import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Plus, Trash2 } from "lucide-react";
import ChildAgeSelector from "./ChildAgeSelector";
import mascot from "@/assets/mascot.jpg";

interface ChildData {
  name?: string;
  ageGroup: string;
  gender?: 'boy' | 'girl' | 'baby';
}

interface AgeMigrationPopupProps {
  open: boolean;
  onClose: () => void;
  currentChildren: ChildData[];
  onSave: (children: ChildData[]) => Promise<void>;
}

export default function AgeMigrationPopup({
  open,
  onClose,
  currentChildren,
  onSave
}: AgeMigrationPopupProps) {
  const [children, setChildren] = useState<ChildData[]>(
    currentChildren.length > 0 ? currentChildren : [{ ageGroup: "", gender: 'baby' }]
  );
  const [activeChildIndex, setActiveChildIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const updateChildAge = (ageGroup: string) => {
    const newChildren = [...children];
    newChildren[activeChildIndex].ageGroup = ageGroup;
    setChildren(newChildren);
  };

  const updateChildGender = (gender: 'boy' | 'girl' | 'baby') => {
    const newChildren = [...children];
    newChildren[activeChildIndex].gender = gender;
    setChildren(newChildren);
  };

  const addChild = () => {
    setChildren([...children, { ageGroup: "", gender: 'baby' }]);
    setActiveChildIndex(children.length);
  };

  const removeChild = (index: number) => {
    if (children.length === 1) return;
    const newChildren = children.filter((_, i) => i !== index);
    setChildren(newChildren);
    if (activeChildIndex >= newChildren.length) {
      setActiveChildIndex(newChildren.length - 1);
    }
  };

  const handleSave = async () => {
    // Validate at least one child has age selected
    if (!children.some(c => c.ageGroup)) {
      return;
    }
    
    setSaving(true);
    try {
      await onSave(children);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const allChildrenHaveAge = children.every(c => c.ageGroup);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md max-h-[90vh] p-0 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
          aria-label="Κλείσιμο"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-6">
          {/* Header with mascot */}
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={mascot} 
              alt="Momster" 
              className="w-16 h-16 rounded-full object-cover shadow-md"
            />
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Μικρή ενημέρωση 🤍
              </DialogTitle>
            </div>
          </div>

          <p className="text-muted-foreground mb-4 leading-relaxed">
            Ανανεώσαμε τις ηλικίες των παιδιών για πιο ταιριαστές γνωριμίες.
            Θες να μας πεις ξανά την ηλικία του παιδιού σου; Παίρνει λιγότερο από ένα λεπτό ✨
          </p>

          <p className="text-sm text-muted-foreground mb-4">
            Μπορείς να διαλέξεις περισσότερες ηλικίες, αν έχεις περισσότερα από ένα παιδάκια 🤍
          </p>

          {/* Child tabs */}
          {children.length > 1 && (
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {children.map((child, index) => (
                <button
                  key={index}
                  onClick={() => setActiveChildIndex(index)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                    activeChildIndex === index
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  <span>Παιδί {index + 1}</span>
                  {children.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeChild(index);
                      }}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Gender selection for active child */}
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Φύλο:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={children[activeChildIndex]?.gender === 'boy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateChildGender('boy')}
              >
                👦 Αγόρι
              </Button>
              <Button
                type="button"
                variant={children[activeChildIndex]?.gender === 'girl' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateChildGender('girl')}
              >
                👧 Κορίτσι
              </Button>
              <Button
                type="button"
                variant={children[activeChildIndex]?.gender === 'baby' ? 'default' : 'outline'}
                size="sm"
                onClick={() => updateChildGender('baby')}
              >
                👶 Μωρό
              </Button>
            </div>
          </div>

          {/* Age selector */}
          <ScrollArea className="h-[300px] pr-2">
            <ChildAgeSelector
              selectedAge={children[activeChildIndex]?.ageGroup || ""}
              onSelect={updateChildAge}
            />
          </ScrollArea>

          {/* Add child button */}
          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={addChild}
          >
            <Plus className="w-4 h-4 mr-2" />
            Προσθήκη Παιδιού
          </Button>

          {/* Save button */}
          <Button
            className="w-full mt-4"
            size="lg"
            onClick={handleSave}
            disabled={saving || !allChildrenHaveAge}
          >
            {saving ? "Αποθήκευση..." : "👉 Εντάξει, πάμε"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
