import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, X, Lightbulb, ChefHat, Calendar } from "lucide-react";
import { useMascot } from "@/hooks/use-mascot";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";
import ThisOrThat from "@/components/ThisOrThat";
import MagicMatching from "@/components/MagicMatching";
import SilentHug from "@/components/SilentHug";
import NightMode from "@/components/NightMode";
import { useNightMode } from "@/hooks/use-night-mode";
import { supabase } from "@/integrations/supabase/client";

const MOODS = [
  { emoji: "😊", value: "positive", label: "Happy" },
  { emoji: "😐", value: "neutral", label: "Neutral" },
  { emoji: "😔", value: "sad", label: "Sad" },
  { emoji: "😫", value: "overwhelmed", label: "Overwhelmed" },
  { emoji: "😴", value: "tired", label: "Tired" },
];

const MOOD_QUOTES = {
  positive: {
    en: [
      "You're glowing today — keep that light moving.",
      "Small joy counts too — it all adds up.",
      "Today is a page you're writing beautifully.",
      "Pause, smile, store the moment.",
      "Your heart is doing a beautiful job.",
    ],
    el: [
      "Λάμπεις σήμερα — κράτα το φως σε κίνηση.",
      "Και η μικρή χαρά μετράει — στο τέλος τα φτιάχνει όλα.",
      "Σήμερα γράφεις μια όμορφη σελίδα.",
      "Στάσου, χαμογέλα, φύλαξε τη στιγμή.",
      "Η καρδιά σου κάνει υπέροχη δουλειά.",
    ],
  },
  neutral: {
    en: [
      "It's okay to feel 'just fine.' Not every day is a highlight.",
      "One small win changes the whole tone — pick one.",
      "Gentle progress counts too.",
      "Your spark is still here — maybe today it whispers.",
      "Slow is still moving.",
    ],
    el: [
      "Είναι εντάξει να νιώθεις 'απλά καλά'. Δεν είναι όλες οι μέρες κορυφές.",
      "Ένα μικρό κέρδος αλλάζει όλο τον τόνο — διάλεξε ένα.",
      "Και η ήπια πρόοδος είναι πρόοδος.",
      "Η σπίθα σου είναι εδώ — ίσως σήμερα ψιθυρίζει.",
      "Αργά σημαίνει ακόμα μπροστά.",
    ],
  },
  sad: {
    en: [
      "You're not weak — you're carrying so much with love.",
      "It's safe to feel — not every tear means defeat.",
      "Some days are heavy — not because you failed, but because you care.",
      "You don't have to be okay to be worthy.",
      "Hold on — the soft dawn always returns.",
    ],
    el: [
      "Δεν είσαι αδύναμη — κουβαλάς τόσα με αγάπη.",
      "Είναι ασφαλές να νιώθεις — τα δάκρυα δεν είναι ήττα.",
      "Μερικές μέρες είναι βαριές — όχι από αποτυχία, αλλά από νοιάξιμο.",
      "Δεν χρειάζεται να είσαι καλά για να αξίζεις.",
      "Κράτα λίγο ακόμα — η απαλή αυγή πάντα επιστρέφει.",
    ],
  },
  overwhelmed: {
    en: [
      "One breath. One pause. One tiny next step.",
      "You're not 'behind' — you're surviving a heavy chapter.",
      "You're allowed to simplify — everything doesn't need your 100%.",
      "Drop one thing — not your peace.",
      "Your best today might look different — and that's still enough.",
    ],
    el: [
      "Μία ανάσα. Μία παύση. Ένα μικρό επόμενο βήμα.",
      "Δεν μένεις πίσω — απλά διαχειρίζεσαι ένα δύσκολο κεφάλαιο.",
      "Σου επιτρέπεται να απλοποιείς — δεν χρειάζεται να δίνεις πάντα το 100%.",
      "Άφησε κάτι κάτω — όχι την ηρεμία σου.",
      "Το καλύτερό σου σήμερα μπορεί να φαίνεται αλλιώς — και αυτό αρκεί.",
    ],
  },
  tired: {
    en: [
      "Rest is productive too — your body is your home.",
      "Even batteries recharge — you deserve that, too.",
      "The world can wait — your breath can't.",
      "Closing your eyes for a moment counts.",
      "Slow days protect you, not hold you back.",
    ],
    el: [
      "Η ξεκούραση είναι παραγωγική — το σώμα σου είναι το σπίτι σου.",
      "Ακόμα και οι μπαταρίες φορτίζουν — κι εσύ το ίδιο αξίζεις.",
      "Ο κόσμος μπορεί να περιμένει — η ανάσα σου όχι.",
      "Το να κλείσεις τα μάτια για λίγο μετράει.",
      "Οι αργές μέρες σε προστατεύουν — δεν σε κρατούν πίσω.",
    ],
  },
};

