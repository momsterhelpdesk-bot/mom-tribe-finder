import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { 
  PREGNANT_OPTION,
  INFANT_AGE_OPTIONS, 
  CHILD_AGE_OPTIONS,
  type ChildAgeOption 
} from "@/lib/childAges";

interface ChildAgeSelectorProps {
  selectedAge: string;
  onSelect: (ageValue: string) => void;
  showPregnant?: boolean;
}

export default function ChildAgeSelector({ 
  selectedAge, 
  onSelect,
  showPregnant = true 
}: ChildAgeSelectorProps) {
  const [expandedSection, setExpandedSection] = useState<'infant' | 'child' | null>(
    // Auto-expand based on current selection
    INFANT_AGE_OPTIONS.some(opt => opt.value === selectedAge) ? 'infant' :
    CHILD_AGE_OPTIONS.some(opt => opt.value === selectedAge) ? 'child' : null
  );

  const renderAgeButton = (option: ChildAgeOption) => {
    const isSelected = selectedAge === option.value;
    return (
      <button
        key={option.value}
        type="button"
        onClick={() => onSelect(option.value)}
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

  return (
    <div className="space-y-4">
      {/* Pregnant option */}
      {showPregnant && (
        <div>
          {renderAgeButton(PREGNANT_OPTION)}
        </div>
      )}

      {/* Βρέφη Section */}
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
        {expandedSection !== 'infant' && INFANT_AGE_OPTIONS.some(opt => opt.value === selectedAge) && (
          <div className="pl-2">
            {renderAgeButton(INFANT_AGE_OPTIONS.find(opt => opt.value === selectedAge)!)}
          </div>
        )}
      </div>

      {/* Παιδιά Section */}
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
          <ScrollArea className="h-[280px] pl-2">
            <div className="space-y-2 pr-3">
              {CHILD_AGE_OPTIONS.map(renderAgeButton)}
            </div>
          </ScrollArea>
        )}
        
        {/* Show selected child age even when collapsed */}
        {expandedSection !== 'child' && CHILD_AGE_OPTIONS.some(opt => opt.value === selectedAge) && (
          <div className="pl-2">
            {renderAgeButton(CHILD_AGE_OPTIONS.find(opt => opt.value === selectedAge)!)}
          </div>
        )}
      </div>
    </div>
  );
}
