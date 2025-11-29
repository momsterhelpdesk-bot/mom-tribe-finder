import { Button } from "@/components/ui/button";
import mascot from "@/assets/mascot.jpg";

interface MomsterPopupProps {
  title: string;
  subtitle: string;
  bullets?: string[];
  buttonText: string;
  onButtonClick: () => void;
  visible: boolean;
}

export default function MomsterPopup({
  title,
  subtitle,
  bullets,
  buttonText,
  onButtonClick,
  visible,
}: MomsterPopupProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-[90%] max-w-[420px] flex flex-col items-center"
        style={{
          backgroundColor: "#F8E9EE",
          borderRadius: "28px",
          padding: "28px 22px",
          boxShadow: "0 6px 22px rgba(0,0,0,0.08)",
        }}
      >
        {/* Mascot top right */}
        <img
          src={mascot}
          alt="Momster Mascot"
          className="absolute animate-bounce"
          style={{
            top: "-12px",
            right: "-12px",
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            backgroundColor: "rgba(243, 220, 229, 0.35)",
            padding: "8px",
            boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
            transform: "rotate(5deg)",
            animationDuration: "2s",
          }}
        />

        {/* Title */}
        <h2
          className="text-center font-bold mt-3 mb-2.5"
          style={{
            fontSize: "22px",
            color: "#C06B8E",
          }}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          className="text-center mb-5"
          style={{
            fontSize: "15px",
            lineHeight: "1.45",
            color: "#9C6A7A",
          }}
        >
          {subtitle}
        </p>

        {/* Optional Bullets */}
        {bullets && bullets.length > 0 && (
          <div
            className="mb-4 text-center whitespace-pre-line"
            style={{
              fontSize: "15px",
              color: "#7F4F5B",
            }}
          >
            {bullets.map((bullet, index) => (
              <div key={index} className="mb-1">
                {bullet}
              </div>
            ))}
          </div>
        )}

        {/* Button */}
        <Button
          onClick={onButtonClick}
          className="w-full transition-all hover:scale-[1.02]"
          style={{
            padding: "14px",
            borderRadius: "22px",
            backgroundColor: "#E9C4D4",
            color: "#7A4660",
            fontSize: "16px",
            fontWeight: "600",
            border: "none",
            boxShadow: "0 3px 12px rgba(0,0,0,0.10)",
          }}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
