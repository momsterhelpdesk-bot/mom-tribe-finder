import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";
import ThisOrThat from "./ThisOrThat";
import { Sparkles, Bell, Share2 } from "lucide-react";

export default function DiscoverEmptyState() {
  const navigate = useNavigate();

  const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.momster.community';

  const handleInviteMom = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Momster - Βρες τη μαμαδοπαρέα σου',
          text: 'Κατέβασε το Momster και βρες μαμάδες κοντά σου! 💕',
          url: playStoreUrl,
        });
      } catch (err) {
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(playStoreUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-background to-purple-50/30 p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center pt-4">
          <h1 
            className="text-2xl font-bold text-foreground mb-2" 
            style={{ fontFamily: "'Pacifico', cursive" }}
          >
            Ανακάλυψε Μαμάδες
          </h1>
        </div>

        {/* Main Mascot Card */}
        <Card className="p-6 bg-gradient-to-br from-pink-50 via-white to-purple-50/50 border-pink-200/50 shadow-lg">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Mascot with gentle animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-pink-200/30 rounded-full blur-2xl scale-150" />
              <img
                src={mascot}
                alt="Momster Mascot"
                className="relative w-28 h-28 object-contain drop-shadow-lg animate-[bounce_4s_ease-in-out_infinite]"
              />
              <span className="absolute -top-1 -right-1 text-3xl animate-pulse">💗</span>
            </div>

            {/* Title */}
            <h2 
              className="text-xl font-bold text-foreground leading-tight"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              Δεν υπάρχουν νέες μαμάδες αυτή τη στιγμή 💗
            </h2>

            {/* Subtitle */}
            <p className="text-muted-foreground text-sm leading-relaxed px-2">
              Η μαμαδοπαρέα μεγαλώνει συνεχώς. Μόλις εμφανιστεί κάποια κοντά σου, θα στο δείξουμε!
            </p>

            {/* Primary CTA */}
            <Button
              onClick={() => navigate("/matching-filters")}
              size="lg"
              className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-semibold shadow-md hover:shadow-lg transition-all rounded-full"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              🎀 Διεύρυνε τα φίλτρα σου
            </Button>

            {/* Secondary CTA */}
            <div className="w-full">
              <Button
                onClick={handleInviteMom}
                variant="ghost"
                size="lg"
                className="w-full text-pink-600 hover:text-pink-700 hover:bg-pink-50/50 font-medium rounded-full"
              >
                <Share2 className="w-4 h-4 mr-2" />
                🌸 Πρόσκαλε μια μαμά
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Φτιάξτε μαζί τη δική σας μαμαδοπαρέα
              </p>
            </div>
          </div>
        </Card>

        {/* This or That Engagement Card */}
        <div className="space-y-2">
          <ThisOrThat />
        </div>

        {/* Reassurance Text */}
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-pink-50/50 rounded-xl border border-pink-100">
          <Bell className="w-4 h-4 text-pink-400" />
          <p className="text-sm text-muted-foreground">
            🔔 Θα σε ειδοποιήσουμε μόλις εμφανιστεί νέα μαμά
          </p>
        </div>
      </div>
    </div>
  );
}
