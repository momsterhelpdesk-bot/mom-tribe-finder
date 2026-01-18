import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SmartReplySuggestionsProps {
  lastMessage: string;
  onSelect: (reply: string) => void;
  senderName?: string;
}

export default function SmartReplySuggestions({ 
  lastMessage, 
  onSelect,
  senderName 
}: SmartReplySuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [lastProcessedMessage, setLastProcessedMessage] = useState("");

  useEffect(() => {
    // Only generate suggestions for new messages
    if (lastMessage && lastMessage !== lastProcessedMessage && !dismissed) {
      generateSuggestions();
      setLastProcessedMessage(lastMessage);
    }
  }, [lastMessage]);

  const generateSuggestions = async () => {
    if (!lastMessage || lastMessage.length < 5) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-smart-reply', {
        body: { 
          message: lastMessage,
          senderName 
        }
      });

      if (error) throw error;
      
      if (data?.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions.slice(0, 3));
      }
    } catch (error) {
      console.error('Smart reply error:', error);
      // Fallback suggestions
      setSuggestions(getFallbackSuggestions(lastMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackSuggestions = (message: string): string[] => {
    const lowerMessage = message.toLowerCase();
    
    // Context-based fallbacks
    if (lowerMessage.includes('πώς') || lowerMessage.includes('τι κάνε')) {
      return ['Καλά είμαι, εσύ; 😊', 'Όλα καλά! Λίγο κουρασμένη 😴', 'Τέλεια! Πώς είναι το μικρό; 💕'];
    }
    if (lowerMessage.includes('καφέ') || lowerMessage.includes('βρεθ')) {
      return ['Ναι! Πότε σε βολεύει; ☕', 'Τέλεια ιδέα! 💕', 'Φυσικά! Πες μου πότε 🌸'];
    }
    if (lowerMessage.includes('playdate')) {
      return ['Τέλεια! Ποια μέρα; 🧸', 'Ναι ναι ναι! 🎉', 'Μου αρέσει η ιδέα! 💕'];
    }
    if (lowerMessage.includes('ύπνο') || lowerMessage.includes('κοιμ')) {
      return ['Κουράγιο μαμά! 💪', 'Σε καταλαβαίνω απόλυτα! 😴', 'Θα περάσει, υπομονή! 🌸'];
    }
    if (lowerMessage.includes('ευχαριστώ') || lowerMessage.includes('thanks')) {
      return ['Τίποτα! 💕', 'Με χαρά! 🌸', 'Να είσαι καλά! 😊'];
    }
    
    // Generic positive responses
    return ['Τέλεια! 💕', 'Ναι! 😊', 'Συμφωνώ! 🌸'];
  };

  const handleSelect = (reply: string) => {
    onSelect(reply);
    setDismissed(true);
    setSuggestions([]);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setSuggestions([]);
  };

  // Reset dismissed state when a new message comes in
  useEffect(() => {
    if (lastMessage !== lastProcessedMessage) {
      setDismissed(false);
    }
  }, [lastMessage, lastProcessedMessage]);

  if (suggestions.length === 0 && !isLoading) return null;
  if (dismissed) return null;

  return (
    <div className="px-4 py-2 bg-gradient-to-r from-primary/5 to-secondary/10 border-t border-primary/10">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Έξυπνες απαντήσεις</span>
        </div>
        <button 
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-1">
        {isLoading ? (
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className="h-8 w-24 bg-muted/50 rounded-full animate-pulse"
              />
            ))}
          </div>
        ) : (
          suggestions.map((suggestion, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto py-1.5 px-3 text-xs whitespace-nowrap rounded-full border-primary/30 hover:bg-primary/10 hover:border-primary/50 flex-shrink-0"
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
