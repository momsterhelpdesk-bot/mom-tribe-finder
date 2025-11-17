import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sparkles } from "lucide-react";

export interface AvatarConfig {
  hairstyle: string;
  skinTone: string;
  outfit: string;
  accessories: string;
  background: string;
}

interface AvatarBuilderProps {
  onSave: (config: AvatarConfig) => void;
  onCancel: () => void;
  initialConfig?: AvatarConfig;
}

const HAIRSTYLES = [
  { id: "long", label: "Long Hair", emoji: "👩" },
  { id: "short", label: "Short Hair", emoji: "👩‍🦱" },
  { id: "ponytail", label: "Ponytail", emoji: "👱‍♀️" },
  { id: "bun", label: "Bun", emoji: "👩‍🦰" },
  { id: "hat", label: "Hat", emoji: "🧢" },
];

const SKIN_TONES = [
  { id: "light", label: "Light", color: "hsl(24, 43%, 97%)" },
  { id: "fair", label: "Fair", color: "hsl(35, 46%, 85%)" },
  { id: "medium", label: "Medium", color: "hsl(30, 45%, 70%)" },
  { id: "tan", label: "Tan", color: "hsl(25, 40%, 60%)" },
  { id: "deep", label: "Deep", color: "hsl(20, 35%, 45%)" },
];

const OUTFITS = [
  { id: "casual", label: "Casual", emoji: "👕" },
  { id: "cozy", label: "Cozy", emoji: "🧥" },
  { id: "work", label: "Work", emoji: "👔" },
  { id: "nightwear", label: "Nightwear", emoji: "🌙" },
];

const ACCESSORIES = [
  { id: "none", label: "None", emoji: "✨" },
  { id: "glasses", label: "Glasses", emoji: "👓" },
  { id: "headband", label: "Headband", emoji: "🎀" },
  { id: "scarf", label: "Scarf", emoji: "🧣" },
  { id: "bag", label: "Bag", emoji: "👜" },
];

const BACKGROUNDS = [
  { id: "pastel", label: "Pastel Circle", gradient: "linear-gradient(135deg, hsl(343, 47%, 88%), hsl(0, 35%, 75%))" },
  { id: "floral", label: "Floral", gradient: "linear-gradient(135deg, hsl(24, 43%, 97%), hsl(343, 47%, 92%))" },
  { id: "sparkles", label: "Sparkles", gradient: "linear-gradient(135deg, hsl(35, 46%, 68%), hsl(0, 35%, 75%))" },
];

export const AvatarBuilder = ({ onSave, onCancel, initialConfig }: AvatarBuilderProps) => {
  const [config, setConfig] = useState<AvatarConfig>(
    initialConfig || {
      hairstyle: "long",
      skinTone: "fair",
      outfit: "casual",
      accessories: "none",
      background: "pastel",
    }
  );

  const renderAvatar = () => {
    const hairstyle = HAIRSTYLES.find(h => h.id === config.hairstyle)?.emoji || "👩";
    const outfit = OUTFITS.find(o => o.id === config.outfit)?.emoji || "👕";
    const accessory = ACCESSORIES.find(a => a.id === config.accessories)?.emoji || "";
    const skinColor = SKIN_TONES.find(s => s.id === config.skinTone)?.color || "hsl(35, 46%, 85%)";
    const background = BACKGROUNDS.find(b => b.id === config.background)?.gradient || "";

    return (
      <div 
        className="w-48 h-48 mx-auto rounded-full flex items-center justify-center text-7xl shadow-lg mb-6"
        style={{ background, backgroundColor: skinColor }}
      >
        <div className="flex flex-col items-center gap-1">
          <span>{hairstyle}</span>
          <span className="text-3xl">{outfit}</span>
          {accessory && <span className="text-2xl">{accessory}</span>}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Create Your Momster Avatar</h2>
      </div>
      
      {renderAvatar()}

      <div className="space-y-6">
        {/* Hairstyle */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Hairstyle</Label>
          <RadioGroup
            value={config.hairstyle}
            onValueChange={(value) => setConfig({ ...config, hairstyle: value })}
            className="grid grid-cols-5 gap-2"
          >
            {HAIRSTYLES.map((style) => (
              <div key={style.id} className="flex flex-col items-center">
                <RadioGroupItem value={style.id} id={style.id} className="sr-only" />
                <Label
                  htmlFor={style.id}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    config.hairstyle === style.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{style.emoji}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Skin Tone */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Skin Tone</Label>
          <RadioGroup
            value={config.skinTone}
            onValueChange={(value) => setConfig({ ...config, skinTone: value })}
            className="flex gap-3"
          >
            {SKIN_TONES.map((tone) => (
              <div key={tone.id}>
                <RadioGroupItem value={tone.id} id={tone.id} className="sr-only" />
                <Label
                  htmlFor={tone.id}
                  className={`cursor-pointer w-12 h-12 rounded-full border-4 block transition-all ${
                    config.skinTone === tone.id
                      ? "border-primary scale-110"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ backgroundColor: tone.color }}
                />
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Outfit */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Outfit</Label>
          <RadioGroup
            value={config.outfit}
            onValueChange={(value) => setConfig({ ...config, outfit: value })}
            className="grid grid-cols-4 gap-2"
          >
            {OUTFITS.map((outfit) => (
              <div key={outfit.id} className="flex flex-col items-center">
                <RadioGroupItem value={outfit.id} id={outfit.id} className="sr-only" />
                <Label
                  htmlFor={outfit.id}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    config.outfit === outfit.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{outfit.emoji}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Accessories */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Accessories</Label>
          <RadioGroup
            value={config.accessories}
            onValueChange={(value) => setConfig({ ...config, accessories: value })}
            className="grid grid-cols-5 gap-2"
          >
            {ACCESSORIES.map((acc) => (
              <div key={acc.id} className="flex flex-col items-center">
                <RadioGroupItem value={acc.id} id={acc.id} className="sr-only" />
                <Label
                  htmlFor={acc.id}
                  className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                    config.accessories === acc.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-3xl">{acc.emoji}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Background */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Background / Frame</Label>
          <RadioGroup
            value={config.background}
            onValueChange={(value) => setConfig({ ...config, background: value })}
            className="grid grid-cols-3 gap-3"
          >
            {BACKGROUNDS.map((bg) => (
              <div key={bg.id}>
                <RadioGroupItem value={bg.id} id={bg.id} className="sr-only" />
                <Label
                  htmlFor={bg.id}
                  className={`cursor-pointer h-16 rounded-lg border-4 block transition-all ${
                    config.background === bg.id
                      ? "border-primary scale-105"
                      : "border-border hover:border-primary/50"
                  }`}
                  style={{ background: bg.gradient }}
                />
                <p className="text-xs text-center mt-1 text-muted-foreground">{bg.label}</p>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={() => onSave(config)} className="flex-1">
          Save Avatar
        </Button>
      </div>
    </Card>
  );
};
