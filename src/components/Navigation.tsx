import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import mascot from "@/assets/mascot.jpg";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src={mascot} alt="Momster Mascot" className="h-10 w-10 object-contain" />
          <span className="text-2xl md:text-3xl font-bold text-primary whitespace-nowrap" style={{ fontFamily: "'Pacifico', cursive" }}>Momster</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <Link to="/auth">
            <Button variant="outline" size="sm" className="md:text-base">Sign In</Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="md:text-base">Get Started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
