import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe } from "lucide-react";

const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={mascot} alt="Momster Mascot" className="h-10 w-10 object-contain" />
          <span className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: "'Pacifico', cursive" }}>Momster</span>
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
          <Link to="/auth">
            <Button variant="outline" size="sm" className="md:text-base">{t('signIn')}</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="md:text-base">{t('getStarted')}</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
