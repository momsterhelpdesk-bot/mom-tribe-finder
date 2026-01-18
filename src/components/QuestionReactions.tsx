import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { hapticFeedback } from "@/hooks/use-haptic";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReactionCounts {
  thanks: number;
  same: number;
  hug: number;
}

interface QuestionReactionsProps {
  questionId: string;
}

const getReactions = (language: 'el' | 'en') => [
  { 
    type: 'thanks' as const, 
    emoji: '❤️', 
    tooltip: language === 'el' ? 'Ευχαριστώ για τη βοήθεια!' : 'Thanks for the help!', 
    label: language === 'el' ? 'Ευχαριστώ' : 'Thanks' 
  },
  { 
    type: 'same' as const, 
    emoji: '🙋‍♀️', 
    tooltip: language === 'el' ? 'Κι εγώ το περνάω αυτό!' : 'I\'m going through this too!', 
    label: language === 'el' ? 'Κι εγώ' : 'Same here' 
  },
  { 
    type: 'hug' as const, 
    emoji: '🫂', 
    tooltip: language === 'el' ? 'Σου στέλνω αγκαλιά 🤗' : 'Sending you a hug 🤗', 
    label: language === 'el' ? 'Αγκαλιά' : 'Virtual hug' 
  },
];

export default function QuestionReactions({ questionId }: QuestionReactionsProps) {
  const { language } = useLanguage();
  const REACTIONS = getReactions(language);
  const [counts, setCounts] = useState<ReactionCounts>({ thanks: 0, same: 0, hug: 0 });
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState<string | null>(null);

  useEffect(() => {
    fetchReactions();
  }, [questionId]);

  const fetchReactions = async () => {
    // Fetch reaction counts
    const { data: allReactions, error } = await supabase
      .from('question_reactions')
      .select('reaction_type, user_id')
      .eq('question_id', questionId);

    if (error) {
      console.error('Error fetching reactions:', error);
      return;
    }

    if (allReactions) {
      const newCounts: ReactionCounts = { thanks: 0, same: 0, hug: 0 };
      allReactions.forEach(r => {
        if (r.reaction_type in newCounts) {
          newCounts[r.reaction_type as keyof ReactionCounts]++;
        }
      });
      setCounts(newCounts);

      // Check user's reactions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userReacted = allReactions
          .filter(r => r.user_id === user.id)
          .map(r => r.reaction_type);
        setUserReactions(new Set(userReacted));
      }
    }
  };

  const handleReaction = async (reactionType: 'thanks' | 'same' | 'hug') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const hasReacted = userReactions.has(reactionType);

    if (hasReacted) {
      // Remove reaction
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
      setCounts(prev => ({ ...prev, [reactionType]: prev[reactionType] - 1 }));
    } else {
      // Add reaction
      await supabase
        .from('question_reactions')
        .insert({
          question_id: questionId,
          user_id: user.id,
          reaction_type: reactionType
        });

      setUserReactions(prev => new Set([...prev, reactionType]));
      setCounts(prev => ({ ...prev, [reactionType]: prev[reactionType] + 1 }));
      
      // Haptic + animate
      hapticFeedback.light();
      setAnimating(reactionType);
      setTimeout(() => setAnimating(null), 600);
    }
  };

  const sameCount = counts.same;
  const hugCount = counts.hug;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5">
        {REACTIONS.map((reaction) => {
          const isActive = userReactions.has(reaction.type);
          const isAnimating = animating === reaction.type;
          const count = counts[reaction.type];
          
          return (
            <Tooltip key={reaction.type}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => handleReaction(reaction.type)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                    transition-all duration-200 hover:scale-105
                    ${isActive 
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30' 
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                    }
                  `}
                >
                  <span className={`text-base ${isAnimating ? 'animate-bounce' : ''}`}>
                    {reaction.emoji}
                  </span>
                  <span className="text-[11px] font-medium">
                    {reaction.label}
                  </span>
                  {count > 0 && (
                    <span className={`text-[10px] font-bold ml-0.5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                      {count}
                    </span>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="top" 
                className="bg-white/95 border-pink-200 text-foreground shadow-lg rounded-lg px-2 py-1"
              >
                <p className="text-xs">{reaction.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
