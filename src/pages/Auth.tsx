import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import mascot from "@/assets/mascot.jpg";
import logoFull from "@/assets/logo-full.jpg";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md p-8 shadow-lg relative overflow-hidden">
        <img 
          src={mascot} 
          alt="Momster Mascot" 
          className="absolute -bottom-10 -right-10 w-32 h-32 opacity-10 object-contain"
        />
        
        <div className="flex flex-col items-center mb-6 relative z-10">
          <img src={logoFull} alt="Momster Logo" className="h-16 mb-4" />
          <h1 className="text-3xl font-bold text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
            Momster
          </h1>
        </div>
        
        <p className="text-center text-muted-foreground mb-8 italic text-lg">
          "Together, moms thrive!"
        </p>

        <div className="text-center mb-6">
          <Badge variant="secondary" className="text-xs px-3 py-1">
            📍 Διαθέσιμο στη Θεσσαλονίκη
          </Badge>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="Your name" />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" />
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2 py-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border"
                required
              />
              <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                Αποδέχομαι τους{" "}
                <Link to="/privacy-terms" className="text-primary hover:underline" target="_blank">
                  Όρους Χρήσης και την Πολιτική Απορρήτου
                </Link>
              </Label>
            </div>
          )}

          <Button className="w-full" size="lg" disabled={!isLogin && !acceptedTerms}>
            {isLogin ? "Sign In" : "Sign Up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link to="/privacy-terms" className="text-xs text-muted-foreground hover:text-primary underline">
            Πολιτική Απορρήτου & Όροι Χρήσης
          </Link>
        </div>
      </Card>
    </div>
  );
}
