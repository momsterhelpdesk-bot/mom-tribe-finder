import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, ShoppingBag, Users, MapPin, UtensilsCrossed, Settings } from "lucide-react";
import communityLogo from "@/assets/community-logo.jpg";
import mascot from "@/assets/mascot.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import ThisOrThat from "@/components/ThisOrThat";
import MagicMatching from "@/components/MagicMatching";

const Index = () => {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: t('connectLocalMoms'),
      description: t('connectLocalMomsDesc'),
      bg: "bg-gradient-to-br from-pink-50 to-rose-50"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('secureMessaging'),
      description: t('secureMessagingDesc'),
      bg: "bg-gradient-to-br from-pink-100 to-purple-100"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: t('marketplace'),
      description: t('marketplaceDesc'),
      bg: "bg-gradient-to-br from-rose-50 to-pink-50"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: t('askMoms'),
      description: t('askMomsDesc'),
      bg: "bg-gradient-to-br from-pink-100 to-rose-100"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: t('locationMatching'),
      description: t('locationMatchingDesc'),
      bg: "bg-gradient-to-br from-pink-100 to-rose-100"
    },
    {
      icon: <UtensilsCrossed className="h-6 w-6" />,
      title: "Momster Ταπεράκι",
      description: "Υγιεινές συνταγές για μικρά χεράκια",
      bg: "bg-gradient-to-br from-orange-100 to-pink-100"
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: "Mompreneur",
      description: "Υποστήριξη για μαμάδες επιχειρηματίες - Coming Soon",
      bg: "bg-gradient-to-br from-purple-100 to-pink-100"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden">
        {/* Large animated mascot with waving animation */}
        <div className="absolute top-10 right-10 hidden lg:block animate-float opacity-90">
          <img 
            src={mascot} 
            alt="Momster Mascot" 
            className="w-56 h-56 object-contain drop-shadow-2xl animate-wave" 
          />
        </div>
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-6 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-rose-200 animate-pulse opacity-60 blur-xl"></div>
              <img 
                src={communityLogo} 
                alt="Momster Community" 
                className="relative w-80 h-80 object-contain animate-scale-in drop-shadow-2xl rounded-full bg-gradient-to-br from-pink-50/80 to-purple-50/80 p-6 border-4 border-pink-200/50" 
              />
            </div>
            <h1 className="text-6xl font-bold text-primary animate-fade-in" style={{ fontFamily: "'Pacifico', cursive" }}>
              momster
            </h1>
          </div>
          
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

          {/* Grid with varied sizes - Location Matching First */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location Matching - FIRST, spans full width */}
            <Card className="bg-gradient-to-br from-pink-100 to-rose-100 border-none hover:shadow-xl transition-all hover:scale-[1.02] md:col-span-3">
              <CardContent className="p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 opacity-20">
                  <img src={mascot} alt="Mascot" className="w-24 h-24 object-contain animate-bounce" />
                </div>
                <div className="text-primary mb-4">{features[4].icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-foreground">
                  {features[4].title}
                </h3>
                <p className="text-muted-foreground text-base">
                  {features[4].description}
                </p>
              </CardContent>
            </Card>

            {/* Magic Matching Button - circular style */}
            <div className="md:col-span-1">
              <MagicMatching />
            </div>

            {/* Connect with local moms */}
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-none hover:shadow-lg transition-all hover:scale-[1.02]">
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

            {/* Secure Messaging */}
            <Card className="bg-gradient-to-br from-pink-100 to-purple-100 border-none hover:shadow-lg transition-all hover:scale-[1.02]">
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

            {/* This or That - spans 2 columns */}
            <div className="md:col-span-2">
              <ThisOrThat />
            </div>

            {/* Marketplace */}
            <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-none hover:shadow-lg transition-all hover:scale-[1.02]">
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

            {/* Recipes - spans 2 columns */}
            <Link to="/recipes" className="md:col-span-2">
              <Card className="bg-gradient-to-br from-orange-100 to-pink-100 border-none hover:shadow-xl transition-all hover:scale-[1.02] h-full">
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

            {/* Ask Moms */}
            <Card className="bg-gradient-to-br from-pink-100 to-rose-100 border-none hover:shadow-lg transition-all hover:scale-[1.02]">
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

            {/* Mompreneur - Coming Soon */}
            <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-none hover:shadow-lg transition-all hover:scale-[1.02] relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-purple-200 text-purple-700">Coming Soon</Badge>
              </div>
              <CardContent className="p-6 relative overflow-hidden">
                <div className="absolute top-2 right-16 opacity-10">
                  <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                </div>
                <div className="text-primary mb-3">{features[6].icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  {features[6].title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {features[6].description}
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
      <footer className="py-10 px-4 border-t border-border bg-gradient-to-br from-background to-secondary/20 relative overflow-hidden">
        {/* Scattered small community icons */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <img src={communityLogo} alt="" className="absolute top-4 left-8 w-12 h-12 object-contain animate-float" />
          <img src={communityLogo} alt="" className="absolute top-16 right-16 w-16 h-16 object-contain animate-bounce" style={{ animationDelay: '0.5s' }} />
          <img src={communityLogo} alt="" className="absolute bottom-8 left-20 w-14 h-14 object-contain animate-float" style={{ animationDelay: '1s' }} />
          <img src={communityLogo} alt="" className="absolute bottom-16 right-24 w-12 h-12 object-contain animate-bounce" style={{ animationDelay: '1.5s' }} />
          <img src={communityLogo} alt="" className="absolute top-1/2 left-1/4 w-10 h-10 object-contain animate-float" style={{ animationDelay: '2s' }} />
          <img src={communityLogo} alt="" className="absolute top-1/3 right-1/3 w-14 h-14 object-contain animate-bounce" style={{ animationDelay: '2.5s' }} />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
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
