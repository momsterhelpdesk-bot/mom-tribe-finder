import { useState, useEffect } from "react";
import { ProfileMatch } from "@/hooks/use-matching";
import { Sparkles } from "lucide-react";

interface AIMatchReasonProps {
  profile: ProfileMatch;
  currentUser: any;
}

// Cache for AI reasons to avoid recalculating
const reasonsCache = new Map<string, string>();

// Generate smart match reason based on profile comparison
function generateMatchReason(profile: ProfileMatch, currentUser: any): string {
  if (!currentUser) return "";
  
  const cacheKey = `${profile.id}-${currentUser.id}`;
  if (reasonsCache.has(cacheKey)) {
    return reasonsCache.get(cacheKey)!;
  }

  const reasons: string[] = [];
  
  // Check common interests
  const userInterests = currentUser.interests || [];
  const profileInterests = profile.interests || [];
  const commonInterests = userInterests.filter((i: string) => profileInterests.includes(i));
  
  // Lifestyle interests to check
  const lifestyleMap: Record<string, string> = {
    'single_mom': 'είστε και οι δύο single moms',
    'Single Mom 💪': 'είστε και οι δύο single moms',
    'working_mom': 'δουλεύετε και οι δύο',
    'Working Mom 💼': 'δουλεύετε και οι δύο',
    'wfh_mom': 'δουλεύετε και οι δύο από το σπίτι',
    'WFH Mom 🏠': 'δουλεύετε και οι δύο από το σπίτι',
    'stay_at_home': 'είστε και οι δύο στο σπίτι με τα παιδιά',
    'Stay at Home Mom 🏡': 'είστε και οι δύο στο σπίτι με τα παιδιά',
    'happily_married 💍': 'είστε και οι δύο παντρεμένες',
    'twin_mom': 'έχετε και οι δύο δίδυμα!',
    'Twin Mom 👶👶': 'έχετε και οι δύο δίδυμα!',
  };

  // Check lifestyle matches
  for (const [key, message] of Object.entries(lifestyleMap)) {
    if (userInterests.includes(key) && profileInterests.includes(key)) {
      reasons.push(message);
      break; // Only one lifestyle reason
    }
  }

  // Activity interests
  const activityMap: Record<string, string> = {
    'Ζωγραφική 🎨': 'σας αρέσει και στις δύο η ζωγραφική',
    'Γιόγκα 🧘‍♀️': 'κάνετε και οι δύο γιόγκα',
    'Μαγειρική 🍳': 'λατρεύετε και οι δύο το μαγείρεμα',
    'Διάβασμα 📚': 'αγαπάτε και οι δύο το διάβασμα',
    'Κηπουρική 🌱': 'ασχολείστε και οι δύο με κηπουρική',
    'Pilates': 'κάνετε και οι δύο Pilates',
    'Running 🏃‍♀️': 'τρέχετε και οι δύο',
    'Ταξίδια ✈️': 'αγαπάτε και οι δύο τα ταξίδια',
    'Φωτογραφία 📸': 'σας αρέσει και στις δύο η φωτογραφία',
    'Χειροτεχνίες 🧶': 'ασχολείστε και οι δύο με χειροτεχνίες',
    'Coffee Dates ☕': 'αγαπάτε και οι δύο τους καφέδες',
    'Park Playdates 🌳': 'βγαίνετε και οι δύο στο πάρκο',
    'Beach Days 🏖️': 'λατρεύετε και οι δύο την παραλία',
  };

  // Find common activity interests
  for (const [interest, message] of Object.entries(activityMap)) {
    if (commonInterests.includes(interest)) {
      reasons.push(message);
      break; // Only one activity reason
    }
  }

  // Check child age similarity
  const userChildren = currentUser.children as any[] || [];
  const profileChildren = profile.children as any[] || [];
  
  if (userChildren.length > 0 && profileChildren.length > 0) {
    // Simple age group matching
    const userAgeGroups = userChildren.map(c => c.ageGroup || '').filter(Boolean);
    const profileAgeGroups = profileChildren.map(c => c.ageGroup || '').filter(Boolean);
    
    const commonAges = userAgeGroups.filter(age => 
      profileAgeGroups.some(pAge => age === pAge)
    );
    
    if (commonAges.length > 0) {
      reasons.push('τα παιδιά σας είναι στην ίδια ηλικία');
    }
  }

  // Check location
  if (profile.isSameArea && currentUser.area && profile.area) {
    reasons.push(`μένετε και οι δύο στην ${profile.area}`);
  } else if (profile.isSameCity && currentUser.city && profile.city) {
    reasons.push(`είστε και οι δύο στην ${profile.city}`);
  }

  // Build final reason
  let finalReason = "";
  if (reasons.length >= 2) {
    finalReason = `${reasons[0]} και ${reasons[1]}`;
  } else if (reasons.length === 1) {
    finalReason = reasons[0];
  } else if (commonInterests.length > 0) {
    // Fallback: just mention common interests count
    finalReason = `έχετε ${commonInterests.length} κοινά ενδιαφέροντα`;
  }

  // Cache and return
  if (finalReason) {
    reasonsCache.set(cacheKey, finalReason);
  }
  
  return finalReason;
}

export function AIMatchReason({ profile, currentUser }: AIMatchReasonProps) {
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    if (profile && currentUser) {
      const matchReason = generateMatchReason(profile, currentUser);
      setReason(matchReason);
    }
  }, [profile.id, currentUser?.id]);

  if (!reason) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-xl border border-purple-100/50">
      <Sparkles className="w-4 h-4 text-purple-500 flex-shrink-0" />
      <p className="text-xs text-purple-700 font-medium">
        ✨ {reason.charAt(0).toUpperCase() + reason.slice(1)}
      </p>
    </div>
  );
}

export default AIMatchReason;
