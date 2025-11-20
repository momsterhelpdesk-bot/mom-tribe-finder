import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoFull from "@/assets/logo-full.jpg";
import { z } from "zod";

const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "Ο κωδικός πρέπει να είναι τουλάχιστον 8 χαρακτήρες" }).max(100),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Οι κωδικοί δεν ταιριάζουν",
  path: ["confirmPassword"],
});

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid recovery token
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Μη έγκυρο ή ληγμένο link επαναφοράς");
        navigate("/auth");
      }
    };
    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: validation.data.password
      });

      if (error) throw error;

      toast.success("Ο κωδικός σου άλλαξε με επιτυχία! 🌸");
      
      // Sign out to force re-login with new password
      await supabase.auth.signOut();
      
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Σφάλμα κατά την αλλαγή κωδικού");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/30">
      <Card className="w-full max-w-md p-8 shadow-lg bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-6">
          <img src={logoFull} alt="Momster Logo" className="h-24 mb-4 animate-fade-in" />
          <h1 className="text-3xl font-bold text-primary animate-scale-in" style={{ fontFamily: "'Pacifico', cursive" }}>
            Momster
          </h1>
          <h2 className="text-xl mt-4 text-foreground">Επαναφορά Κωδικού</h2>
        </div>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Νέος Κωδικός</Label>
            <Input
              id="password"
              type="password"
              placeholder="Τουλάχιστον 8 χαρακτήρες"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Επιβεβαίωση Κωδικού</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Εισάγετε ξανά τον κωδικό"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Παρακαλώ περιμένετε..." : "Αλλαγή Κωδικού"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Θυμήθηκες τον κωδικό σου;{" "}
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="text-primary hover:underline font-medium"
          >
            Σύνδεση
          </button>
        </p>
      </Card>
    </div>
  );
}
