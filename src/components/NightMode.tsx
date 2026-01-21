import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useHaptic } from "@/hooks/use-haptic";
import mascotSleepy from "@/assets/mascot-sleepy.png";
import { Moon, Baby, Sparkles, Users, ChefHat, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnlineMom {
  id: string;
  username?: string | null;
  full_name: string;
  city?: string | null;
  children?: any;
}

interface NightModeProps {
  language: 'el' | 'en';
}

// Baby phase tags with Greek/English labels
const BABY_PHASES = {
  newborn: { el: 'Νεογέννητο', en: 'Newborn', emoji: '👶' },
  teething: { el: 'Δόντια', en: 'Teething', emoji: '🦷' },
  growth_spurt: { el: 'Άλμα ανάπτυξης', en: 'Growth spurt', emoji: '📈' },
  sleep_regression: { el: 'Παλινδρόμηση ύπνου', en: 'Sleep regression', emoji: '😵‍💫' },
  night_feeding: { el: 'Νυχτερινό τάισμα', en: 'Night feeding', emoji: '🍼' },
};

// Get baby phase based on children's ages
const getBabyPhase = (children: any[]): keyof typeof BABY_PHASES | null => {
  if (!children || children.length === 0) return null;
  
  for (const child of children) {
    const age = child.age;
    if (age === '0-3_months') return 'newborn';
    if (age === '4-6_months' || age === '7-9_months') return 'teething';
    if (age === '10-12_months') return 'growth_spurt';
    if (age === '1_year' || age === '2_years') return 'sleep_regression';
  }
  return 'night_feeding';
};

export default function NightMode({ language }: NightModeProps) {
  const [onlineMoms, setOnlineMoms] = useState<OnlineMom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const { triggerHaptic } = useHaptic();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOnlineMoms();
    const interval = setInterval(fetchOnlineMoms, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchOnlineMoms = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get users active in the last 15 minutes
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      
      const { data: activeUsers } = await supabase
        .from('user_activity')
        .select('user_id')
        .gt('last_activity_at', fifteenMinsAgo)
        .neq('user_id', user.id);

      if (!activeUsers || activeUsers.length === 0) {
        setOnlineMoms([]);
        setIsLoading(false);
        return;
      }

      const activeUserIds = activeUsers.map(u => u.user_id);

      // Get profiles of active users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, city, children')
        .in('id', activeUserIds)
        .eq('profile_completed', true)
        .limit(10);

      setOnlineMoms(profiles || []);
    } catch (error) {
      console.error('Error fetching online moms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = (reaction: string) => {
    setSelectedReaction(reaction);
    triggerHaptic('light');
    
    // Reset after animation
    setTimeout(() => setSelectedReaction(null), 1500);
  };

  const reactions = [
    { emoji: '🫂', label: language === 'el' ? 'Αγκαλιά' : 'Hug' },
    { emoji: '😵‍💫', label: language === 'el' ? 'Κι εγώ...' : 'Me too...' },
    { emoji: '💪', label: language === 'el' ? 'Αντέχεις' : "You've got this" },
  ];

  return (
    <div className="space-y-4">
      {/* Night Mode Header */}
      <Card className="p-6 bg-gradient-to-br from-[#2D2B3D] to-[#1F1D2B] border-[#3D3B4D] rounded-[24px] shadow-xl relative overflow-hidden">
        {/* Stars decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `pulse ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="flex items-start gap-4 relative z-10">
          {/* Sleepy mascot */}
          <div className="relative shrink-0">
            <img
              src={mascotSleepy}
              alt="Sleepy Momster"
              className="w-16 h-16 object-contain"
              style={{
                animation: 'float 5s ease-in-out infinite',
              }}
            />
            <Moon className="absolute -top-1 -right-1 w-5 h-5 text-yellow-300 animate-pulse" />
          </div>

          <div className="flex-1 space-y-1">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-xl">🌙</span>
              {language === 'el' 
                ? 'Αν είσαι ξύπνια τώρα...' 
                : "If you're awake now..."}
            </h2>
            <p className="text-sm text-gray-300">
              {language === 'el' 
                ? 'Δεν είσαι μόνη.' 
                : "You're not alone."}
            </p>
          </div>
        </div>
      </Card>

      {/* Online Moms List */}
      <Card className="p-4 bg-gradient-to-br from-[#2D2B3D] to-[#252435] border-[#3D3B4D] rounded-[20px]">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm text-gray-300">
            {language === 'el' 
              ? `${onlineMoms.length} μαμάδες ξύπνιες τώρα` 
              : `${onlineMoms.length} moms awake now`}
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
          </div>
        ) : onlineMoms.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-gray-400 text-sm">
              {language === 'el' 
                ? 'Φαίνεται ήσυχα απόψε...' 
                : "It seems quiet tonight..."}
            </p>
            <p className="text-gray-500 text-xs">
              {language === 'el' 
                ? 'Αλλά η Momster είναι εδώ 💜' 
                : "But Momster is here 💜"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {onlineMoms.slice(0, 5).map((mom) => {
              const phase = getBabyPhase(mom.children as any[]);
              const phaseInfo = phase ? BABY_PHASES[phase] : null;
              
              return (
                <div 
                  key={mom.id}
                  className="flex items-center justify-between p-3 bg-[#1F1D2B]/50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C8788D]/30 to-[#A66B7D]/30 flex items-center justify-center">
                      <Baby className="w-4 h-4 text-[#C8788D]" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {mom.username || mom.full_name?.split(' ')[0] || 'Μαμά'}
                      </p>
                      {mom.city && (
                        <p className="text-gray-400 text-xs">{mom.city}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Baby phase tag */}
                  {phaseInfo && (
                    <span className="text-xs px-2 py-1 rounded-full bg-[#3D3B4D] text-gray-300 flex items-center gap-1">
                      <span>{phaseInfo.emoji}</span>
                      <span>{phaseInfo[language]}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Quick Reactions */}
      <Card className="p-4 bg-gradient-to-br from-[#2D2B3D] to-[#252435] border-[#3D3B4D] rounded-[20px]">
        <p className="text-center text-gray-400 text-sm mb-3">
          {language === 'el' ? 'Στείλε μια αγκαλιά' : 'Send some love'}
        </p>
        <div className="flex justify-center gap-3">
          {reactions.map((reaction) => (
            <Button
              key={reaction.emoji}
              variant="ghost"
              onClick={() => handleReaction(reaction.emoji)}
              className={`flex flex-col items-center gap-1 p-3 h-auto rounded-xl transition-all ${
                selectedReaction === reaction.emoji 
                  ? 'bg-[#C8788D]/20 scale-110' 
                  : 'bg-[#1F1D2B]/50 hover:bg-[#3D3B4D]'
              }`}
            >
              <span className={`text-2xl ${selectedReaction === reaction.emoji ? 'animate-bounce' : ''}`}>
                {reaction.emoji}
              </span>
              <span className="text-[10px] text-gray-400">{reaction.label}</span>
            </Button>
          ))}
        </div>
        
        {selectedReaction && (
          <p className="text-center text-[#C8788D] text-sm mt-3 animate-fade-in">
            {language === 'el' ? 'Στάλθηκε στις μαμάδες που είναι ξύπνιες 💜' : 'Sent to moms who are awake 💜'}
          </p>
        )}
      </Card>

      {/* Night Mode Quick Access Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Mom Meets Card */}
        <Card 
          className="p-4 bg-gradient-to-br from-[#3D2B3D] to-[#2D1F2D] border-[#4D3B4D] rounded-[16px] cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
          onClick={() => {
            triggerHaptic('light');
            navigate('/mom-meets');
          }}
        >
          <div className="absolute top-2 right-2 opacity-20">
            <Users className="w-12 h-12 text-pink-300" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤝</span>
              <h3 className="text-sm font-medium text-white">Mom Meets</h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {language === 'el' 
                ? 'Βρες μαμάδες κοντά σου για καφέ ή βόλτα' 
                : 'Find moms nearby for coffee or walks'}
            </p>
            <div className="flex items-center gap-1 text-[#C8788D] text-xs">
              <span>{language === 'el' ? 'Δες περισσότερα' : 'See more'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Card>

        {/* Ταπεράκι Card */}
        <Card 
          className="p-4 bg-gradient-to-br from-[#3D3525] to-[#2D2820] border-[#4D4535] rounded-[16px] cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden"
          onClick={() => {
            triggerHaptic('light');
            navigate('/recipes');
          }}
        >
          <div className="absolute top-2 right-2 opacity-20">
            <ChefHat className="w-12 h-12 text-amber-300" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍲</span>
              <h3 className="text-sm font-medium text-white">
                {language === 'el' ? 'Ταπεράκι' : 'Recipes'}
              </h3>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              {language === 'el' 
                ? 'Συνταγές για το σχολείο αύριο 🌙' 
                : 'Recipes for school tomorrow 🌙'}
            </p>
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              <span>{language === 'el' ? 'Δες συνταγές' : 'See recipes'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
