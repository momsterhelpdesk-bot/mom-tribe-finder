import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

      toast.success("Καλωσόρισες στο Momster! 🌸");
      navigate("/discover");
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error("Σφάλμα κατά την ολοκλήρωση");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8E9EE' }}>
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border-0">
        {step === 1 && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800">
              Καλωσήρθες στο Momster 🌸
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Η πιο cozy κοινότητα για μαμάδες που θέλουν παρέα, στήριξη και φιλίες στη γειτονιά τους.
            </p>
            <Button 
              onClick={() => setStep(2)}
              className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 shadow-lg"
            >
              Get Started
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800">
              Γνώρισε μαμάδες κοντά σου 🤱✨
            </h1>
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <span className="text-pink-500 text-xl">•</span>
                <p className="text-lg text-gray-600">Μαμάδες στην περιοχή σου</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-500 text-xl">•</span>
                <p className="text-lg text-gray-600">Παιδάκια ίδιας ηλικίας</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-pink-500 text-xl">•</span>
                <p className="text-lg text-gray-600">Chat & real connections</p>
              </div>
            </div>
            <Button 
              onClick={() => setStep(3)}
              className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 shadow-lg"
            >
              Next
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800">
              Ένας ασφαλής, ζεστός χώρος μόνο για μαμάδες 💕
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Momster — made with love for moms 🌸
            </p>
            <Button 
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-6 text-lg rounded-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 shadow-lg"
            >
              {loading ? "Φόρτωση..." : "Start →"}
            </Button>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-4">
          {[1, 2, 3].map((dot) => (
            <div
              key={dot}
              className={`w-2 h-2 rounded-full transition-all ${
                dot === step ? 'bg-pink-500 w-8' : 'bg-pink-200'
              }`}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
