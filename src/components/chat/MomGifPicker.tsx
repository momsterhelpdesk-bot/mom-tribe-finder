import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ImageIcon } from "lucide-react";

interface MomGifPickerProps {
  onSelect: (gifUrl: string) => void;
}

// Curated mom-themed GIF categories
const MOM_GIFS = {
  reactions: [
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDd6Y3k4b3U4c2V3NXE0NzBxYnI2dTN0Y3J1dTV6ZXZjM2FhNGRhaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6QX5pnqM/giphy.gif", label: "Χαρά" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzFiNDhjNzNmNjQxNTA1MTQ1ZjdmZmM5OGE1ZmQwZjQzNjFhMjBlZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oriO0OEd9QIDdllqo/giphy.gif", label: "Αγκαλιά" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcW5wMGE0MWRrOGQ4ZnZoaXVwNDVwNHBmcXI2NW8yd2Q2aXJocGcwNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/dIxkmtCuuBQuM9Usto/giphy.gif", label: "Κουρασμένη" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbmVpcW9rZTN0NnNwNm9xdGQ0c2JtMjZkdWQ4dWI4ODFqMnl0cnR4aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4cqiYI30juCOGY/giphy.gif", label: "Γέλιο" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRhM2JiZmI4NTI5OGY0NTk0OWQzMjcxNDdlODRjNjdjNDk0ZTg1NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0INyCmHlNylks9O/giphy.gif", label: "Φιλί" },
  ],
  coffee: [
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnl3c3FnOWFzNmxzbWFhZ2l6c2RjOG1xeXBocHFmOWRjdGQ2bjQzZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/L0aWDywDu1ziw/giphy.gif", label: "Καφές" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejNqaTJmN2N0Z3BieGNsam5mNWswMzQ5cjA3bmJxdmlzN2R4MG5jZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Zw3oBUuOlDJ3W/giphy.gif", label: "Πρωινός καφές" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTdnNjVmc2NpMGZqeHl0MmxtN2NnNGo4YmVoOWtlbmh2ZTI1M2VqbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fH985LNdqFZXOFHygK/giphy.gif", label: "Ζεστό ρόφημα" },
  ],
  baby: [
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajFvNXg1cnR5NXJ0OXc4NTRwbWxiazRlNzNvbWV5ZHFsMnB5NG10biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/feprHmU8HDynjNjFTM/giphy.gif", label: "Μωράκι" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDlwdnRjMWNmejk2dWp3eGNtcXNkOXdtdmt4ZnFicnl1eHN4YnpxZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kgKrO1A3JbWTK/giphy.gif", label: "Παιχνίδι" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYjdxMGViYWI4Y2M0Zzc2Y2w1ZXJ1YWp0dGg2YXVjNHB6MHI0NWQ3bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/VbnUQpnihPSIgIXuZv/giphy.gif", label: "Νυσταγμένο" },
  ],
  parenting: [
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXR3NXl3OWFtYmoxdGJqeHViY2p2eWZ1bnZxNWNraWsxcmJ5bjM4MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ule4vhcY1xEKQ/giphy.gif", label: "Μαμά power" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGxqcmJxMmlpMzY3d284dDgwd2MwdnNnaWl6OWZmMWN4YWl6YjgwciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT5LMHxhOfscxPfIfm/giphy.gif", label: "Χάος" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTd0N3VyNmRwMHd4ajQxOWVpYXR3eW1wc3ByN3BmMjZ0NHl2c3d3MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wpoLqr5FT1sY0/giphy.gif", label: "You got this" },
  ],
  love: [
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejR5Z2xpNnN6aXE2Y3k2cTRnODJyb3F6NGJxbWRjYmkzd2F0a2pjMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4pTdcifPZLpDjL1e/giphy.gif", label: "Καρδούλες" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2dncDBmaWQ0NjFqMGF6dWMwbXd4YWJycm5zb2lneTU5azhwb3IybCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRv0ThflsHCqDrG/giphy.gif", label: "Love" },
    { url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnN5cHY1dTBwOGdzZWF0djBhdXd5bDFtaHpodXFlbGhvYjZkNXZhNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlvtIPzPdt2usKs/giphy.gif", label: "BFF" },
  ],
};

const CATEGORIES = [
  { key: "reactions", label: "😊", name: "Αντιδράσεις" },
  { key: "coffee", label: "☕", name: "Καφές" },
  { key: "baby", label: "👶", name: "Μωρά" },
  { key: "parenting", label: "🦸‍♀️", name: "Μαμά" },
  { key: "love", label: "💕", name: "Αγάπη" },
] as const;

export default function MomGifPicker({ onSelect }: MomGifPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<keyof typeof MOM_GIFS>("reactions");

  const handleSelect = (gifUrl: string) => {
    onSelect(gifUrl);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
          <ImageIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        side="top" 
        align="start"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Μαμαδίστικα GIFs 🌸</p>
          <div className="flex gap-1">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.key}
                variant={activeCategory === cat.key ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setActiveCategory(cat.key)}
                title={cat.name}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
        
        <ScrollArea className="h-48">
          <div className="p-2 grid grid-cols-3 gap-2">
            {MOM_GIFS[activeCategory].map((gif, index) => (
              <button
                key={index}
                onClick={() => handleSelect(gif.url)}
                className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all group"
              >
                <img
                  src={gif.url}
                  alt={gif.label}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-x-0 bottom-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white px-1">{gif.label}</span>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
