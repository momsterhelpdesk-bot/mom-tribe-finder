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

      {/* Mompreneur of the Week Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/20 via-accent/10 to-secondary/20">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20 shadow-xl rounded-3xl overflow-hidden bg-card/95 backdrop-blur-sm relative">
            {/* Floral background pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e91e63' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '30px 30px'
              }}></div>
            </div>

            <CardContent className="p-8 md:p-12 relative">
              {/* Animated mascot in corner */}
              <div className="absolute top-4 right-4 animate-bounce">
                <img src={mascot} alt="Momster Mascot" className="w-16 h-16 md:w-20 md:h-20 object-contain opacity-80" />
              </div>

              <div className="text-center mb-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
                  🌸 Mompreneur of the Week
                </h2>
                <div className="inline-block px-6 py-2 bg-primary/10 rounded-full border-2 border-primary/30 shadow-sm">
                  <p className="text-xl font-semibold text-primary">
                    Coming Soon 🌸
                  </p>
                </div>
              </div>

              {/* Placeholder image with floral border */}
              <div className="my-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl"></div>
                  <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-primary/30 shadow-lg bg-gradient-to-br from-secondary/50 to-accent/30 flex items-center justify-center">
                    <img src={mascot} alt="Mompreneur Placeholder" className="w-32 h-32 md:w-40 md:h-40 object-contain opacity-60" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="max-w-2xl mx-auto text-center">
                <p className="text-lg text-muted-foreground leading-relaxed px-4">
                  Κάθε εβδομάδα θα παρουσιάζουμε μια μανούλα από την κοινότητά μας που είναι boss lady, δημιουργική, career-driven ή έχει το δικό της project. Μείνε συντονισμένη!
                </p>
              </div>

              {/* Decorative elements */}
              <div className="mt-8 flex justify-center gap-4 text-2xl opacity-60">
                <span className="animate-pulse">🌸</span>
                <span className="animate-pulse delay-100">💐</span>
                <span className="animate-pulse delay-200">🌺</span>
                <span className="animate-pulse delay-300">🌷</span>
              </div>
            </CardContent>
          </Card>
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
