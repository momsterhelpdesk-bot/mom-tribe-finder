import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hapticFeedback } from "@/hooks/use-haptic";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface ReactionCounts {
  [key: string]: number;
}

interface QuestionReactionsProps {
  questionId: string;
}

// Reaction categories with pastel colors
const REACTIONS = [
  // Understanding - soft pink/nude
  { type: 'same', emoji: '🤍', label_el: 'Το ζω κι εγώ', label_en: 'Same here', category: 'understanding' },
  { type: 'not_alone', emoji: '🤍', label_el: 'Δεν είσαι μόνη', label_en: "You're not alone", category: 'understanding' },
  // Feeling - soft purple
  { type: 'feel_you', emoji: '🫂', label_el: 'Σε νιώθω', label_en: 'I feel you', category: 'feeling' },
  { type: 'understand', emoji: '🌷', label_el: 'Σε καταλαβαίνω', label_en: 'I understand', category: 'feeling' },
  // Presence - soft mint
  { type: 'here', emoji: '🌷', label_el: 'Είμαι εδώ', label_en: "I'm here", category: 'presence' },
  // Encouragement - soft lilac
  { type: 'strength', emoji: '✨', label_el: 'Έχεις δύναμη', label_en: 'You got this', category: 'encouragement' },
  { type: 'pass', emoji: '✨', label_el: 'Θα περάσει', label_en: 'This will pass', category: 'encouragement' },
  // Words - soft beige
  { type: 'courage', emoji: '💬', label_el: 'Κουράγιο μαμά', label_en: 'Courage mama', category: 'words' },
];

// Small icon-only reactions
const SMALL_REACTIONS = [
  { type: 'heart', emoji: '❤️' },
  { type: 'hug', emoji: '🫂' },
];

// Category colors (pastel HSL values)
const categoryColors = {
  understanding: {
    bg: 'bg-[hsl(340,60%,95%)]',
    bgActive: 'bg-[hsl(340,60%,88%)]',
    text: 'text-[hsl(340,40%,45%)]',
  },
  feeling: {
    bg: 'bg-[hsl(280,50%,95%)]',
    bgActive: 'bg-[hsl(280,50%,88%)]',
    text: 'text-[hsl(280,40%,45%)]',
  },
  presence: {
    bg: 'bg-[hsl(150,40%,93%)]',
    bgActive: 'bg-[hsl(150,40%,85%)]',
    text: 'text-[hsl(150,35%,40%)]',
  },
  encouragement: {
    bg: 'bg-[hsl(270,45%,94%)]',
    bgActive: 'bg-[hsl(270,45%,87%)]',
    text: 'text-[hsl(270,35%,45%)]',
  },
  words: {
    bg: 'bg-[hsl(30,40%,93%)]',
    bgActive: 'bg-[hsl(30,40%,85%)]',
    text: 'text-[hsl(30,35%,40%)]',
  },
};

export default function QuestionReactions({ questionId }: QuestionReactionsProps) {
  const { language } = useLanguage();
  const [counts, setCounts] = useState<ReactionCounts>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [questionId]);

  const fetchReactions = async () => {
    const { data: allReactions, error } = await supabase
      .from('question_reactions')
      .select('reaction_type, user_id')
      .eq('question_id', questionId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    if (allReactions) {
      const newCounts: ReactionCounts = {};
      allReactions.forEach(r => {
        newCounts[r.reaction_type] = (newCounts[r.reaction_type] || 0) + 1;
      });
      setCounts(newCounts);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userReacted = allReactions
          .filter(r => r.user_id === user.id)
          .map(r => r.reaction_type);
        setUserReactions(new Set(userReacted));
      }
    }
  };

  const handleReaction = async (reactionType: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hasReacted = userReactions.has(reactionType);

    if (hasReacted) {
      await supabase
        .from('question_reactions')
        .delete()
        .eq('question_id', questionId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType);

      setUserReactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(reactionType);
        return newSet;
      });
      setCounts(prev => ({ ...prev, [reactionType]: (prev[reactionType] || 1) - 1 }));
    } else {
      await supabase
        .from('question_reactions')
        .insert({
          question_id: questionId,
          user_id: user.id,
          reaction_type: reactionType
        });

      setUserReactions(prev => new Set([...prev, reactionType]));
      setCounts(prev => ({ ...prev, [reactionType]: (prev[reactionType] || 0) + 1 }));
      
      hapticFeedback.light();
      setAnimating(reactionType);
      setTimeout(() => setAnimating(null), 600);
    }
  };

  return (
    <div className="space-y-3">
      {/* Main reaction buttons - 2 columns grid */}
      <div className="grid grid-cols-2 gap-2">
        {REACTIONS.map((reaction) => {
          const isActive = userReactions.has(reaction.type);
          const isAnimating = animating === reaction.type;
          const count = counts[reaction.type] || 0;
          const colors = categoryColors[reaction.category as keyof typeof categoryColors];
          
          return (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-full",
                "text-xs font-medium transition-all duration-300 ease-out",
                "border border-transparent",
                isActive 
                  ? `${colors.bgActive} ${colors.text} shadow-sm scale-[1.02]` 
                  : `${colors.bg} ${colors.text} hover:${colors.bgActive} hover:scale-[1.01]`,
                isAnimating && "animate-pulse scale-105"
              )}
            >
              <span className={cn(
                "text-base transition-transform duration-300",
                isAnimating && "scale-125"
              )}>
                {reaction.emoji}
              </span>
              <span className="truncate">
                {language === 'el' ? reaction.label_el : reaction.label_en}
              </span>
              {count > 0 && (
                <span className={cn(
                  "text-[10px] font-bold ml-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full",
                  isActive ? "bg-white/50" : "bg-white/30"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      
      {/* Small icon-only reactions */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {SMALL_REACTIONS.map((reaction) => {
          const isActive = userReactions.has(reaction.type);
          const isAnimating = animating === reaction.type;
          const count = counts[reaction.type] || 0;
          
          return (
            <button
              key={reaction.type}
              onClick={() => handleReaction(reaction.type)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                "text-sm transition-all duration-300 ease-out",
                isActive 
                  ? "bg-primary/20 scale-105" 
                  : "bg-muted/50 hover:bg-muted",
                isAnimating && "animate-bounce"
              )}
            >
              <span className={cn(
                "transition-transform duration-300",
                isAnimating && "scale-150"
              )}>
                {reaction.emoji}
              </span>
              {count > 0 && (
                <span className="text-[10px] font-bold text-muted-foreground">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
