import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import mascot from "@/assets/mascot.jpg";

export default function Events() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/30 relative">
      <img 
        src={mascot} 
        alt="Momster Mascot" 
        className="fixed top-24 right-4 w-20 h-20 opacity-20 object-contain pointer-events-none"
      />
      <div className="max-w-2xl mx-auto pt-20 pb-24 px-4">
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Pacifico', cursive" }}>
            Εκδηλώσεις
          </h1>
        </div>

        <Card className="p-12 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold text-purple-600" style={{ fontFamily: "'Pacifico', cursive" }}>
              Coming Soon!
            </h2>
            <p className="text-lg text-muted-foreground">
              Οι εκδηλώσεις και workshops έρχονται σύντομα!
            </p>
            <p className="text-sm text-muted-foreground">
              Ξεκλείδωσε αποκλειστικές εκδηλώσεις, playdates και workshops για μαμάδες ✨
            </p>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-20 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-md border-t border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-center gap-2">
          <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
          <span className="text-sm text-muted-foreground">Together, moms thrive!</span>
        </div>
      </footer>
    </div>
  );
}
