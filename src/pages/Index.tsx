import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Calendar, ShoppingBag, Users, MapPin, UtensilsCrossed, Settings, Sparkles } from "lucide-react";
import communityLogo from "@/assets/community-logo.jpg";
import logo from "@/assets/logo-new.jpg";
import mascot from "@/assets/mascot.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import MagicMatching from "@/components/MagicMatching";
import { useOnlineMoms } from "@/hooks/use-online-moms";

const Index = () => {
  const { t } = useLanguage();
  const { onlineCount, loading } = useOnlineMoms();
  
  // Community indicator text logic
  const getCommunityText = () => {
    if (loading) return null;
    if (onlineCount >= 5) {
      return `🤍 Δεν είσαι μόνη — ${onlineCount} μαμάδες είναι εδώ τώρα`;
    }
    if (onlineCount >= 1) {
      return "🤍 Υπάρχουν μαμάδες εδώ τώρα";
    }
    return "🤍 Η κοινότητα σε περιμένει";
  };
  
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
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
        {/* Large animated mascot with waving animation */}
        <div className="absolute top-10 right-10 hidden lg:block animate-float opacity-90">
        <div className="w-56 h-56 rounded-full flex items-center justify-center bg-gradient-to-br from-[#F8E9EE]/40 to-transparent">
          <img 
            src={logo} 
            alt="Momster Logo" 
            className="w-48 h-48 object-cover rounded-full drop-shadow-2xl" 
            style={{ 
              opacity: 0.95,
              maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
            }}
          />
        </div>
        </div>
        <div className="container mx-auto text-center max-w-5xl">
          <div className="mb-6 flex flex-col items-center justify-center gap-4">
              <div className="relative inline-block p-4 rounded-full bg-gradient-to-br from-[#F8E9EE]/40 to-transparent">
               <img 
                 src={logo} 
                 alt="Momster Logo" 
                 className="w-48 h-48 sm:w-56 sm:h-56 md:w-72 md:h-72 object-cover rounded-full animate-scale-in drop-shadow-2xl"
                 style={{ 
                   opacity: 0.95,
                   maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                   WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
                 }}
               />
             </div>
          </div>
          
          <p className="text-xl text-foreground mb-4 font-medium">
            {t('heroTagline')}
          </p>
          
          {/* Manifesto text */}
          <div className="text-sm text-foreground/80 mb-6 max-w-xl mx-auto space-y-1 italic">
            <p>We rise higher when we rise together.</p>
            <p>On Momster, you are friends by default.</p>
            <p>There is room for all of us to shine.</p>
            <p>Moms supporting moms {'>'} everything else.</p>
            <p>Not a social app.</p>
            <p>A mom village. 🫶</p>
          </div>
          
          <p className="text-base text-muted-foreground mb-6 max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>

          {/* Community Indicator */}
          {getCommunityText() && (
            <div className="mb-8 flex justify-center">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-sm border border-pink-200/50 shadow-sm animate-pulse">
                <span className="text-sm text-foreground/80 font-medium">
                  {getCommunityText()}
                </span>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 justify-center flex-wrap px-4">
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
      <section id="features" className="py-16 px-4" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0, #F8E9EE)' }}>
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

            {/* Mom Meets - Village in Action */}
            <Link to="/mom-meets" className="md:col-span-3">
              <Card className="bg-gradient-to-br from-purple-100 via-rose-50 to-pink-100 border-purple-200/50 hover:shadow-xl transition-all hover:scale-[1.02]">
                <CardContent className="p-6 relative overflow-hidden">
                  <div className="absolute top-2 right-2 opacity-15">
                    <img src={mascot} alt="Mascot" className="w-16 h-16 object-contain" />
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">🏡</span>
                    <h3 className="text-xl font-bold text-foreground">Mom Meets</h3>
                    <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                      The village in action
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    Μικρές συναντήσεις χωρίς πίεση — από μαμάδες, για μαμάδες.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-rose-100 text-rose-700 text-xs">
                      👩‍👦 Community Meets
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                      ✨ Official Meets — Coming Soon
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

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

            {/* Recipes - spans 3 columns */}
            <Link to="/recipes" className="md:col-span-3">
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
          </div>
        </div>
      </section>

      {/* Events Banner */}
      <section className="py-6 px-4" style={{ background: 'linear-gradient(135deg, #E9D4F0, #F5E8F0)' }}>
        <div className="container mx-auto max-w-4xl">
          <Link to="/auth">
            <Card className="overflow-hidden hover:shadow-xl transition-all hover:scale-[1.01] border-2 border-purple-200 bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100">
              <CardContent className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-200 rounded-full">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <Badge className="bg-purple-500 text-white text-xs">Coming Soon</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-purple-700">Momster Events & Workshops</h3>
                    <p className="text-sm text-purple-600/80">Playdates, workshops & εκδηλώσεις για μαμάδες!</p>
                  </div>
                </div>
                <Button variant="outline" className="border-purple-300 text-purple-600 hover:bg-purple-100 hidden sm:flex">
                  {t('learnMore')}
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 relative" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
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
      <footer className="py-10 px-4 border-t border-border relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F8E9EE, #F5E8F0)' }}>
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
                  <div className="relative inline-block p-3 rounded-full bg-gradient-to-br from-[#F8E9EE]/40 to-transparent backdrop-blur-sm">
                    <img 
                      src={logo} 
                      alt="Momster Logo" 
                      className="w-16 h-16 object-cover rounded-full" 
                      style={{ 
                        opacity: 0.95,
                        maskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)',
                        WebkitMaskImage: 'radial-gradient(circle, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)'
                      }}
                    />
                  </div>
              </div>
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
              <div className="flex items-center justify-center md:justify-end gap-2">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">v1.0</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-border text-center space-y-2">
            <p className="text-sm text-muted-foreground">{t('footerCopyright')}</p>
            <p className="text-xs text-muted-foreground">*Momster Perks — free for now, Premium later.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
