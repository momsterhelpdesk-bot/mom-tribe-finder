import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, X, Check, Trash2 } from "lucide-react";
import {
  PREGNANT_OPTION,
  INFANT_AGE_OPTIONS,
  CHILD_AGE_OPTIONS,
  type ChildAgeOption,
  getAgeLabelFromValue,
} from "@/lib/childAges";

interface Child {
  name?: string;
  ageGroup: string;
  gender?: 'boy' | 'girl' | 'baby';
}

interface ChildrenManagerProps {
  children: Child[];
  onChange: (children: Child[]) => void;
}

export default function ChildrenManager({ children, onChange }: ChildrenManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempChild, setTempChild] = useState<Child>({ ageGroup: "", gender: 'baby' });
  const [expandedSection, setExpandedSection] = useState<'pregnant' | 'infant' | 'child' | null>(null);

  const openAddDialog = () => {
    setEditingIndex(null);
    setTempChild({ ageGroup: "", gender: 'baby' });
    setExpandedSection(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    setEditingIndex(index);
    setTempChild({ ...children[index] });
    // Auto-expand based on current selection
    const currentAge = children[index].ageGroup;
    if (currentAge === PREGNANT_OPTION.value) {
      setExpandedSection('pregnant');
    } else if (INFANT_AGE_OPTIONS.some(opt => opt.value === currentAge)) {
      setExpandedSection('infant');
    } else if (CHILD_AGE_OPTIONS.some(opt => opt.value === currentAge)) {
      setExpandedSection('child');
    } else {
      setExpandedSection(null);
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!tempChild.ageGroup) return;

    if (editingIndex !== null) {
      const newChildren = [...children];
      newChildren[editingIndex] = tempChild;
      onChange(newChildren);
    } else {
      onChange([...children, tempChild]);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    const newChildren = children.filter((_, i) => i !== index);
    onChange(newChildren.length > 0 ? newChildren : [{ ageGroup: "", gender: 'baby' }]);
  };

  const handleAgeSelect = (ageValue: string) => {
    setTempChild(prev => ({ ...prev, ageGroup: ageValue }));
    // Auto-close dialog after selection
    setTimeout(() => {
      // Don't auto-close, let user confirm with OK button
    }, 200);
  };

  const renderAgeButton = (option: ChildAgeOption) => {
    const isSelected = tempChild.ageGroup === option.value;
    return (
      <button
        key={option.value}
        type="button"
        onClick={() => handleAgeSelect(option.value)}
        className={`w-full px-4 py-3 text-left rounded-xl transition-all flex items-center justify-between ${
          isSelected
            ? "bg-primary text-primary-foreground shadow-md"
            : "bg-secondary/50 hover:bg-secondary text-foreground"
        }`}
      >
        <span className="font-medium">{option.label}</span>
        {isSelected && <Check className="w-5 h-5" />}
      </button>
    );
  };

  const getChildDisplayLabel = (child: Child) => {
    if (child.ageGroup === 'pregnant') return '🤰 Έγκυος';
    const ageLabel = getAgeLabelFromValue(child.ageGroup);
    const genderEmoji = child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '👶';
    return `${genderEmoji} ${child.name || ageLabel}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">Τα παιδάκια σου 🤍</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Η ηλικία μας βοηθά να σου δείχνουμε μαμάδες που βρίσκονται στο ίδιο στάδιο με εσένα.
        </p>
      </div>

      {/* Children list */}
      <div className="space-y-2">
        {children.map((child, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border/50"
          >
            <button
              type="button"
              onClick={() => openEditDialog(index)}
              className="flex-1 text-left"
            >
              <div className="font-medium">
                {child.ageGroup ? getChildDisplayLabel(child) : '➕ Επέλεξε ηλικία'}
              </div>
              {child.name && child.ageGroup && (
                <div className="text-sm text-muted-foreground">
                  {getAgeLabelFromValue(child.ageGroup)}
                </div>
              )}
            </button>
            {children.length > 1 && (
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add child button */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground text-center">
          Μπορείς να διαλέξεις περισσότερες ηλικίες, αν έχεις περισσότερα από ένα παιδάκια 🤍
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={openAddDialog}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Προσθήκη παιδιού
        </Button>
      </div>

      {/* Edit/Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {editingIndex !== null ? 'Επεξεργασία' : 'Προσθήκη παιδιού'}
              </DialogTitle>
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 pb-4">
              {/* Name input */}
              <div>
                <Label className="text-sm">Όνομα (προαιρετικό)</Label>
                <Input
                  placeholder="π.χ. Μαριάννα"
                  value={tempChild.name || ""}
                  onChange={(e) => setTempChild(prev => ({ ...prev, name: e.target.value }))}
                  maxLength={50}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Το όνομα είναι προαιρετικό — μόνο για να νιώθεις το προφίλ σου πιο «δικό σου» 🤍
                </p>
              </div>

              {/* Gender selection */}
              <div>
                <Label className="text-sm">Φύλο</Label>
                <div className="flex gap-2 mt-1">
                  <Button
                    type="button"
                    variant={tempChild.gender === 'boy' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTempChild(prev => ({ ...prev, gender: 'boy' }))}
                  >
                    👦 Αγόρι
                  </Button>
                  <Button
                    type="button"
                    variant={tempChild.gender === 'girl' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTempChild(prev => ({ ...prev, gender: 'girl' }))}
                  >
                    👧 Κορίτσι
                  </Button>
                  <Button
                    type="button"
                    variant={tempChild.gender === 'baby' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTempChild(prev => ({ ...prev, gender: 'baby' }))}
                  >
                    👶 Μωρό
                  </Button>
                </div>
              </div>

              {/* Age selection */}
              <div>
                <Label className="text-sm font-semibold">Ηλικία *</Label>
                <div className="space-y-3 mt-2">
                  {/* Pregnant option */}
                  <div>
                    {renderAgeButton(PREGNANT_OPTION)}
                  </div>

                  {/* Infants Section */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === 'infant' ? null : 'infant')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-pink-50 dark:bg-pink-950/30 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-950/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">👶</span>
                        <span className="font-semibold text-foreground">Βρέφη</span>
                        <span className="text-sm text-muted-foreground">(0-12 μηνών)</span>
                      </div>
                      <span className={`transition-transform ${expandedSection === 'infant' ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {expandedSection === 'infant' && (
                      <div className="pl-2 space-y-2 animate-fade-in">
                        {INFANT_AGE_OPTIONS.map(renderAgeButton)}
                      </div>
                    )}

                    {/* Show selected infant age even when collapsed */}
                    {expandedSection !== 'infant' && INFANT_AGE_OPTIONS.some(opt => opt.value === tempChild.ageGroup) && (
                      <div className="pl-2">
                        {renderAgeButton(INFANT_AGE_OPTIONS.find(opt => opt.value === tempChild.ageGroup)!)}
                      </div>
                    )}
                  </div>

                  {/* Children Section */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setExpandedSection(expandedSection === 'child' ? null : 'child')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-950/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🧒</span>
                        <span className="font-semibold text-foreground">Παιδιά</span>
                        <span className="text-sm text-muted-foreground">(1-17 ετών)</span>
                      </div>
                      <span className={`transition-transform ${expandedSection === 'child' ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>

                    {expandedSection === 'child' && (
                      <div className="pl-2 space-y-2 animate-fade-in max-h-[200px] overflow-y-auto">
                        {CHILD_AGE_OPTIONS.map(renderAgeButton)}
                      </div>
                    )}

                    {/* Show selected child age even when collapsed */}
                    {expandedSection !== 'child' && CHILD_AGE_OPTIONS.some(opt => opt.value === tempChild.ageGroup) && (
                      <div className="pl-2">
                        {renderAgeButton(CHILD_AGE_OPTIONS.find(opt => opt.value === tempChild.ageGroup)!)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Πίσω
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!tempChild.ageGroup}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              ΟΚ, έτοιμο ✨
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
