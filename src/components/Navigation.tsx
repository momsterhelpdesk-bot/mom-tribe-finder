import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/logo-new.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Αποσυνδεθήκατε επιτυχώς");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img 
            src={logo} 
            alt="Momster Logo" 
            className="h-12 object-contain drop-shadow-sm opacity-95 mix-blend-multiply dark:mix-blend-normal dark:opacity-90 transition-all" 
          />
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'el' ? 'en' : 'el')}
            className="gap-1"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">{language === 'el' ? 'EN' : 'ΕΛ'}</span>
          </Button>
          {isLoggedIn ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2 hover:bg-destructive/10 hover:text-destructive"
              title="Αποσύνδεση"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Αποσύνδεση</span>
            </Button>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="outline" size="sm" className="md:text-base">{t('signIn')}</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="md:text-base">{t('getStarted')}</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
