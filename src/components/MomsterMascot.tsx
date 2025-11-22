import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import mascot from "@/assets/mascot.jpg";
import { cn } from "@/lib/utils";

export type MascotState = "happy" | "idle" | "searching";

interface MomsterMascotProps {
  state: MascotState;
  message: string;
  visible: boolean;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
  duration?: number;
  onHide?: () => void;
}

const getAnimationClass = (state: MascotState) => {
  switch (state) {
    case "happy":
      return "animate-bounce";
    case "searching":
      return "animate-pulse";
    case "idle":
    default:
      return "";
  }
};

const getEmoji = (state: MascotState) => {
  switch (state) {
    case "happy":
      return "💖";
    case "searching":
      return "🔍";
    case "idle":
    default:
      return "☕";
  }
};

export default function MomsterMascot({
  state,
  message,
  visible,
  showButton,
  buttonText,
  onButtonClick,
  duration = 2500,
  onHide,
}: MomsterMascotProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (visible) {
      setIsShowing(true);
      
      if (duration > 0 && !showButton) {
        const timer = setTimeout(() => {
          setIsShowing(false);
          onHide?.();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    } else {
      setIsShowing(false);
    }
  }, [visible, duration, showButton, onHide]);

  if (!isShowing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-60 animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          >
            {i % 4 === 0 ? '💕' : i % 4 === 1 ? '💖' : i % 4 === 2 ? '🌸' : '✨'}
          </div>
        ))}
      </div>

      {/* Main popup card */}
      <div 
        className="relative max-w-md w-full animate-[scale-in_0.4s_ease-out]"
        style={{
          borderRadius: '28px',
        }}
      >
        {/* Corner mascots - positioned outside the card */}
        <div className="absolute -top-6 -left-6 z-10 animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
          <img src={mascot} alt="Corner Mascot" className="w-12 h-12 object-contain drop-shadow-lg" />
        </div>
        <div className="absolute -top-6 -right-6 z-10 animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '2.2s' }}>
          <img src={mascot} alt="Corner Mascot" className="w-12 h-12 object-contain drop-shadow-lg" />
        </div>
        <div className="absolute -bottom-6 -left-6 z-10 animate-bounce" style={{ animationDelay: '0.6s', animationDuration: '2.4s' }}>
          <img src={mascot} alt="Corner Mascot" className="w-10 h-10 object-contain drop-shadow-lg" />
        </div>
        <div className="absolute -bottom-6 -right-6 z-10 animate-bounce" style={{ animationDelay: '0.9s', animationDuration: '2.6s' }}>
          <img src={mascot} alt="Corner Mascot" className="w-10 h-10 object-contain drop-shadow-lg" />
        </div>
        
        {/* Side mascots */}
        <div className="absolute top-1/2 -left-8 -translate-y-1/2 z-10 animate-pulse" style={{ animationDelay: '0.2s' }}>
          <img src={mascot} alt="Side Mascot" className="w-10 h-10 object-contain drop-shadow-lg" />
        </div>
        <div className="absolute top-1/2 -right-8 -translate-y-1/2 z-10 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <img src={mascot} alt="Side Mascot" className="w-10 h-10 object-contain drop-shadow-lg" />
        </div>

        {/* Inner white border */}
        <div 
          className="absolute inset-0 rounded-[28px] border-4 border-white pointer-events-none z-[1]"
          style={{ boxShadow: '0 8px 32px rgba(255, 105, 180, 0.3)' }}
        />
        
        {/* Main card content */}
        <Card 
          className="relative p-8 border-none shadow-2xl overflow-hidden"
          style={{
            background: '#FFE8F2',
            borderRadius: '28px',
          }}
        >
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-300/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl" />
          
          <div className="flex flex-col items-center text-center space-y-5 relative z-10">
            {/* Main mascot with floating effect */}
            <div className="relative animate-[bounce_3s_ease-in-out_infinite]">
              <img
                src={mascot}
                alt="Momster Mascot"
                className="w-28 h-28 object-contain drop-shadow-2xl"
              />
              <span className="absolute -top-2 -right-2 text-5xl animate-bounce drop-shadow-lg">
                {getEmoji(state)}
              </span>
              
              {/* Sparkles around main mascot */}
              <span className="absolute top-0 left-0 text-2xl animate-ping">✨</span>
              <span className="absolute bottom-0 right-0 text-2xl animate-ping" style={{ animationDelay: '0.5s' }}>✨</span>
            </div>
            
            <p 
              className="text-xl font-bold text-pink-900 leading-relaxed px-4"
              style={{ fontFamily: "'Pacifico', cursive" }}
            >
              {message}
            </p>

            {showButton && buttonText && (
              <Button
                onClick={() => {
                  setIsShowing(false);
                  onButtonClick?.();
                }}
                className="w-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-500 hover:via-rose-500 hover:to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all rounded-full text-base py-6"
                size="lg"
              >
                {buttonText} 💕
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
