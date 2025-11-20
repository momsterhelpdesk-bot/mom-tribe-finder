import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar, ShoppingBag, Users, MapPin } from "lucide-react";
import logoFull from "@/assets/logo-full.jpg";
import mascot from "@/assets/mascot.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t('connectLocalMoms'),
      description: t('connectLocalMomsDesc')
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: t('secureMessaging'),
      description: t('secureMessagingDesc')
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: t('marketplace'),
      description: t('marketplaceDesc')
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('askMoms'),
      description: t('askMomsDesc')
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: t('locationMatching'),
      description: t('locationMatchingDesc')
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        {/* Large animated mascot */}
        <div className="absolute top-10 right-10 animate-bounce opacity-80 hidden lg:block">
          <img src={mascot} alt="Momster Mascot" className="w-48 h-48 object-contain" />
        </div>
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <img src={logoFull} alt="Momster Logo" className="w-80 h-80 object-contain animate-scale-in" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary leading-tight animate-fade-in" style={{ fontFamily: "'Pacifico', cursive" }}>
            Momster
          </h1>
          
          <p className="text-2xl text-foreground mb-8 font-medium">
            {t('heroTagline')}
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                {t('joinMomster')}
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('learnMore')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
              {t('featuresTitle')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow relative overflow-hidden">
                <CardContent className="p-6">
                  <div className="absolute top-2 right-2 opacity-10">
                    <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                  </div>
                  <div className="text-primary mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src={mascot} alt="Mascot" className="w-96 h-96 object-contain" />
        </div>
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <h2 className="text-4xl font-bold mb-6 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('ctaSubtitle')}
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              {t('joinMomster')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={mascot} alt="Momster Mascot" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>Momster</span>
          </div>
          <p className="text-muted-foreground mb-2">{t('footerCopyright')}</p>
          <Link to="/privacy-terms" className="text-sm text-muted-foreground hover:text-primary underline">
            {t('privacyTerms')}
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
