import { Badge } from "@/components/ui/badge";
import { MapPin, User } from "lucide-react";
import { ProfileMatch } from "@/hooks/use-matching";
import { useMicrocopy } from "@/hooks/use-microcopy";
import { useNavigate } from "react-router-dom";

interface MomCardInfoProps {
  profile: ProfileMatch;
  currentUser?: any;
  compact?: boolean;
}

// Lifestyle interest IDs for matching
const lifestyleInterestIds = [
  'single_mom', 'working_mom', 'wfh_mom', 'stay_at_home', 'maternity_leave',
  'with_support', 'without_support', 'relaxed_mom', 'anxious_mom', 'sleep_deprived',
  'mom_studying', 'side_hustle', 'difficult_experience', 'special_needs', 'twin_mom',
  'want_understanding', 'want_connection', 'want_coffee_company'
];

// Get similar lifestyle interests between two users
const getSimilarLifestyle = (userInterests: string[] | null, profileInterests: string[] | null) => {
  if (!userInterests || !profileInterests) return [];
  
  const userLifestyle = userInterests.filter(i => 
    lifestyleInterestIds.some(id => 
      i.toLowerCase().includes(id.replace('_', ' ').toLowerCase()) || 
      i.toLowerCase().includes(id.replace('_', '-').toLowerCase())
    )
  );
  const profileLifestyle = profileInterests.filter(i => 
    lifestyleInterestIds.some(id => 
      i.toLowerCase().includes(id.replace('_', ' ').toLowerCase()) || 
      i.toLowerCase().includes(id.replace('_', '-').toLowerCase())
    )
  );

  return userLifestyle.filter(ui => 
    profileLifestyle.some(pi => 
      ui.toLowerCase() === pi.toLowerCase() || 
      ui.replace(/[^\w\s]/g, '').toLowerCase() === pi.replace(/[^\w\s]/g, '').toLowerCase()
    )
  );
};

interface MomCardWrapperProps {
  children: React.ReactNode;
  animationKey?: string | number;
}

export function MomCardWrapper({ children, animationKey }: MomCardWrapperProps) {
  return (
    <div 
      key={animationKey}
      className="animate-fade-in transition-all duration-300 ease-out"
      style={{ animationDuration: '0.4s' }}
    >
      {children}
    </div>
  );
}

export function MomCardInfo({ profile, currentUser, compact = false }: MomCardInfoProps) {
  const { getText } = useMicrocopy();
  
  const children = profile.children as any[] | null;
  const childCount = children?.length || 0;
  const similarLifestyle = currentUser ? getSimilarLifestyle(currentUser.interests, profile.interests) : [];

  // Get location text
  const locationText = profile.area 
    ? `${profile.city} · ${profile.area}` 
    : profile.city;

  // Get children ages text
  const getChildrenAges = () => {
    if (!children || children.length === 0) return null;
    return children.map(c => c.ageGroup || c.age).join(', ');
  };

  return (
    <div className={`space-y-2 ${compact ? 'text-xs' : ''} animate-fade-in`}>
      {/* 👩‍🍼 Mom of X children */}
      <div className="flex items-center gap-2">
        <span className="text-base">👩‍🍼</span>
        <span className={`font-semibold text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
          {childCount === 1 ? 'Μαμά 1 παιδιού' : `Μαμά ${childCount} παιδιών`}
        </span>
      </div>

      {/* 📍 City · Area */}
      <div className="flex items-center gap-2">
        <MapPin className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground`} />
        <span className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
          {locationText}
        </span>
      </div>

      {/* 👶 Children ages */}
      {getChildrenAges() && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">👶</span>
          <div className="flex flex-wrap gap-1">
            {children?.map((child: any, idx: number) => (
              <span 
                key={idx} 
                className={`inline-flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-full ${compact ? 'text-xs' : 'text-sm'}`}
              >
                {child.gender === 'boy' ? '👦' : child.gender === 'girl' ? '👧' : '👶'}
                {child.ageGroup || child.age}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🤍 Lifestyle chips (max 2-3) */}
      {similarLifestyle.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base">🤍</span>
          <div className="flex flex-wrap gap-1">
            {similarLifestyle.slice(0, 2).map((interest, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className={`bg-rose-100 text-rose-700 border-rose-200 ${compact ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}`}
              >
                {interest}
              </Badge>
            ))}
            {similarLifestyle.length > 2 && (
              <Badge 
                variant="outline" 
                className={`border-rose-300 text-rose-600 ${compact ? 'text-[10px] px-1.5 py-0' : 'text-xs px-2 py-0.5'}`}
              >
                +{similarLifestyle.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Bio preview component with truncation
interface MomCardBioProps {
  bio: string | null | undefined;
  profileId: string;
  maxLength?: number;
}

export function MomCardBio({ bio, profileId, maxLength = 120 }: MomCardBioProps) {
  const navigate = useNavigate();
  
  if (!bio) return null;
  
  const needsTruncation = bio.length > maxLength;
  const displayText = needsTruncation ? bio.slice(0, maxLength).trim() + '…' : bio;
  
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground leading-relaxed">
        {displayText}
      </p>
      {needsTruncation && (
        <button
          onClick={() => navigate(`/profile/${profileId}`)}
          className="text-xs text-primary font-medium hover:underline"
        >
          Περισσότερα
        </button>
      )}
    </div>
  );
}

// Micro-text component for under the card
interface MomCardMicroTextProps {
  profile: ProfileMatch;
  currentUser?: any;
}

export function MomCardMicroText({ profile, currentUser }: MomCardMicroTextProps) {
  const { getText } = useMicrocopy();
  
  // Determine which micro-text to show based on match qualities
  const hasSameStage = typeof profile.ageMatchScore === "number" && profile.ageMatchScore >= 80;
  const hasLocationBoost = profile.isSameCity || profile.isSameArea;
  const hasLifestyle = (profile.lifestyleMatchCount || 0) > 0;

  // Priority: combined message > same stage > location + lifestyle
  if (hasLocationBoost && hasLifestyle) {
    return (
      <p className="text-xs text-center text-muted-foreground italic mt-2">
        {getText("microtext_combined", "Κοντά σου & παρόμοια καθημερινότητα 🤍")}
      </p>
    );
  }
  
  if (hasSameStage) {
    return (
      <p className="text-xs text-center text-muted-foreground italic mt-2">
        {getText("microtext_same_stage", "Στο ίδιο στάδιο με εσένα 🤍")}
      </p>
    );
  }

  if (profile.matchPercentage && profile.matchPercentage >= 70) {
    return (
      <p className="text-xs text-center text-muted-foreground italic mt-2">
        {getText("microtext_high_match", "Ίδιες μικρές προκλήσεις, ίδιες χαρές ✨")}
      </p>
    );
  }

  return null;
}

export default MomCardInfo;