const DAILY_QUOTES = {
  en: [
    "You're not behind. Your journey has a different rhythm.",
    "Done is better than perfect — especially today.",
    "Your children see your love, not your to-do list.",
    "It's okay to rest before you're completely empty.",
  ],
  el: [
    "Δεν υπάρχουν 'σωστές μέρες'. Υπάρχουν μόνο μέρες που τα κατάφερες.",
    "Το «έτσι κι έτσι» είναι καλύτερο από το «τέλειο» — ειδικά σήμερα.",
    "Τα παιδιά σου βλέπουν την αγάπη σου, όχι τη λίστα σου.",
    "Είναι εντάξει να ξεκουραστείς πριν αδειάσεις εντελώς.",
  ],
};

const SELF_CARE_TIPS = {
  en: [
    "Drink 3 sips of water right now.",
    "Take 3 deep breaths with closed eyes.",
    "Stretch your shoulders back for 5 seconds.",
    "Look away from the screen for 20 seconds.",
    "Say one kind thing to yourself out loud.",
    "Stand up and shake your body for 10 seconds.",
  ],
  el: [
    "Πιες 3 γουλιές νερό τώρα.",
    "Πάρε 3 βαθιές αναπνοές με κλειστά μάτια.",
    "Τέντωσε τους ώμους σου πίσω για 5 δευτερόλεπτα.",
    "Κοίτα μακριά από την οθόνη για 20 δευτερόλεπτα.",
    "Πες ένα καλό λόγο για τον εαυτό σου δυνατά.",
    "Σήκω όρθια και κούνησε το σώμα σου για 10 δευτερόλεπτα.",
  ],
};

const DID_YOU_KNOW_FACTS = {
  en: [
    "A baby's sense of smell is fully developed at birth and can recognize their mother's scent within days.",
    "Babies are born with 300 bones, but adults have only 206 — some bones fuse together as they grow.",
    "Newborns can only see about 8-12 inches away — just the distance to their parent's face while feeding.",
    "A mother's voice has been shown to reduce pain in newborns during medical procedures.",
    "Children laugh about 300 times a day, while adults only laugh about 20 times.",
    "Babies' first smiles (around 6-8 weeks) are genuine social responses, not just reflexes.",
    "The bond between mother and baby releases oxytocin — the 'love hormone' — in both.",
  ],
  el: [
    "Η όσφρηση του μωρού είναι πλήρως ανεπτυγμένη από τη γέννηση και αναγνωρίζει τη μυρωδιά της μητέρας του σε λίγες μέρες.",
    "Τα μωρά γεννιούνται με 300 οστά, ενώ οι ενήλικες έχουν μόνο 206 — κάποια οστά συγχωνεύονται καθώς μεγαλώνουν.",
    "Τα νεογέννητα βλέπουν μόνο σε απόσταση 8-12 ίντσες — ακριβώς όσο το πρόσωπο της μητέρας όταν τρώνε.",
    "Η φωνή της μητέρας μειώνει τον πόνο στα νεογέννητα κατά τη διάρκεια ιατρικών διαδικασιών.",
    "Τα παιδιά γελούν περίπου 300 φορές τη μέρα, ενώ οι ενήλικες μόνο 20.",
    "Τα πρώτα γνήσια χαμόγελα των μωρών (γύρω στις 6-8 εβδομάδες) είναι κοινωνικές αντιδράσεις, όχι απλά αντανακλαστικά.",
    "Ο δεσμός μητέρας-μωρού απελευθερώνει οξυτοκίνη — την 'ορμόνη της αγάπης' — και στους δύο.",
  ],
};

