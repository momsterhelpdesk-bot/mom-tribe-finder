import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, X, Lightbulb, ChefHat } from "lucide-react";
import { useMascot } from "@/hooks/use-mascot";
import MomsterMascot from "@/components/MomsterMascot";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";

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

export default function DailyBoost() {
  const { language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodQuote, setMoodQuote] = useState<string>("");
  const [currentMoodQuoteIndex, setCurrentMoodQuoteIndex] = useState(0);
  const { mascotConfig, visible, showMascot, hideMascot } = useMascot();
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    // Show welcome mascot when page loads
    showMascot({
      state: "happy",
      message: language === 'el' 
        ? "Γεια σου όμορφη! Πάρε τη δόση ενέργειας σου 💕" 
        : "Hello beautiful! Get your energy boost 💕",
      duration: 2500,
    });
  }, []);

  const dailyQuote = DAILY_QUOTES[language][Math.floor(Math.random() * DAILY_QUOTES[language].length)];
  const selfCareTip = SELF_CARE_TIPS[language][Math.floor(Math.random() * SELF_CARE_TIPS[language].length)];
  const didYouKnowFact = DID_YOU_KNOW_FACTS[language][Math.floor(Math.random() * DID_YOU_KNOW_FACTS[language].length)];

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
    const quotes = MOOD_QUOTES[moodValue as keyof typeof MOOD_QUOTES][language];
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    setCurrentMoodQuoteIndex(randomIndex);
    setMoodQuote(randomQuote);
    
    // Show mascot with hearts
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
    
    // Show mascot with new quote
    showMascot({
      state: "happy",
      message: quotes[newIndex],
      duration: 3000,
    });
  };

  const handleShareQuote = () => {
    if (!moodQuote) return;
    
    // Check if Web Share API is available
    if (navigator.share) {
      navigator.share({
        title: language === 'el' ? 'Daily Boost από Momster' : 'Daily Boost from Momster',
        text: `"${moodQuote}"`,
      }).catch(() => {
        // User cancelled share
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`"${moodQuote}"`);
      showMascot({
        state: "happy",
        message: language === 'el' ? 'Αντιγράφηκε! 📋' : 'Copied! 📋',
        duration: 1500,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-24 px-4 relative">
      {/* Animated Mascot at top */}
      <div className="fixed top-20 right-4 z-30 animate-bounce">
        <img src={mascot} alt="Momster Mascot" className="w-20 h-20 object-contain" />
      </div>
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
      
      <div className="flex gap-6 max-w-7xl mx-auto">
        {/* Main Content */}
        <div className="flex-1 space-y-6 max-w-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2" style={{ fontFamily: "'Pacifico', cursive" }}>
            <Sparkles className="w-7 h-7 text-primary" />
            Daily Boost
            <Sparkles className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'el' ? 'Η καθημερινή σου δόση ενέργειας 🌸' : 'Your daily dose of energy 🌸'}
          </p>
        </div>

        {/* Momster Ταπεράκι */}
        <Link to="/recipes">
          <Card className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 hover:shadow-xl transition-all cursor-pointer group">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-orange-700 flex items-center gap-2">
                  🧀 Momster Ταπεράκι
                </h2>
                <p className="text-sm text-orange-600">
                  {language === 'el' 
                    ? 'Υγιεινές συνταγές για μικρά χεράκια' 
                    : 'Healthy recipes for little hands'}
                </p>
              </div>
              <ChefHat className="w-12 h-12 text-orange-400 group-hover:scale-110 transition-transform" />
            </div>
          </Card>
        </Link>

        {/* Quote of the Day */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              💫 {language === 'el' ? 'Quote της ημέρας' : 'Quote of the Day'}
            </h2>
            <p className="text-lg text-foreground italic leading-relaxed">
              "{dailyQuote}"
            </p>
          </div>
        </Card>

        {/* Self-Care Tip */}
        <Card className="p-6 bg-secondary/30 border-secondary/40">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              🌿 {language === 'el' ? 'Mini Self-Care Tip' : 'Mini Self-Care Tip'}
            </h2>
            <p className="text-base text-foreground font-medium">
              {selfCareTip}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {language === 'el' ? '(10-30 δευτερόλεπτα — πρακτικό & εφικτό)' : '(10-30 seconds — practical & doable)'}
            </p>
          </div>
        </Card>

        {/* Did You Know? */}
        <Card className="p-5 bg-gradient-to-br from-accent/20 to-mint/20 border-accent/30">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              {language === 'el' ? 'Το ήξερες;' : 'Did you know?'}
            </h2>
            <p className="text-sm text-foreground/90 leading-relaxed">
              {didYouKnowFact}
            </p>
          </div>
        </Card>

        {/* Mood Check */}
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-foreground text-center">
              💭 {language === 'el' ? 'Πώς νιώθεις σήμερα;' : 'How are you feeling today?'}
            </h2>
            
            {/* Mood buttons in horizontal row */}
            <div className="flex justify-center items-center gap-4 flex-wrap">
              {MOODS.map((mood) => (
                <button
                  key={mood.emoji}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`
                    w-[60px] h-[60px] rounded-full text-3xl
                    bg-gradient-to-br from-pink-100 to-purple-100
                    border-2 transition-all duration-200
                    hover:scale-110 hover:shadow-lg
                    active:scale-95
                    ${selectedMood === mood.value 
                      ? 'border-primary shadow-lg scale-105 animate-bounce' 
                      : 'border-pink-200 hover:border-primary/50'
                    }
                  `}
                  aria-label={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>

            {moodQuote && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="p-5 bg-white/80 border-primary/20 shadow-md">
                  <p className="text-base text-foreground italic leading-relaxed text-center animate-in fade-in-50 duration-700">
                    "{moodQuote}"
                  </p>
                </Card>
                
                {/* Action buttons */}
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleNextQuote}
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:scale-105 transition-transform"
                  >
                    🔄 {language === 'el' ? 'Επόμενο' : 'Next Quote'}
                  </Button>
                  <Button
                    onClick={handleShareQuote}
                    variant="outline"
                    size="sm"
                    className="gap-2 hover:scale-105 transition-transform"
                  >
                    📤 {language === 'el' ? 'Μοιράσου' : 'Share'}
                  </Button>
                </div>
              </div>
            )}

            {!moodQuote && (
              <p className="text-sm text-muted-foreground text-center italic">
                {language === 'el' 
                  ? 'Επίλεξε ένα emoji για να δεις ένα quote ανάλογα με τη διάθεσή σου' 
                  : 'Select an emoji to see a quote based on your mood'}
              </p>
            )}
          </div>
        </Card>

        {/* Bottom Message */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20">
          <p className="text-sm text-center text-foreground/90 leading-relaxed">
            {language === 'el' 
              ? '💕 Θυμήσου: Κάθε μέρα είναι μια νέα ευκαιρία. Είσαι δυνατή, αξιαγάπητη και τα καταφέρνεις υπέροχα.' 
              : '💕 Remember: Every day is a new opportunity. You are strong, loved, and doing amazing.'}
          </p>
        </Card>

        {/* Mompreneur of the Week */}
        <Card className="border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm relative">
          {/* Floral background pattern */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e91e63' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '30px 30px'
            }}></div>
          </div>

          <div className="p-8 relative">
            {/* Animated mascot in corner */}
            <div className="absolute top-4 right-4 animate-bounce">
              <img src={mascot} alt="Momster Mascot" className="w-12 h-12 object-contain opacity-80" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
                🌸 Mompreneur of the Week
              </h2>
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border-2 border-primary/30 shadow-sm">
                <p className="text-lg font-semibold text-primary">
                  Coming Soon 🌸
                </p>
              </div>
            </div>

            {/* Placeholder image with floral border */}
            <div className="my-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg bg-gradient-to-br from-secondary/50 to-accent/30 flex items-center justify-center">
                  <img src={mascot} alt="Mompreneur Placeholder" className="w-24 h-24 object-contain opacity-60" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">
                {language === 'el'
                  ? 'Κάθε εβδομάδα θα παρουσιάζουμε μια μανούλα από την κοινότητά μας που είναι boss lady, δημιουργική, career-driven ή έχει το δικό της project. Μείνε συντονισμένη!'
                  : 'Every week we will feature a mama from our community who is a boss lady, creative, career-driven or has her own project. Stay tuned!'}
              </p>

              {/* Decorative icons */}
              <div className="flex justify-center gap-2 text-2xl">
                <span className="animate-bounce" style={{ animationDelay: '0s' }}>💼</span>
                <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>✨</span>
                <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>👑</span>
                <span className="animate-bounce" style={{ animationDelay: '0.3s' }}>💕</span>
              </div>
            </div>
          </div>
        </Card>
        </div>

        {/* Sidebar - Empty placeholder for larger screens */}
        <div className="hidden lg:block w-96 space-y-4">
          <Card className="border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm sticky top-24 relative">
            {/* Floral background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e91e63' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            <div className="p-8 relative">
              {/* Animated mascot in corner */}
              <div className="absolute top-4 right-4 animate-bounce">
                <img src={mascot} alt="Momster Mascot" className="w-12 h-12 object-contain opacity-80" />
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
                  🌸 Mompreneur of the Week
                </h2>
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full border-2 border-primary/30 shadow-sm">
                  <p className="text-lg font-semibold text-primary">
                    Coming Soon 🌸
                  </p>
                </div>
              </div>

              {/* Placeholder image with floral border */}
              <div className="my-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg bg-gradient-to-br from-secondary/50 to-accent/30 flex items-center justify-center">
                    <img src={mascot} alt="Mompreneur Placeholder" className="w-24 h-24 object-contain opacity-60" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {language === 'el' 
                    ? 'Κάθε εβδομάδα θα παρουσιάζουμε μια μανούλα από την κοινότητά μας που είναι boss lady, δημιουργική, career-driven ή έχει το δικό της project. Μείνε συντονισμένη!' 
                    : 'Every week we\'ll feature a mom from our community who is a boss lady, creative, career-driven or has her own project. Stay tuned!'}
                </p>
              </div>

              {/* Decorative elements */}
              <div className="mt-6 flex justify-center gap-3 text-xl opacity-60">
                <span className="animate-pulse">🌸</span>
                <span className="animate-pulse" style={{ animationDelay: '0.1s' }}>💐</span>
                <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>🌺</span>
                <span className="animate-pulse" style={{ animationDelay: '0.3s' }}>🌷</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {mascotConfig && visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
          <Card className="max-w-md w-full p-6 bg-gradient-to-br from-primary/10 via-background to-secondary/20 border-2 border-primary/30 shadow-xl animate-scale-in relative">
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
    </div>
  );
}