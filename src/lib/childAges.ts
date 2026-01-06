// Centralized child age definitions for consistent use across the app

export interface ChildAgeOption {
  value: string;
  label: string;
  months: number; // For matching calculations
  category: 'pregnant' | 'infant' | 'child';
}

// Βρέφη (0-12 months)
export const INFANT_AGE_OPTIONS: ChildAgeOption[] = [
  { value: "0-3-months", label: "0-3 μηνών", months: 1.5, category: 'infant' },
  { value: "3-6-months", label: "3-6 μηνών", months: 4.5, category: 'infant' },
  { value: "6-9-months", label: "6-9 μηνών", months: 7.5, category: 'infant' },
  { value: "9-12-months", label: "9-12 μηνών", months: 10.5, category: 'infant' },
];

// Παιδιά (1-17 ετών)
export const CHILD_AGE_OPTIONS: ChildAgeOption[] = [
  { value: "1-year", label: "1 έτους", months: 12, category: 'child' },
  { value: "2-years", label: "2 ετών", months: 24, category: 'child' },
  { value: "3-years", label: "3 ετών", months: 36, category: 'child' },
  { value: "4-years", label: "4 ετών", months: 48, category: 'child' },
  { value: "5-years", label: "5 ετών", months: 60, category: 'child' },
  { value: "6-years", label: "6 ετών", months: 72, category: 'child' },
  { value: "7-years", label: "7 ετών", months: 84, category: 'child' },
  { value: "8-years", label: "8 ετών", months: 96, category: 'child' },
  { value: "9-years", label: "9 ετών", months: 108, category: 'child' },
  { value: "10-years", label: "10 ετών", months: 120, category: 'child' },
  { value: "11-years", label: "11 ετών", months: 132, category: 'child' },
  { value: "12-years", label: "12 ετών", months: 144, category: 'child' },
  { value: "13-years", label: "13 ετών", months: 156, category: 'child' },
  { value: "14-years", label: "14 ετών", months: 168, category: 'child' },
  { value: "15-years", label: "15 ετών", months: 180, category: 'child' },
  { value: "16-years", label: "16 ετών", months: 192, category: 'child' },
  { value: "17-years", label: "17 ετών", months: 204, category: 'child' },
];

// Pregnant option
export const PREGNANT_OPTION: ChildAgeOption = {
  value: "pregnant", label: "Είμαι έγκυος 🤰", months: 0, category: 'pregnant'
};

// All options combined
export const ALL_AGE_OPTIONS: ChildAgeOption[] = [
  PREGNANT_OPTION,
  ...INFANT_AGE_OPTIONS,
  ...CHILD_AGE_OPTIONS,
];

// Old age group mappings for migration
export const OLD_AGE_MAPPINGS: Record<string, string> = {
  "Είμαι έγκυος 🤰": "pregnant",
  "Βρέφος": "0-3-months",
  "0-6 μήνες": "0-3-months",
  "0-6 μηνών": "0-3-months",
  "6-12 μήνες": "6-9-months",
  "6-12 μηνών": "6-9-months",
  // These ranges need user re-selection
  "1-2 χρόνια": "needs-update",
  "1-2 χρονών": "needs-update",
  "2-3 χρόνια": "needs-update",
  "2-3 χρονών": "needs-update",
  "3-5 χρόνια": "needs-update",
  "3-5 χρονών": "needs-update",
  "5+ χρόνια": "needs-update",
  "5+ χρονών": "needs-update",
};

// Get age option by value
export function getAgeOptionByValue(value: string): ChildAgeOption | undefined {
  return ALL_AGE_OPTIONS.find(opt => opt.value === value);
}

// Get months from age value (for matching calculations)
export function getMonthsFromAgeValue(value: string): number {
  const option = getAgeOptionByValue(value);
  return option?.months ?? 24; // Default to 24 months if unknown
}

// Get display label from age value
export function getAgeLabelFromValue(value: string): string {
  const option = getAgeOptionByValue(value);
  return option?.label ?? value;
}

// Check if age value needs migration/update
export function needsAgeMigration(ageGroup: string): boolean {
  // Check against old mappings
  const mapped = OLD_AGE_MAPPINGS[ageGroup];
  if (mapped === "needs-update") return true;
  
  // If it's an old format and not in our new system
  if (!getAgeOptionByValue(ageGroup) && !OLD_AGE_MAPPINGS[ageGroup]) {
    // Could be an old format - check if it contains ranges
    if (ageGroup.includes("-") && (ageGroup.includes("χρόνια") || ageGroup.includes("χρονών"))) {
      return true;
    }
  }
  
  return false;
}

// Migrate old age value to new format (if possible)
export function migrateAgeValue(oldValue: string): string | null {
  const mapped = OLD_AGE_MAPPINGS[oldValue];
  if (mapped && mapped !== "needs-update") {
    return mapped;
  }
  // If already in new format, return as-is
  if (getAgeOptionByValue(oldValue)) {
    return oldValue;
  }
  return null; // Needs manual update
}