// Helper function to get deterministic daily index
const getDailyIndex = (arrayLength: number, offset: number = 0): number => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return (dayOfYear + offset) % arrayLength;
};

export default function DailyBoost() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodQuote, setMoodQuote] = useState<string>("");
  const [currentMoodQuoteIndex, setCurrentMoodQuoteIndex] = useState(0);
  const { mascotConfig, visible, showMascot, hideMascot } = useMascot();
  const [showHearts, setShowHearts] = useState(false);
  const { isNightTime } = useNightMode();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetchProfileAndShowWelcome();
  }, []);

  const fetchProfileAndShowWelcome = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("username, full_name, welcome_popup_shown")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
        
        // Show welcome popup only once - tied to user account, not device
        if (!data.welcome_popup_shown) {
          // Mark as shown in database FIRST to prevent repeat showing
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ welcome_popup_shown: true })
            .eq("id", user.id);
          
          if (updateError) {
            console.error("Failed to update welcome_popup_shown:", updateError);
            return; // Don't show popup if we can't mark it as shown
          }
          
          showMascot({
            state: "happy",
            message: language === 'el' 
              ? "Καλώς ήρθες στο Momster! 🌸\nΗ τέλεια κοινότητα για μαμάδες σαν κι εσένα.\nΠάμε να βρούμε το επόμενο match σου; ✨" 
              : "Welcome to Momster! 🌸\nThe perfect community for moms like you.\nLet's find your next match! ✨",
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  // Get daily deterministic content (changes once per day)
  const dailyQuote = DAILY_QUOTES[language][getDailyIndex(DAILY_QUOTES[language].length)];
  const selfCareTip = SELF_CARE_TIPS[language][getDailyIndex(SELF_CARE_TIPS[language].length, 7)];
  const didYouKnowFact = DID_YOU_KNOW_FACTS[language][getDailyIndex(DID_YOU_KNOW_FACTS[language].length, 14)];

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
    const quotes = MOOD_QUOTES[moodValue as keyof typeof MOOD_QUOTES][language];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    setCurrentMoodQuoteIndex(randomIndex);
    setMoodQuote(randomQuote);
    
    setShowHearts(true);
    showMascot({
      state: "happy",
      message: randomQuote,
      duration: 3000,
    });
    
    setTimeout(() => {
      setShowHearts(false);
    }, 3000);
  };

  const handleNextQuote = () => {
    if (!selectedMood) return;
    const quotes = MOOD_QUOTES[selectedMood as keyof typeof MOOD_QUOTES][language];
    let newIndex = Math.floor(Math.random() * quotes.length);
    while (newIndex === currentMoodQuoteIndex && quotes.length > 1) {
      newIndex = Math.floor(Math.random() * quotes.length);
    }
    setCurrentMoodQuoteIndex(newIndex);
    setMoodQuote(quotes[newIndex]);
    
    showMascot({
      state: "happy",
      message: quotes[newIndex],
      duration: 3000,
    });
  };

  const handleShareQuote = () => {
    if (!moodQuote) return;
    
    if (navigator.share) {
      navigator.share({
        title: language === 'el' ? 'Daily Boost από Momster' : 'Daily Boost from Momster',
        text: `"${moodQuote}"`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`"${moodQuote}"`);
      showMascot({
        state: "happy",
        message: language === 'el' ? 'Αντιγράφηκε! 📋' : 'Copied! 📋',
        duration: 1500,
      });
    }
  };

  return (
    <div 
      className="min-h-screen pt-20 pb-32 px-4 relative overflow-y-auto transition-all duration-500" 
      style={{ 
        background: isNightTime 
          ? 'linear-gradient(135deg, #1F1D2B, #2D2B3D, #1F1D2B)' 
          : 'linear-gradient(135deg, #F8E9EE, #F5E8F0, #F8E9EE)' 
      }}
    >
      {/* Animated Mascot - hide in night mode */}
      {!isNightTime && (
        <div className="fixed top-20 right-4 z-30 animate-bounce">
          <img src={mascot} alt="Momster Mascot" className="w-20 h-20 object-contain" />
        </div>
      )}
      
      {showHearts && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float-heart"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                fontSize: `${20 + Math.random() * 20}px`,
              }}
            >
              💕
            </div>
          ))}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className={`text-3xl font-bold flex items-center justify-center gap-2 ${isNightTime ? 'text-white' : 'text-foreground'}`} style={{ fontFamily: "'Pacifico', cursive" }}>
            {isNightTime ? '🌙' : ''} Hi {profile?.username || profile?.full_name || 'Username'} {isNightTime ? '' : '🌸'}
          </h1>
          <p className={`text-sm ${isNightTime ? 'text-gray-300' : 'text-muted-foreground'}`}>
            {isNightTime 
              ? (language === 'el' ? 'Δεν είσαι μόνη απόψε' : "You're not alone tonight")
              : (language === 'el' ? 'Η καθημερινή σου δόση ενέργειας' : 'Your daily dose of energy')
            }
          </p>
        </div>

        {/* Night Mode Section - Only show between 00:00-05:00 */}
        {isNightTime && (
          <div className="max-w-5xl mx-auto mb-6">
            <NightMode language={language} />
          </div>
        )}

        {/* Silent Hug Feature - Always visible but styled differently at night */}
        <div className="max-w-5xl mx-auto mb-6">
          <SilentHug language={language} />
        </div>

        {/* Quote of the Day - Full width (hide in night mode) */}
        {!isNightTime && (
        <div className="max-w-5xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-[#F3DCE5] overflow-hidden relative hover:shadow-xl transition-all rounded-[30px]">
            <div className="flex items-start gap-4">
              <div className="text-4xl">💭</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-purple-700 mb-2">
                  {language === 'el' ? 'Quote of the Day' : 'Quote of the Day'}
                </h3>
                <p className="text-purple-600 italic text-base leading-relaxed">
                  {dailyQuote}
                </p>
              </div>
            </div>
          </Card>
        </div>
        )}

        {/* How Are You Feeling Today? - Full width (hide in night mode) */}
        {!isNightTime && (
        <div className="max-w-5xl mx-auto">
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 border-[#F3DCE5] overflow-hidden relative hover:shadow-xl transition-all rounded-[30px]">
            <h3 className="text-xl font-bold text-orange-700 mb-4 text-center">
              {language === 'el' ? 'Πώς νιώθεις σήμερα;' : 'How are you feeling today?'}
            </h3>
            <div className="grid grid-cols-5 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  className={`aspect-square rounded-full bg-white/80 hover:bg-white shadow-md hover:shadow-lg transition-all hover:scale-110 flex items-center justify-center text-4xl ${
                    selectedMood === mood.value ? 'ring-4 ring-orange-400 bg-white' : ''
                  }`}
                  onClick={() => handleMoodSelect(mood.value)}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
            {selectedMood && moodQuote && (
              <div className="mt-4 p-4 bg-white/60 rounded-2xl text-center">
                <p className="text-orange-700 italic">{moodQuote}</p>
              </div>
            )}
            
            {/* Mascot at bottom right looking at emojis */}
            <img
              src={mascot}
              alt="Momster Mascot"
              className="absolute bottom-3 right-3 w-16 h-16 rounded-full object-cover"
              style={{
                opacity: 0.25,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                transform: 'rotate(-5deg)'
              }}
            />
          </Card>
        </div>
        )}

        {/* 2x2 Grid Layout with generous spacing (hide in night mode) */}
        {!isNightTime && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Mom Meets Banner - FIRST */}
          <Link to="/mom-meets">
            <Card className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 border-[#F3DCE5] overflow-hidden relative hover:shadow-xl transition-all cursor-pointer group rounded-[30px] h-full">
              <div className="relative space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-rose-700 group-hover:scale-110 transition-transform" />
                  <h2 className="text-xl font-bold text-rose-700">
                    🏡 Mom Meets
                  </h2>
                </div>
                <p className="text-sm text-rose-600 font-medium">
                  The village in action 🤍
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-rose-200/60 text-rose-700 px-2 py-1 rounded-full">
                    👩‍👦 Community Meets
                  </span>
                  <span className="text-xs bg-purple-200/60 text-purple-700 px-2 py-1 rounded-full">
                    ✨ Official Meets
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Momster Ταπεράκι - SECOND */}
          <Link to="/recipes">
            <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-[#F3DCE5] hover:shadow-xl transition-all cursor-pointer group rounded-[30px] h-full">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChefHat className="w-6 h-6 text-rose-700 group-hover:scale-110 transition-transform" />
                  <h2 className="text-xl font-bold text-rose-700">
                    🧀 Momster Ταπεράκι
                  </h2>
                </div>
                <p className="text-sm text-rose-600">
                  {language === 'el' 
                    ? 'Υγιεινές συνταγές για μικρά χεράκια' 
                    : 'Healthy recipes for little hands'}
                </p>
              </div>
            </Card>
          </Link>

          {/* Magic Matching - THIRD */}
          <MagicMatching />

          {/* Did You Know Section - FOURTH */}
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-[#F3DCE5] overflow-hidden relative hover:shadow-xl transition-all rounded-[30px]">
            <div className="relative space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-blue-700" />
                <h2 className="text-xl font-bold text-blue-700">
                  {language === 'el' ? 'Ήξερες ότι;' : 'Did You Know?'}
                </h2>
              </div>
              <p className="text-sm text-blue-600 leading-relaxed">
                {didYouKnowFact}
              </p>
            </div>
          </Card>
        </div>
        )}

        {/* This or That - Full width below grid (hide in night mode) */}
        {!isNightTime && (
        <div className="max-w-5xl mx-auto mt-8">
          <ThisOrThat />
        </div>
        )}
      </div>

      {/* Mascot Modal */}
      {mascotConfig && visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 shadow-xl animate-scale-in relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full"
              onClick={hideMascot}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <img
                  src={mascot}
                  alt="Momster Mascot"
                  className={`w-24 h-24 object-contain ${
                    mascotConfig.state === 'happy' ? 'animate-bounce' : 
                    mascotConfig.state === 'searching' ? 'animate-pulse' : ''
                  }`}
                />
                <span className="absolute -top-2 -right-2 text-3xl animate-bounce">
                  {mascotConfig.state === 'happy' ? '💖' : 
                   mascotConfig.state === 'searching' ? '🔍' : '☕'}
                </span>
              </div>
              
              <p className="text-lg font-medium text-foreground leading-relaxed">
                {mascotConfig.message}
              </p>

              {mascotConfig.showButton && mascotConfig.buttonText && (
                <Button
                  onClick={() => {
                    hideMascot();
                    mascotConfig.onButtonClick?.();
                  }}
                  className="w-full"
                  size="lg"
                >
                  {mascotConfig.buttonText}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
      
      {/* Footer with Premium Message - styled for night mode */}
      <footer className={`fixed bottom-24 left-0 right-0 py-3 px-4 backdrop-blur-md border-t transition-all duration-500 ${
        isNightTime 
          ? 'bg-[#1F1D2B]/95 border-[#3D3B4D]' 
          : 'bg-[#F8E9EE]/95 border-[#F3DCE5]'
      }`}>
        <div className="max-w-7xl mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
            <span className={`text-sm font-medium ${isNightTime ? 'text-gray-200' : 'text-foreground'}`}>
              {isNightTime 
                ? (language === 'el' ? 'Κάποια άλλη είναι ξύπνια μαζί σου 💜' : "Someone else is awake with you 💜")
                : (language === 'el' ? 'Μαζί, οι μαμάδες ανθίζουν!' : 'Together, moms thrive!')
              }
            </span>
          </div>
          {!isNightTime && (
            <p className="text-xs text-muted-foreground">
              *Momster Perks — free for now, Premium later.
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
