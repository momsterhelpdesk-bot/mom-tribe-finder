import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={mascot} alt="Momster Mascot" className="h-12 w-12 object-contain" />
          <span className="text-3xl font-bold text-primary" style={{ fontFamily: "'Pacifico', cursive" }}>Momster</span>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
