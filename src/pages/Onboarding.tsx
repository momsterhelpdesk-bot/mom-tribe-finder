import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronRight, MessageCircle, Home, Users, Sparkles, Globe } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

// Bilingual screen definitions
const getScreens = (lang: 'el' | 'en') => [
  {
    id: 0,
    icon: "🌍",
    title: () => lang === 'el' ? "Επιλέξτε γλώσσα" : "Choose your language",
    content: null, // Special content rendered separately
    cta: lang === 'el' ? "Συνέχεια" : "Continue",
    isLanguageScreen: true,
  },
  {
    id: 1,
    icon: "🫂",
    title: (name: string) => lang === 'el' 
      ? `Καλωσήρθες στο Momster, ${name} 🤍`
      : `Welcome to Momster, ${name} 🤍`,
    content: (
      <div className="space-y-3 text-left">
        <p className="text-muted-foreground">
          {lang === 'el' ? 'Εδώ μπορείς να:' : 'Here you can:'}
        </p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>{lang === 'el' ? 'γνωρίσεις άλλες μαμάδες' : 'meet other moms'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>{lang === 'el' ? 'μιλήσεις χωρίς φίλτρα' : 'talk without filters'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>{lang === 'el' ? 'πάρεις στήριξη, ιδέες και αγκαλιές' : 'get support, ideas and hugs'}</span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground italic">
          {lang === 'el' ? 'με τον δικό σου ρυθμό.' : 'at your own pace.'}
        </p>
      </div>
    ),
    cta: lang === 'el' ? "Πάμε να σου δείξουμε" : "Let us show you",
  },
  {
    id: 2,
    icon: "👩‍👧",
    title: () => lang === 'el' ? "Βρες μαμάδες σαν κι εσένα" : "Find moms like you",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          {lang === 'el' ? 'Κάνε swipe:' : 'Swipe:'}
        </p>
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">👉</span>
            <span className="text-green-700 font-medium">
              {lang === 'el' ? 'δεξιά αν νιώθεις ότι ταιριάζετε' : 'right if you feel you match'}
            </span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
            <span className="text-2xl">👈</span>
            <span className="text-rose-700 font-medium">
              {lang === 'el' ? 'αριστερά αν δεν είναι το vibe σου' : 'left if it\'s not your vibe'}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          {lang === 'el' 
            ? 'Όταν γίνει match, ανοίγει chat για να μιλήσετε 💬' 
            : 'When you match, a chat opens to talk 💬'}
        </p>
        {/* Swipe Demo Animation */}
        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-2xl shadow-lg animate-swipe-demo flex items-center justify-center">
              <span className="text-3xl">🌸</span>
            </div>
          </div>
        </div>
      </div>
    ),
    cta: lang === 'el' ? "Επόμενο" : "Next",
  },
  {
    id: 3,
    icon: "💬",
    title: () => lang === 'el' ? "Ρώτα μια μαμά 🫂" : "Ask a mom 🫂",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          {lang === 'el' ? 'Ανώνυμα ή επώνυμα, μπορείς:' : 'Anonymously or not, you can:'}
        </p>
        <ul className="space-y-2 text-left text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>{lang === 'el' ? 'να ρωτήσεις ό,τι σε απασχολεί' : 'ask anything on your mind'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>{lang === 'el' ? 'να διαβάσεις εμπειρίες άλλων' : 'read other moms\' experiences'}</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>{lang === 'el' ? 'να δώσεις ή να πάρεις μια αγκαλιά' : 'give or receive a hug'}</span>
          </li>
        </ul>
        <div className="flex justify-center gap-4 py-3">
          <span className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>❤️</span>
          <span className="text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>🙋‍♀️</span>
          <span className="text-2xl animate-pulse" style={{ animationDelay: '0.6s' }}>🫂</span>
        </div>
        <p className="text-sm text-center text-muted-foreground italic">
          {lang === 'el' ? 'Μικρές κινήσεις, μεγάλη κατανόηση.' : 'Small gestures, big understanding.'}
        </p>
      </div>
    ),
    cta: lang === 'el' ? "Επόμενο" : "Next",
  },
  {
    id: 4,
    icon: "🏠",
    title: () => lang === 'el' ? "Το Home σου" : "Your Home",
    content: (
      <div className="space-y-3">
        <ul className="space-y-3 text-left">
          <li className="flex items-center gap-3 p-2 bg-yellow-50 rounded-xl">
            <span className="text-xl">😊</span>
            <span className="text-muted-foreground">
              {lang === 'el' ? 'Πώς νιώθεις σήμερα (mood)' : 'How you feel today (mood)'}
            </span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-orange-50 rounded-xl">
            <span className="text-xl">🍲</span>
            <span className="text-muted-foreground">
              {lang === 'el' ? 'Συνταγές για μικρά χεράκια' : 'Recipes for little hands'}
            </span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-purple-50 rounded-xl">
            <span className="text-xl">💡</span>
            <span className="text-muted-foreground">
              {lang === 'el' ? '"Ήξερες ότι;" μαμαδίστικα facts' : '"Did you know?" mom facts'}
            </span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-pink-50 rounded-xl">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-muted-foreground">Magic Matching ✨</span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-rose-50 rounded-xl">
            <span className="text-xl">🎉</span>
            <span className="text-muted-foreground">
              {lang === 'el' ? 'Και σύντομα: events για μαμάδες' : 'Coming soon: events for moms'}
            </span>
          </li>
        </ul>
      </div>
    ),
    cta: lang === 'el' ? "Επόμενο" : "Next",
  },
  {
    id: 5,
    icon: "🌱",
    title: () => lang === 'el' ? "Έτοιμη να ξεκινήσουμε;" : "Ready to start?",
    content: (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-lg">
          {lang === 'el' 
            ? 'Φτιάχνουμε πρώτα το προφίλ σου,' 
            : 'Let\'s set up your profile first,'}
        </p>
        <p className="text-muted-foreground text-lg">
          {lang === 'el' 
            ? 'για να σου δείξουμε μαμάδες που ταιριάζουν σε εσένα.' 
            : 'so we can show you moms that match you.'}
        </p>
        <div className="pt-4">
          <img 
            src={mascot} 
            alt="Momster Mascot" 
            className="w-24 h-24 mx-auto rounded-full object-cover shadow-lg animate-bounce"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>
    ),
    cta: lang === 'el' ? "Πάμε στο προφίλ μου" : "Go to my profile",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0); // Start at 0 for language selection
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  
  const SCREENS = getScreens(language);
  useEffect(() => {
    fetchUserName();
  }, []);

  const fetchUserName = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', user.id)
        .single();

      if (data) {
        setUserName(data.username || data.full_name?.split(' ')[0] || 'μαμά');
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleSelectLanguage = (lang: 'el' | 'en') => {
    setLanguage(lang);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Σφάλμα κατά την ολοκλήρωση");
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id);

      if (error) throw error;

      // Check if profile is completed
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_completed')
        .eq('id', user.id)
        .single();

      if (profile?.profile_completed) {
        toast.success(language === 'el' ? "Καλωσόρισες στο Momster! 🌸" : "Welcome to Momster! 🌸");
        navigate("/discover");
      } else {
        navigate("/profile-setup");
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(language === 'el' ? "Σφάλμα κατά την ολοκλήρωση" : "Error completing onboarding");
    } finally {
      setLoading(false);
    }
  };

  const currentScreen = SCREENS[step];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#F8E9EE' }}>
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border-0 relative">
        {/* Skip button - not shown on language screen */}
        {step > 0 && step < 5 && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {language === 'el' ? 'Παράλειψη' : 'Skip'}
          </button>
        )}

        {/* Content */}
        <div className="space-y-6 text-center animate-fade-in" key={step}>
          <div className="text-5xl mb-4">{currentScreen.icon}</div>
          
          <h1 className="text-2xl font-bold text-gray-800">
            {currentScreen.title(userName)}
          </h1>
          
          {/* Language Selection Content */}
          {currentScreen.isLanguageScreen ? (
            <div className="space-y-4 py-4">
              <p className="text-muted-foreground text-center mb-6">
                {language === 'el' 
                  ? 'Σε ποια γλώσσα θέλεις να χρησιμοποιείς το Momster;' 
                  : 'In which language would you like to use Momster?'}
              </p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleSelectLanguage('el')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    language === 'el' 
                      ? 'border-pink-500 bg-pink-50 shadow-md' 
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                  }`}
                >
                  <span className="text-3xl">🇬🇷</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">Ελληνικά</p>
                    <p className="text-sm text-muted-foreground">Greek</p>
                  </div>
                  {language === 'el' && (
                    <span className="ml-auto text-pink-500 text-xl">✓</span>
                  )}
                </button>
                
                <button
                  onClick={() => handleSelectLanguage('en')}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    language === 'en' 
                      ? 'border-pink-500 bg-pink-50 shadow-md' 
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                  }`}
                >
                  <span className="text-3xl">🇬🇧</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">English</p>
                    <p className="text-sm text-muted-foreground">Αγγλικά</p>
                  </div>
                  {language === 'en' && (
                    <span className="ml-auto text-pink-500 text-xl">✓</span>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                <Globe className="w-3 h-3" />
                {language === 'el' 
                  ? 'Μπορείς να αλλάξεις γλώσσα ανά πάσα στιγμή' 
                  : 'You can change the language anytime'}
              </p>
            </div>
          ) : (
            <div className="py-2">
              {currentScreen.content}
            </div>
          )}

          <Button 
            onClick={handleNext}
            disabled={loading}
            className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (language === 'el' ? "Φόρτωση..." : "Loading...") : currentScreen.cta}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Progress dots - show 6 dots now (language + 5 steps) */}
        <div className="flex justify-center gap-2 pt-4">
          {[0, 1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`h-2 rounded-full transition-all duration-300 ${
                dot === step ? 'bg-pink-500 w-8' : dot < step ? 'bg-pink-300 w-2' : 'bg-pink-200 w-2'
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Custom animation styles */}
      <style>{`
        @keyframes swipe-demo {
          0%, 100% { transform: translateX(0) rotate(0deg); opacity: 1; }
          25% { transform: translateX(40px) rotate(5deg); opacity: 0.8; }
          50% { transform: translateX(0) rotate(0deg); opacity: 1; }
          75% { transform: translateX(-40px) rotate(-5deg); opacity: 0.8; }
        }
        .animate-swipe-demo {
          animation: swipe-demo 3s ease-in-out 1;
        }
      `}</style>
    </div>
  );
}
