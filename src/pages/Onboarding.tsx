import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronRight, MessageCircle, Home, Users, Sparkles } from "lucide-react";
import mascot from "@/assets/mascot.jpg";

const SCREENS = [
  {
    id: 1,
    icon: "🫂",
    title: (name: string) => `Καλωσήρθες στο Momster, ${name} 🤍`,
    content: (
      <div className="space-y-3 text-left">
        <p className="text-muted-foreground">Εδώ μπορείς να:</p>
        <ul className="space-y-2 text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>γνωρίσεις άλλες μαμάδες</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>μιλήσεις χωρίς φίλτρα</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>πάρεις στήριξη, ιδέες και αγκαλιές</span>
          </li>
        </ul>
        <p className="text-sm text-muted-foreground italic">με τον δικό σου ρυθμό.</p>
      </div>
    ),
    cta: "Πάμε να σου δείξουμε",
  },
  {
    id: 2,
    icon: "👩‍👧",
    title: () => "Βρες μαμάδες σαν κι εσένα",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">Κάνε swipe:</p>
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
            <span className="text-2xl">👉</span>
            <span className="text-green-700 font-medium">δεξιά αν νιώθεις ότι ταιριάζετε</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-rose-50 rounded-xl">
            <span className="text-2xl">👈</span>
            <span className="text-rose-700 font-medium">αριστερά αν δεν είναι το vibe σου</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <MessageCircle className="w-4 h-4" />
          Όταν γίνει match, ανοίγει chat για να μιλήσετε 💬
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
    cta: "Επόμενο",
  },
  {
    id: 3,
    icon: "💬",
    title: () => "Ρώτα μια μαμά 🫂",
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">Ανώνυμα ή επώνυμα, μπορείς:</p>
        <ul className="space-y-2 text-left text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>να ρωτήσεις ό,τι σε απασχολεί</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>να διαβάσεις εμπειρίες άλλων</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pink-500">•</span>
            <span>να δώσεις ή να πάρεις μια αγκαλιά</span>
          </li>
        </ul>
        <div className="flex justify-center gap-4 py-3">
          <span className="text-2xl animate-pulse" style={{ animationDelay: '0s' }}>❤️</span>
          <span className="text-2xl animate-pulse" style={{ animationDelay: '0.3s' }}>🙋‍♀️</span>
          <span className="text-2xl animate-pulse" style={{ animationDelay: '0.6s' }}>🫂</span>
        </div>
        <p className="text-sm text-center text-muted-foreground italic">
          Μικρές κινήσεις, μεγάλη κατανόηση.
        </p>
      </div>
    ),
    cta: "Επόμενο",
  },
  {
    id: 4,
    icon: "🏠",
    title: () => "Το Home σου",
    content: (
      <div className="space-y-3">
        <ul className="space-y-3 text-left">
          <li className="flex items-center gap-3 p-2 bg-yellow-50 rounded-xl">
            <span className="text-xl">😊</span>
            <span className="text-muted-foreground">Πώς νιώθεις σήμερα (mood)</span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-orange-50 rounded-xl">
            <span className="text-xl">🍲</span>
            <span className="text-muted-foreground">Συνταγές για μικρά χεράκια</span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-purple-50 rounded-xl">
            <span className="text-xl">💡</span>
            <span className="text-muted-foreground">"Ήξερες ότι;" μαμαδίστικα facts</span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-pink-50 rounded-xl">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-muted-foreground">Magic Matching ✨</span>
          </li>
          <li className="flex items-center gap-3 p-2 bg-rose-50 rounded-xl">
            <span className="text-xl">🎉</span>
            <span className="text-muted-foreground">Και σύντομα: events για μαμάδες</span>
          </li>
        </ul>
      </div>
    ),
    cta: "Επόμενο",
  },
  {
    id: 5,
    icon: "🌱",
    title: () => "Έτοιμη να ξεκινήσουμε;",
    content: (
      <div className="space-y-4 text-center">
        <p className="text-muted-foreground text-lg">
          Φτιάχνουμε πρώτα το προφίλ σου,
        </p>
        <p className="text-muted-foreground text-lg">
          για να σου δείξουμε μαμάδες που ταιριάζουν σε εσένα.
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
    cta: "Πάμε στο προφίλ μου",
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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
        toast.success("Καλωσόρισες στο Momster! 🌸");
        navigate("/discover");
      } else {
        navigate("/profile-setup");
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Σφάλμα κατά την ολοκλήρωση");
    } finally {
      setLoading(false);
    }
  };

  const currentScreen = SCREENS[step - 1];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#F8E9EE' }}>
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-32 h-32 bg-pink-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border-0 relative">
        {/* Skip button */}
        {step < 5 && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Παράλειψη
          </button>
        )}

        {/* Content */}
        <div className="space-y-6 text-center animate-fade-in" key={step}>
          <div className="text-5xl mb-4">{currentScreen.icon}</div>
          
          <h1 className="text-2xl font-bold text-gray-800">
            {currentScreen.title(userName)}
          </h1>
          
          <div className="py-2">
            {currentScreen.content}
          </div>

          <Button 
            onClick={handleNext}
            disabled={loading}
            className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Φόρτωση..." : currentScreen.cta}
            {!loading && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((dot) => (
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
