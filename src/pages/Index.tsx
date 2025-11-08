import Navigation from "@/components/Navigation";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Calendar, ShoppingBag, Users, MapPin } from "lucide-react";
import logoFull from "@/assets/logo-full.jpg";
import mascot from "@/assets/mascot.jpg";

const Index = () => {
  const features = [
    {
      icon: <Users className="h-8 w-8" />,
      title: "Connect with Local Moms",
      description: "Find and match with mothers in your area who share similar parenting journeys and interests."
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Secure Messaging",
      description: "Chat safely with other moms to plan playdates, share advice, or just have a friendly conversation."
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Local Events",
      description: "Discover and create family-friendly events, workshops, and meetups in your community."
    },
    {
      icon: <ShoppingBag className="h-8 w-8" />,
      title: "Marketplace",
      description: "Exchange, sell, or donate kids' items with trusted moms in your local area."
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Support Groups",
      description: "Join discussion groups around parenting topics, education, and local resources."
    },
    {
      icon: <MapPin className="h-8 w-8" />,
      title: "Location-Based Matching",
      description: "Smart matching system finds moms nearby with kids of similar ages and shared interests."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="mb-8 flex justify-center">
            <img src={logoFull} alt="Momster Logo" className="w-64 h-64 object-contain" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary leading-tight" style={{ fontFamily: "'Pacifico', cursive" }}>
            Momster
          </h1>
          
          <p className="text-2xl text-foreground mb-8 font-medium">
            Together, moms thrive!
          </p>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with amazing moms in your area. Share experiences, plan playdates, 
            and build lasting friendships in a supportive community.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8">
                Join Momster
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>
              Everything You Need to Connect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Momster brings together all the tools you need to build meaningful 
              connections with other moms in your community.
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
            Ready to Find Your Village?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of moms who have already found their community on Momster.
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-8">
              Get Started Free
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
          <p className="text-muted-foreground mb-2">&copy; 2025 Momster. Built with love for moms everywhere.</p>
          <Link to="/privacy-terms" className="text-sm text-muted-foreground hover:text-primary underline">
            Πολιτική Απορρήτου & Όροι Χρήσης
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
