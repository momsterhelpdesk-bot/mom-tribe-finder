import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles } from "lucide-react";
import { useMascot } from "@/hooks/use-mascot";
import MomsterMascot from "@/components/MomsterMascot";

const MOODS = [
  { emoji: "😊", value: "positive", label: "Happy" },
  { emoji: "😀", value: "positive", label: "Joyful" },
  { emoji: "😐", value: "neutral", label: "Neutral" },
  { emoji: "😔", value: "sad", label: "Sad" },
  { emoji: "😫", value: "overwhelmed", label: "Overwhelmed" },
  { emoji: "😴", value: "tired", label: "Tired" },
  { emoji: "😵‍💫", value: "overwhelmed", label: "Stressed" },
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

export default function DailyBoost() {
  const { language } = useLanguage();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodQuote, setMoodQuote] = useState<string>("");
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

  const handleMoodSelect = (moodValue: string) => {
    setSelectedMood(moodValue);
    const quotes = MOOD_QUOTES[moodValue as keyof typeof MOOD_QUOTES][language];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 pt-20 pb-24 px-4 relative">
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
      
      <div className="max-w-2xl mx-auto space-y-6">
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

        {/* Mood Check */}
        <Card className="p-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              💭 {language === 'el' ? 'Πώς νιώθεις σήμερα;' : 'How are you feeling today?'}
            </h2>
            
            <div className="grid grid-cols-4 gap-3 sm:flex sm:flex-wrap sm:justify-center">
              {MOODS.map((mood) => (
                <Button
                  key={mood.emoji}
                  variant={selectedMood === mood.value ? "default" : "outline"}
                  className="h-16 w-16 sm:h-20 sm:w-20 text-4xl hover:scale-110 transition-transform"
                  onClick={() => handleMoodSelect(mood.value)}
                >
                  {mood.emoji}
                </Button>
              ))}
            </div>

            {moodQuote && (
              <Card className="p-4 bg-primary/5 border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-base text-foreground italic leading-relaxed text-center">
                  "{moodQuote}"
                </p>
              </Card>
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
      </div>

      {mascotConfig && (
        <MomsterMascot
          state={mascotConfig.state}
          message={mascotConfig.message}
          visible={visible}
          showButton={mascotConfig.showButton}
          buttonText={mascotConfig.buttonText}
          onButtonClick={mascotConfig.onButtonClick}
          duration={mascotConfig.duration}
          onHide={hideMascot}
        />
      )}
    </div>
  );
}