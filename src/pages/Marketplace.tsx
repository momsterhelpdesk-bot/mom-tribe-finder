import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, ShoppingBag, Sparkles, CheckCircle2 } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Storage key for subscription state
const MARKETPLACE_SUBSCRIBED_KEY = "momster_marketplace_subscribed";

// Analytics tracking helper
const trackEvent = (eventName: string, data?: Record<string, any>) => {
  // Future: integrate with analytics service
  try {
    // Store in localStorage for basic tracking
    const events = JSON.parse(localStorage.getItem("momster_analytics") || "[]");
    events.push({
      event: eventName,
      data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("momster_analytics", JSON.stringify(events.slice(-100))); // Keep last 100 events
  } catch (e) {
    console.error("Analytics error:", e);
  }
};

export default function Marketplace() {
  const [showRules, setShowRules] = useState(false);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  // Check localStorage on mount for subscription state
  useEffect(() => {
    const subscribed = localStorage.getItem(MARKETPLACE_SUBSCRIBED_KEY);
    if (subscribed === "true") {
      setIsSubscribed(true);
    }
    
    // Track page visit
    trackEvent("marketplace_page_view");
  }, []);

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleOpenWaitlist = () => {
    trackEvent("market_subscribe_click");
    setShowWaitlistForm(true);
    setEmailError("");
  };

  const handleSubmitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    
    // Validate email
    if (!email.trim()) {
      setEmailError("Παρακαλώ βάλε έγκυρο email 😊");
      trackEvent("market_subscribe_fail", { reason: "empty_email" });
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Παρακαλώ βάλε έγκυρο email 😊");
      trackEvent("market_subscribe_fail", { reason: "invalid_format" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if already subscribed
      const { data: existing } = await supabase
        .from('marketplace_notifications')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        setIsSubscribed(true);
        localStorage.setItem(MARKETPLACE_SUBSCRIBED_KEY, "true");
        setShowWaitlistForm(false);
        toast({
          title: "Είσαι ήδη στη λίστα μας! 💕",
          description: "Μόλις ανοίξει το Marketplace θα είσαι από τις πρώτες που θα το μάθουν ✨",
        });
        trackEvent("market_subscribe_success", { already_subscribed: true });
        return;
      }

      // Insert into database
      const { error } = await supabase
        .from('marketplace_notifications')
        .insert([{
          email: email,
          user_id: user?.id || null
        }]);

      if (error) throw error;

      // Send confirmation email via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-marketplace-confirmation', {
          body: { email }
        });
        
        if (emailError) {
          console.error("Email sending error:", emailError);
        } else {
        }
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
        // Don't fail the whole process if email fails
      }

      // Update state
      setIsSubscribed(true);
      localStorage.setItem(MARKETPLACE_SUBSCRIBED_KEY, "true");
      setShowWaitlistForm(false);
      setEmail("");
      setShowSuccessPopup(true);
      
      trackEvent("market_subscribe_success", { email_sent: true });
      
    } catch (error) {
      console.error('Error subscribing:', error);
      trackEvent("market_subscribe_fail", { reason: "database_error" });
      toast({
        title: "❌ Σφάλμα",
        description: "Κάτι πήγε στραβά, δοκίμασε ξανά!",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10 relative overflow-hidden">
      {/* Watercolor hearts decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        {[...Array(20)].map((_, i) => (
          <Heart
            key={i}
            className="absolute text-primary animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10" style={{ paddingTop: 'calc(6rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(9rem + env(safe-area-inset-bottom, 0px))' }}>
        {/* Mascot with hearts animation */}
        <div className="flex justify-center mb-8 relative">
          <div className="relative animate-bounce">
            <img 
              src={mascot} 
              alt="Momster Mascot" 
              className="w-32 h-32 object-contain drop-shadow-lg"
            />
            <Heart className="absolute -top-2 -right-2 w-6 h-6 text-primary fill-primary animate-pulse" />
            <Heart className="absolute -bottom-2 -left-2 w-5 h-5 text-primary fill-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
            <Sparkles className="absolute top-0 left-0 w-4 h-4 text-accent animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
        </div>

        {/* Main content card */}
        <div className="bg-card/90 backdrop-blur-md rounded-3xl shadow-xl border border-primary/20 p-8 text-center space-y-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
              Marketplace
            </h1>
            <span className="text-2xl">🌸</span>
          </div>

          <div className="space-y-2">
            <p className="text-lg text-primary font-medium" style={{ fontFamily: "'Pacifico', cursive" }}>
              Από μαμά σε μαμά… με αγάπη 🤍
            </p>
            <p className="text-sm text-muted-foreground">
              Ανταλλαγές, αγορές & πωλήσεις αγαπημένων pre-loved θησαυρών
            </p>
          </div>

          <div className="bg-secondary/30 rounded-2xl p-6 space-y-4">
            <h2 className="text-xl font-bold text-foreground">Coming Soon 🌸</h2>
            <div className="space-y-3 text-foreground/90">
              <p className="leading-relaxed">
                Ετοιμάζουμε τον πιο γλυκό & ασφαλή μαμαδο-χώρο<br />
                αγοραπωλησίας, ανταλλαγών & δωρεών 🤍
              </p>
              <p className="leading-relaxed">
                Μαζί θα δώσουμε δεύτερη ζωή<br />
                σε ό,τι αγάπησαν τα μικρά μας 🧸
              </p>
              <p className="text-sm italic text-muted-foreground">
                Λίγη υπομονή… φορτώνουμε με αγάπη! 💕
              </p>
              <p className="text-xs text-muted-foreground mt-4">
                *Momster Perks — free for now, Premium later.
              </p>
            </div>

            {/* Categories preview - Products */}
            <div className="pt-4 border-t border-border/20">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Προϊόντα:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "👶 Βρεφικά",
                  "👕 Ρούχα",
                  "🧸 Παιχνίδια",
                  "📚 Βιβλία",
                  "👩 Μαμά Essentials",
                  "🎨 DIY & Δημιουργίες",
                  "🚼 Βόλτα & Ταξίδι",
                  "🏠 Σπίτι & Δωμάτιο"
                ].map((category) => (
                  <span
                    key={category}
                    className="px-3 py-1.5 bg-background/60 rounded-full text-xs font-medium border border-primary/20 text-foreground"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            {/* Categories preview - Services */}
            <div className="pt-4 border-t border-border/20">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Υπηρεσίες:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "👶 Babysitting",
                  "🎉 Παιδικά Πάρτυ",
                  "📸 Φωτογραφίες",
                  "🎨 Face Painting",
                  "🎪 Animation",
                  "🎂 Τούρτες & Catering",
                  "🎈 Διακόσμηση",
                  "🎭 Παιδικό Θέατρο"
                ].map((service) => (
                  <span
                    key={service}
                    className="px-3 py-1.5 bg-accent/20 rounded-full text-xs font-medium border border-accent/30 text-foreground"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleOpenWaitlist}
              disabled={isSubscribed}
              className={`w-full text-base transition-all duration-300 ${
                isSubscribed 
                  ? "bg-green-500 hover:bg-green-500 text-white" 
                  : ""
              }`}
              size="lg"
            >
              {isSubscribed ? (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Εγγράφηκες ✔️
                </>
              ) : (
                "💞 Θέλω να ειδοποιηθώ όταν ανοίξει"
              )}
            </Button>
            
            <Button 
              onClick={() => setShowRules(true)}
              variant="outline"
              className="w-full"
            >
              🌸 Δες τους κανόνες του Marketplace
            </Button>
          </div>
        </div>
      </div>

      {/* Footer with Premium Message */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 px-4 bg-[#F8E9EE]/95 backdrop-blur-md border-t border-[#F3DCE5]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
            <span className="text-sm font-medium text-foreground">
              Together, moms thrive!
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            *Momster Perks — free for now, Premium later.
          </p>
        </div>
      </footer>

      {/* Waitlist Form Dialog */}
      <Dialog open={showWaitlistForm} onOpenChange={setShowWaitlistForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center" style={{ fontFamily: "'Pacifico', cursive" }}>
              🌸 Waitlist Marketplace
            </DialogTitle>
            <DialogDescription className="text-center">
              Γράψε το email σου για να σε ειδοποιήσουμε!
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitWaitlist} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                placeholder="your.email@example.com"
                className={`w-full mt-1 px-4 py-3 rounded-2xl border-2 focus:outline-none transition-colors ${
                  emailError 
                    ? "border-red-400 focus:border-red-500" 
                    : "border-[#F3DCE5] focus:border-primary"
                }`}
                required
              />
              {emailError && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  ⚠️ {emailError}
                </p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full rounded-[30px] text-base"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "⏳ Περίμενε..." : "✨ Ειδοποίησέ με"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Confirmation Popup */}
      <Dialog open={showSuccessPopup} onOpenChange={setShowSuccessPopup}>
        <DialogContent className="max-w-sm text-center">
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <img 
                src={mascot} 
                alt="Momster Mascot" 
                className="w-24 h-24 object-contain animate-bounce"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
                Ευχαριστούμε! 💕
              </h3>
              <p className="text-muted-foreground">
                Θα ειδοποιηθείς μόλις ανοίξει το Marketplace 🌸
              </p>
            </div>
            
            <div className="bg-secondary/30 rounded-xl p-4">
              <p className="text-sm text-foreground">
                Έλεγξε το email σου για επιβεβαίωση! 📧
              </p>
            </div>
            
            <Button 
              onClick={() => setShowSuccessPopup(false)}
              className="w-full"
            >
              Τέλεια! 🌷
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rules Dialog */}
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl" style={{ fontFamily: "'Pacifico', cursive" }}>
              🌸 Mom-Code Marketplace
            </DialogTitle>
            <DialogDescription className="text-base">
              Από μαμά σε μαμά με αγάπη 🤍
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 text-foreground">
            <div className="space-y-3">
              <p className="flex items-start gap-2">
                <span className="font-bold">1️⃣</span>
                <span>Μοιραζόμαστε με καλοσύνη & σεβασμό</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold">2️⃣</span>
                <span>Ασφαλείς συναλλαγές: όλες οι αγορές γίνονται μέσα από την πλατφόρμα</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold">3️⃣</span>
                <span>Αντικείμενα σε καλή κατάσταση — τίποτα χαλασμένο ή επικίνδυνο</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold">4️⃣</span>
                <span>Σεβασμός στις προτιμήσεις, ηλικία παιδιών & συμφωνημένες τιμές</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold">5️⃣</span>
                <span>Ότι δεν σας ταιριάζει, απλώς προσπεράστε — χωρίς αρνητικό σχόλιο</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold">6️⃣</span>
                <span>Η πλατφόρμα φροντίζει όλες τις διαδικασίες ώστε να είναι εύκολες, ασφαλείς και αξιόπιστες 🌷</span>
              </p>
            </div>

            <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-sm">Trust & Safety Badges:</p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-background px-2 py-1 rounded">✔️ Verified</span>
                <span className="bg-background px-2 py-1 rounded">🔒 Trusted</span>
                <span className="bg-background px-2 py-1 rounded">❤️ Mom Approved</span>
                <span className="bg-background px-2 py-1 rounded">⚡ Fast Responder</span>
                <span className="bg-background px-2 py-1 rounded">🤝 Safe Exchange</span>
                <span className="bg-background px-2 py-1 rounded">🌱 Eco-Friendly</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
