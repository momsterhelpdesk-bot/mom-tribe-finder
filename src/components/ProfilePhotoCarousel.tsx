import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfilePhotoCarouselProps {
  photos: string[];
  profileName: string;
  onImageClick?: () => void;
  className?: string;
}

export function ProfilePhotoCarousel({
  photos,
  profileName,
  onImageClick,
  className,
}: ProfilePhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  
  // Ensure we have at least one photo
  const displayPhotos = photos.length > 0 ? photos : ["https://i.pravatar.cc/400"];

  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
    };
    
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollPrev();
  };

  const scrollNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollNext();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {displayPhotos.map((photo, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0">
              <img
                src={photo}
                alt={`${profileName} - Photo ${index + 1}`}
                className="w-full h-56 object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageClick?.();
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://i.pravatar.cc/400";
                }}
              />
            </div>
          ))}
        </div>
      </div>
      
      {displayPhotos.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white rounded-full shadow-md z-10 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-white/80 hover:bg-white rounded-full shadow-md z-10 flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
      
      {/* Dot indicators */}
      {displayPhotos.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {displayPhotos.map((_, index) => (
            <div
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
