import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, senderName } = await req.json();
    
    if (!message || message.length < 3) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ suggestions: getFallbackSuggestions(message) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Είσαι βοηθός για μια εφαρμογή μαμάδων (Momster). Δημιούργησε 3 σύντομες, φιλικές απαντήσεις στα ελληνικά για ένα μήνυμα από άλλη μαμά.

Κανόνες:
- Κάθε απάντηση να είναι 2-6 λέξεις μέγιστο
- Χρησιμοποίησε emojis (1-2 ανά απάντηση)
- Να είναι ζεστές, υποστηρικτικές, μαμαδίστικες
- Να ταιριάζουν στο context του μηνύματος
- Μην επαναλαμβάνεις τις ίδιες απαντήσεις`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Η ${senderName || 'μαμά'} έστειλε: "${message}"\n\nΔώσε 3 γρήγορες απαντήσεις.` }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_replies",
              description: "Return 3 short, friendly reply suggestions",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of 3 short reply suggestions in Greek with emojis"
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_replies" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log("Rate limited, using fallback");
        return new Response(
          JSON.stringify({ suggestions: getFallbackSuggestions(message) }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract suggestions from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const args = JSON.parse(toolCall.function.arguments);
      return new Response(
        JSON.stringify({ suggestions: args.suggestions || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({ suggestions: getFallbackSuggestions(message) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Smart reply error:", error);
    return new Response(
      JSON.stringify({ suggestions: ["Τέλεια! 💕", "Ναι! 😊", "Συμφωνώ! 🌸"] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getFallbackSuggestions(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('πώς') || lowerMessage.includes('τι κάνε')) {
    return ['Καλά είμαι! 😊', 'Όλα καλά! 💕', 'Τέλεια, εσύ; 🌸'];
  }
  if (lowerMessage.includes('καφέ') || lowerMessage.includes('βρεθ')) {
    return ['Ναι πότε; ☕', 'Τέλεια ιδέα! 💕', 'Φυσικά! 🌸'];
  }
  if (lowerMessage.includes('playdate')) {
    return ['Τέλεια! 🧸', 'Ναι ναι! 🎉', 'Πες μου πότε! 💕'];
  }
  if (lowerMessage.includes('ύπνο') || lowerMessage.includes('κοιμ')) {
    return ['Κουράγιο! 💪', 'Σε νιώθω! 😴', 'Θα περάσει! 🌸'];
  }
  if (lowerMessage.includes('ευχαριστώ')) {
    return ['Τίποτα! 💕', 'Με χαρά! 🌸', 'Να είσαι καλά! 😊'];
  }
  
  return ['Τέλεια! 💕', 'Ναι! 😊', 'Συμφωνώ! 🌸'];
}
