import { AvatarConfig } from "./AvatarBuilder";

interface AvatarDisplayProps {
  config: AvatarConfig;
  size?: "sm" | "md" | "lg";
}

const HAIRSTYLES = {
  "long": "👩",
  "short": "👩‍🦱",
  "ponytail": "👱‍♀️",
  "bun": "👩‍🦰",
  "hat": "🧢"
};

const SKIN_TONES = {
  "light": "hsl(24, 43%, 97%)",
  "fair": "hsl(35, 46%, 85%)",
  "medium": "hsl(30, 45%, 70%)",
  "tan": "hsl(25, 40%, 60%)",
  "deep": "hsl(20, 35%, 45%)"
};

const OUTFITS = {
  "casual": "👕",
  "cozy": "🧥",
  "work": "👔",
  "nightwear": "🌙"
};

const ACCESSORIES = {
  "none": "",
  "glasses": "👓",
  "headband": "🎀",
  "scarf": "🧣",
  "bag": "👜"
};

const BACKGROUNDS = {
  "pastel": "linear-gradient(135deg, hsl(343, 47%, 88%), hsl(0, 35%, 75%))",
  "floral": "linear-gradient(135deg, hsl(24, 43%, 97%), hsl(343, 47%, 92%))",
  "sparkles": "linear-gradient(135deg, hsl(35, 46%, 68%), hsl(0, 35%, 75%))"
};

export const AvatarDisplay = ({ config, size = "md" }: AvatarDisplayProps) => {
  const sizeClasses = {
    sm: "w-24 h-24 text-3xl",
    md: "w-48 h-48 text-7xl",
    lg: "w-64 h-64 text-8xl"
  };

  const hairstyle = HAIRSTYLES[config.hairstyle as keyof typeof HAIRSTYLES] || "👩";
  const outfit = OUTFITS[config.outfit as keyof typeof OUTFITS] || "👕";
  const accessory = ACCESSORIES[config.accessories as keyof typeof ACCESSORIES] || "";
  const skinColor = SKIN_TONES[config.skinTone as keyof typeof SKIN_TONES] || "hsl(35, 46%, 85%)";
  const background = BACKGROUNDS[config.background as keyof typeof BACKGROUNDS] || "";

  return (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center shadow-lg`}
      style={{ background, backgroundColor: skinColor }}
    >
      <div className="flex flex-col items-center gap-1">
        <span>{hairstyle}</span>
        <span className={size === "lg" ? "text-4xl" : "text-3xl"}>{outfit}</span>
        {accessory && <span className={size === "lg" ? "text-3xl" : "text-2xl"}>{accessory}</span>}
      </div>
    </div>
  );
};
