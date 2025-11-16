import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import mascot from "@/assets/mascot.jpg";
import { useToast } from "@/hooks/use-toast";

export default function Marketplace() {
  const [showRules, setShowRules] = useState(false);
  const [notified, setNotified] = useState(false);
  const { toast } = useToast();

  const handleNotifyMe = () => {
    setNotified(true);
    toast({
      title: "🌷 Τέλεια!",
      description: "Θα σε ενημερώσουμε μόλις ανοίξει το Marketplace!",
    });
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

      <div className="max-w-2xl mx-auto pt-24 pb-32 px-4 relative z-10">
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
              onClick={handleNotifyMe}
              disabled={notified}
              className="w-full text-base"
              size="lg"
            >
              💞 {notified ? "Θα σε ειδοποιήσουμε!" : "Θέλω να ειδοποιηθώ όταν ανοίξει"}
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
