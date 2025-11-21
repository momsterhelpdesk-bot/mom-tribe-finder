import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar, ShoppingBag, Users, MapPin, UtensilsCrossed, Settings } from "lucide-react";
import logoFull from "@/assets/logo-full.jpg";
import mascot from "@/assets/mascot.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: t('connectLocalMoms'),
      description: t('connectLocalMomsDesc'),
      bg: "bg-pink-100/80"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('secureMessaging'),
      description: t('secureMessagingDesc'),
      bg: "bg-purple-100/80"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: t('marketplace'),
      description: t('marketplaceDesc'),
      bg: "bg-pink-50/80"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: t('askMoms'),
      description: t('askMomsDesc'),
      bg: "bg-rose-100/80"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t('locationMatching'),
      description: t('locationMatchingDesc'),
      bg: "bg-pink-100/80"
    },
    {
      icon: <UtensilsCrossed className="h-6 w-6" />,
      title: "Momster Ταπεράκι",
      description: "Υγιεινές συνταγές για μικρά χεράκια",
      bg: "bg-orange-100/80"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative">
        {/* Large animated mascot */}
        <div className="absolute top-10 right-10 animate-bounce opacity-80 hidden lg:block">
          <img src={mascot} alt="Momster Mascot" className="w-48 h-48 object-contain drop-shadow-2xl" />
        </div>
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-6 flex justify-center">
            <img src={logoFull} alt="Momster Logo" className="w-64 h-64 object-contain animate-scale-in drop-shadow-xl" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-3 text-primary leading-tight animate-fade-in" style={{ fontFamily: "'Pacifico', cursive" }}>
            Momster
          </h1>
          
          <p className="text-xl text-foreground mb-6 font-medium">
            {t('heroTagline')}
          </p>
          
          <p className="text-base text-muted-foreground mb-8 max-w-2xl mx-auto">
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

      {/* Events Banner */}
      <section className="py-3 px-4 bg-gradient-to-r from-pink-200 via-purple-200 to-pink-200">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-sm font-semibold text-foreground">
              🎉 Join Momster Events Coming Soon! 🎉
            </p>
          </div>
        </div>
      </section>

      {/* Features Section - Grid Layout */}
      <section id="features" className="py-16 px-4 bg-gradient-to-br from-background via-secondary/20 to-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
              {t('featuresTitle')}
            </h2>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </div>

          {/* Grid with varied sizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large feature card - spans 2 columns */}
            <Link to="/recipes" className="md:col-span-2">
              <Card className={`${features[5].bg} border-none hover:shadow-xl transition-all hover:scale-[1.02] h-full`}>
                <CardContent className="p-8 relative overflow-hidden">
                  <div className="absolute top-4 right-4 opacity-20">
                    <img src={mascot} alt="Mascot" className="w-24 h-24 object-contain" />
                  </div>
                  <div className="text-primary mb-4">{features[5].icon}</div>
                  <h3 className="text-2xl font-bold mb-3 text-foreground">
                    {features[5].title}
                  </h3>
                  <p className="text-muted-foreground text-base">
                    {features[5].description}
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Regular feature card */}
            <Card className={`${features[0].bg} border-none hover:shadow-lg transition-all hover:scale-[1.02]`}>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-primary mb-3">{features[0].icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {features[0].title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {features[0].description}
                </p>
              </CardContent>
            </Card>

            {/* Second row - varied layout */}
            <Card className={`${features[1].bg} border-none hover:shadow-lg transition-all hover:scale-[1.02]`}>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-primary mb-3">{features[1].icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {features[1].title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {features[1].description}
                </p>
              </CardContent>
            </Card>

            <Card className={`${features[2].bg} border-none hover:shadow-lg transition-all hover:scale-[1.02]`}>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-primary mb-3">{features[2].icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {features[2].title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {features[2].description}
                </p>
              </CardContent>
            </Card>

            <Card className={`${features[3].bg} border-none hover:shadow-lg transition-all hover:scale-[1.02]`}>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-primary mb-3">{features[3].icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {features[3].title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {features[3].description}
                </p>
              </CardContent>
            </Card>

            {/* Third row - location spans 2 */}
            <Card className={`${features[4].bg} border-none hover:shadow-lg transition-all hover:scale-[1.02] md:col-span-2`}>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-2 opacity-10">
                  <img src={mascot} alt="Mascot" className="w-20 h-20 object-contain" />
                </div>
                <div className="text-primary mb-3">{features[4].icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {features[4].title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {features[4].description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 relative bg-gradient-to-br from-pink-50/50 to-purple-50/50">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <img src={mascot} alt="Mascot" className="w-96 h-96 object-contain" />
        </div>
        <div className="container mx-auto text-center max-w-3xl relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            {t('ctaSubtitle')}
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              {t('joinMomster')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-10 px-4 border-t border-border bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <img src={mascot} alt="Momster Mascot" className="w-10 h-10 object-contain" />
                <span className="text-2xl font-bold text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>Momster</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connecting mothers, building communities
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold text-foreground mb-3">Quick Links</h4>
              <div className="space-y-2">
                <Link to="/privacy-terms" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy & Terms
                </Link>
                <Link to="/auth" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  Join Community
                </Link>
              </div>
            </div>

            {/* App Info */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-foreground mb-3">Connect</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Together, moms thrive! 💕
              </p>
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">v1.0</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">{t('footerCopyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
