import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface MicrocopyItem {
  key: string;
  text_el: string;
  text_en: string;
}

interface MicrocopyContextType {
  getText: (key: string, fallback?: string) => string;
  loading: boolean;
  refresh: () => Promise<void>;
}

const MicrocopyContext = createContext<MicrocopyContextType | undefined>(undefined);

export function MicrocopyProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Map<string, MicrocopyItem>>(new Map());
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  const fetchMicrocopy = async () => {
    try {
      const { data, error } = await supabase
        .from("app_microcopy")
        .select("key, text_el, text_en");

      if (error) {
        console.error("Error fetching microcopy:", error);
        return;
      }

      const newMap = new Map<string, MicrocopyItem>();
      data?.forEach((item) => {
        newMap.set(item.key, item);
      });
      setItems(newMap);
    } catch (error) {
      console.error("Error in fetchMicrocopy:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMicrocopy();

    // Subscribe to realtime changes for instant updates
    const channel = supabase
      .channel("microcopy-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_microcopy",
        },
        () => {
          // Refetch on any change
          fetchMicrocopy();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getText = (key: string, fallback?: string): string => {
    const item = items.get(key);
    if (!item) return fallback || key;
    
    const text = language === "el" ? item.text_el : item.text_en;
    return text || fallback || key;
  };

  return (
    <MicrocopyContext.Provider value={{ getText, loading, refresh: fetchMicrocopy }}>
      {children}
    </MicrocopyContext.Provider>
  );
}

export function useMicrocopy() {
  const context = useContext(MicrocopyContext);
  if (context === undefined) {
    // Return a fallback that just returns the key
    return {
      getText: (key: string, fallback?: string) => fallback || key,
      loading: false,
      refresh: async () => {},
    };
  }
  return context;
}
