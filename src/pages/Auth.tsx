import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import mascot from "@/assets/mascot.jpg";
import logoNew from "@/assets/logo-new.jpg";
import MomsterMascot from "@/components/MomsterMascot";
import { useMascot } from "@/hooks/use-mascot";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().trim().email({ message: "Μη έγκυρη διεύθυνση email" }).max(255, { message: "Το email πρέπει να είναι μικρότερο από 255 χαρακτήρες" }),
  password: z.string().min(8, { message: "Ο κωδικός πρέπει να είναι τουλάχιστον 8 χαρακτήρες" }).max(100, { message: "Ο κωδικός πρέπει να είναι μικρότερος από 100 χαρακτήρες" }),
  fullName: z.string().trim().min(1, { message: "Το ονοματεπώνυμο είναι υποχρεωτικό" }).max(100, { message: "Το ονοματεπώνυμο πρέπει να είναι μικρότερο από 100 χαρακτήρες" })
});

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Μη έγκυρη διεύθυνση email" }).max(255),
  password: z.string().min(1, { message: "Ο κωδικός είναι υποχρεωτικός" })
});

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedAge, setAcceptedAge] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showForgotUsername, setShowForgotUsername] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const navigate = useNavigate();
  const { mascotConfig, visible, hideMascot, showWelcome } = useMascot();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check profile completion status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completed, has_completed_onboarding')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
          await supabase.auth.signOut();
          toast.error("Σφάλμα με το προφίλ. Παρακαλώ συνδεθείτε ξανά.");
          return;
        }

        if (!profile?.profile_completed) {
          navigate("/profile-setup");
        } else if (!profile?.has_completed_onboarding) {
          navigate("/onboarding");
        } else {
          navigate("/discover");
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedAge) {
      toast.error("Πρέπει να είστε άνω των 18 ετών");
      return;
    }
    
    if (!acceptedTerms) {
      toast.error("Πρέπει να αποδεχτείτε τους όρους χρήσης");
      return;
    }

    // Validate inputs
    const validation = signUpSchema.safeParse({ email, password, fullName });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);
    try {
      const validData = validation.data;
      const { data, error } = await supabase.auth.signUp({
        email: validData.email,
        password: validData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/profile-setup`,
          data: {
            full_name: validData.fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Send welcome email
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              userId: data.user.id,
              email: validData.email,
              fullName: validData.fullName,
              language: 'el'
            }
          });
          console.log("Welcome email sent");
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Don't block signup if email fails
        }

        toast.success("Λογαριασμός δημιουργήθηκε! Συμπληρώστε το προφίλ σας.");
        showWelcome();
        setTimeout(() => navigate("/profile-setup"), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την εγγραφή");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const validation = signInSchema.safeParse({ email, password });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setLoading(true);

    try {
      const validData = validation.data;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validData.email,
        password: validData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Check if profile is completed
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('profile_completed, has_completed_onboarding')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Profile error:', profileError);
          await supabase.auth.signOut();
          toast.error("Σφάλμα με το προφίλ. Παρακαλώ δοκιμάστε ξανά.");
          return;
        }

        if (!profile?.profile_completed) {
          showWelcome();
          setTimeout(() => navigate("/profile-setup"), 2000);
        } else if (!profile?.has_completed_onboarding) {
          showWelcome();
          setTimeout(() => navigate("/onboarding"), 2000);
        } else {
          showWelcome();
          setTimeout(() => navigate("/discover"), 2000);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά τη σύνδεση");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-callback`,
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά τη σύνδεση με Google");
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error("Παρακαλώ εισάγετε το email σας");
      return;
    }

    const emailValidation = z.string().email();
    if (!emailValidation.safeParse(forgotEmail).success) {
      toast.error("Μη έγκυρη διεύθυνση email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast.success("Σου στείλαμε email με οδηγίες επαναφοράς! 🌸");
      setShowForgotPassword(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την αποστολή email");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotUsername = async () => {
    if (!forgotEmail) {
      toast.error("Παρακαλώ εισάγετε το email σας");
      return;
    }

    const emailValidation = z.string().email();
    if (!emailValidation.safeParse(forgotEmail).success) {
      toast.error("Μη έγκυρη διεύθυνση email");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-username-reminder', {
        body: { email: forgotEmail, language: 'el' }
      });

      if (error) throw error;

      toast.success("Σου στείλαμε υπενθύμιση email! 🌷");
      setShowForgotUsername(false);
      setForgotEmail("");
    } catch (error: any) {
      toast.error(error.message || "Σφάλμα κατά την αποστολή email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-lg relative overflow-hidden bg-white/95 backdrop-blur-sm border-nav-pink/20">
        <img 
          src={mascot} 
          alt="Momster Mascot" 
          className="absolute -bottom-10 -right-10 w-32 h-32 opacity-10 object-contain animate-[bounce_3s_ease-in-out_infinite]"
        />
        
        <div className="flex flex-col items-center mb-6 relative z-10">
          <img src={logoNew} alt="Momster Logo" className="h-24 mb-4 animate-fade-in" />
          <h1 className="text-3xl font-bold text-nav-pink animate-scale-in" style={{ fontFamily: "'Pacifico', cursive" }}>
            Momster
          </h1>
        </div>
        
        <p className="text-center text-nav-pink/70 mb-8 italic text-lg">
          "Together, moms thrive!"
        </p>

        <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Πλήρες Όνομα</Label>
              <Input 
                id="name" 
                placeholder="Το όνομά σας" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Κωδικός</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="space-y-3 py-2">
              <p className="text-sm font-medium text-foreground">
                Με τη δημιουργία λογαριασμού δηλώνω υπεύθυνα ότι:
              </p>
              
              <div className="flex items-start gap-2">
                <Checkbox
                  id="age"
                  checked={acceptedAge}
                  onCheckedChange={(checked) => setAcceptedAge(checked as boolean)}
                  required
                />
                <Label htmlFor="age" className="text-sm leading-tight cursor-pointer">
                  Είμαι άνω των 18 ετών
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  required
                />
                <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                  Έχω διαβάσει και αποδέχομαι τους{" "}
                  <Link to="/privacy-terms" className="text-nav-pink hover:underline" target="_blank">
                    Όρους Χρήσης, την Πολιτική Απορρήτου και την Πολιτική Cookies
                  </Link>
                  {" "}και συμφωνώ με την επεξεργασία των προσωπικών μου δεδομένων σύμφωνα με το GDPR
                </Label>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-nav-pink hover:bg-nav-pink/90 text-white" 
            size="lg" 
            disabled={loading || (!isLogin && (!acceptedTerms || !acceptedAge))}
          >
            {loading ? "Παρακαλώ περιμένετε..." : (isLogin ? "Σύνδεση" : "Δημιουργία Λογαριασμού")}
          </Button>

          {isLogin && (
            <div className="flex flex-col gap-2 text-center text-sm">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-nav-pink hover:underline"
              >
                Ξέχασες τον κωδικό;
              </button>
              <button
                type="button"
                onClick={() => setShowForgotUsername(true)}
                className="text-nav-pink hover:underline"
              >
                Ξέχασες το email σου;
              </button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Δεν έχετε λογαριασμό; " : "Έχετε ήδη λογαριασμό; "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-nav-pink hover:underline font-medium"
            >
              {isLogin ? "Εγγραφή" : "Σύνδεση"}
            </button>
          </p>
        </form>

        <div className="mt-6 text-center">
          <Link to="/privacy-terms" className="text-xs text-muted-foreground hover:text-nav-pink underline">
          Πολιτική Απορρήτου & Όροι Χρήσης
          </Link>
        </div>
      </Card>

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

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επαναφορά Κωδικού 🌸</DialogTitle>
            <DialogDescription>
              Εισάγετε το email σας και θα σας στείλουμε οδηγίες για επαναφορά του κωδικού σας.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Αποστολή..." : "Αποστολή Email Επαναφοράς"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showForgotUsername} onOpenChange={setShowForgotUsername}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Υπενθύμιση Email 🌷</DialogTitle>
            <DialogDescription>
              Εισάγετε το email σας και θα σας το υπενθυμίσουμε.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reminder-email">Email</Label>
              <Input
                id="reminder-email"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleForgotUsername}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Αποστολή..." : "Υπενθύμιση Email"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
