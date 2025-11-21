import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, X, Lightbulb, ChefHat, Calendar } from "lucide-react";
import { useMascot } from "@/hooks/use-mascot";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";
import ThisOrThat from "@/components/ThisOrThat";
import MagicMatching from "@/components/MagicMatching";

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
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 pt-20 pb-24 px-4 relative">
      {/* Animated Mascot */}
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
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2" style={{ fontFamily: "'Pacifico', cursive" }}>
            <Sparkles className="w-7 h-7 text-primary" />
            Momster Home
            <Sparkles className="w-7 h-7 text-primary" />
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === 'el' ? 'Η καθημερινή σου δόση ενέργειας 🌸' : 'Your daily dose of energy 🌸'}
          </p>
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events Banner */}
            <Card className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 border-pink-300 overflow-hidden relative hover:shadow-lg transition-all">
              <div className="absolute top-2 right-2 bg-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                Coming Soon
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-rose-700 flex items-center gap-2">
                    <Calendar className="w-6 h-6" />
                    {language === 'el' ? 'Εκδηλώσεις' : 'Events'}
                  </h2>
                  <p className="text-sm text-rose-600">
                    {language === 'el' 
                      ? 'Βρες τα καλύτερα events για μαμάδες' 
                      : 'Find the best events for moms'}
                  </p>
                </div>
                <div className="text-4xl">🎉</div>
              </div>
            </Card>

            {/* Magic Matching */}
            <MagicMatching />

            {/* This or That */}
            <ThisOrThat />

            {/* Momster Ταπεράκι */}
            <Link to="/recipes">
              <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-xl transition-all cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-rose-700 flex items-center gap-2">
                      🧀 Momster Ταπεράκι
                    </h2>
                    <p className="text-sm text-rose-600">
                      {language === 'el' 
                        ? 'Υγιεινές συνταγές για μικρά χεράκια' 
                        : 'Healthy recipes for little hands'}
                    </p>
                  </div>
                  <ChefHat className="w-12 h-12 text-rose-400 group-hover:scale-110 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Mood Check */}
            <Card className="p-6 bg-gradient-to-br from-pink-100 to-rose-100 border-pink-300">
              <div className="space-y-5">
                <h2 className="text-lg font-bold text-foreground text-center">
                  💭 {language === 'el' ? 'Πώς νιώθεις σήμερα;' : 'How are you feeling today?'}
                </h2>
                
                <div className="flex justify-center items-center gap-3 overflow-x-auto pb-2">
                  {MOODS.map((mood) => (
                    <button
                      key={mood.emoji}
                      onClick={() => handleMoodSelect(mood.value)}
                      className={`
                        flex-shrink-0 w-[60px] h-[60px] rounded-full text-3xl
                        bg-gradient-to-br from-pink-50 to-rose-50
                        border-2 transition-all duration-200
                        hover:scale-110 hover:shadow-lg active:scale-95
                        ${selectedMood === mood.value 
                          ? 'border-rose-500 shadow-lg scale-105 animate-bounce' 
                          : 'border-pink-300 hover:border-rose-400'
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
                    <Card className="p-5 bg-white/90 border-pink-200 shadow-md">
                      <p className="text-base text-foreground italic leading-relaxed text-center">
                        "{moodQuote}"
                      </p>
                    </Card>
                    
                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={handleNextQuote}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:scale-105 transition-transform border-pink-300 hover:bg-pink-50"
                      >
                        🔄 {language === 'el' ? 'Επόμενο' : 'Next'}
                      </Button>
                      <Button
                        onClick={handleShareQuote}
                        variant="outline"
                        size="sm"
                        className="gap-2 hover:scale-105 transition-transform border-pink-300 hover:bg-pink-50"
                      >
                        📤 {language === 'el' ? 'Μοιράσου' : 'Share'}
                      </Button>
                    </div>
                  </div>
                )}

                {!moodQuote && (
                  <p className="text-sm text-muted-foreground text-center italic">
                    {language === 'el' 
                      ? 'Επίλεξε ένα emoji για να δεις ένα quote' 
                      : 'Select an emoji to see a quote'}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Mini Sections (1/3) */}
          <div className="space-y-4">
            {/* Quote of the Day */}
            <Card className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 hover:shadow-lg transition-all">
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  💫 {language === 'el' ? 'Quote της ημέρας' : 'Quote of the Day'}
                </h2>
                <p className="text-sm text-foreground italic leading-relaxed">
                  "{dailyQuote}"
                </p>
              </div>
            </Card>

            {/* Self-Care Tip */}
            <Card className="p-4 bg-gradient-to-br from-rose-50 to-pink-50 border-pink-200 hover:shadow-lg transition-all">
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  🌿 {language === 'el' ? 'Mini Self-Care' : 'Mini Self-Care'}
                </h2>
                <p className="text-sm text-foreground font-medium">
                  {selfCareTip}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  {language === 'el' ? '(10-30 δευτερόλεπτα)' : '(10-30 seconds)'}
                </p>
              </div>
            </Card>

            {/* Did You Know? */}
            <Card className="p-4 bg-gradient-to-br from-pink-100 to-rose-100 border-pink-300 hover:shadow-lg transition-all">
              <div className="space-y-2">
                <h2 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-rose-500" />
                  {language === 'el' ? 'Το ήξερες;' : 'Did you know?'}
                </h2>
                <p className="text-xs text-foreground/90 leading-relaxed">
                  {didYouKnowFact}
                </p>
              </div>
            </Card>

            {/* Bottom Message */}
            <Card className="p-4 bg-gradient-to-br from-rose-100 to-pink-100 border-pink-300 hover:shadow-lg transition-all">
              <p className="text-xs text-center text-foreground/90 leading-relaxed">
                {language === 'el' 
                  ? '💕 Θυμήσου: Κάθε μέρα είναι μια νέα ευκαιρία. Είσαι δυνατή, αξιαγάπητη και τα καταφέρνεις υπέροχα.' 
                  : '💕 Remember: Every day is a new opportunity. You are strong, loved, and doing amazing.'}
              </p>
            </Card>
          </div>
        </div>
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
    </div>
  );
}
