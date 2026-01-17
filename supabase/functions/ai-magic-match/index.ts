import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileData {
  id: string;
  full_name: string;
  profile_photo_url: string | null;
  city: string;
  area: string;
  interests: string[] | null;
  child_age_group?: string;
  children?: { age: string; gender: string; name?: string }[];
  bio?: string;
  last_seen_at?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { currentProfile, potentialMatches, language } = await req.json();

    if (!currentProfile || !potentialMatches || potentialMatches.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No profiles available", 
          matches: [],
          noProfiles: true 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for AI analysis
    const systemPrompt = `You are a friendly matchmaking assistant for a mom community app called Momster. 
Your job is to analyze mom profiles and find the BEST available match based on life stage, mood, and compatibility.

CRITICAL RULES:
- ALWAYS select a match from the list - never say "no match found"
- Never mention "AI" or "algorithm" - speak as if you're a caring friend who knows both moms
- Generate warm, human reasons for the match in ${language === 'el' ? 'Greek' : 'English'}
- Focus on emotional connection, not technical scores
- Even if compatibility seems low, find SOMETHING positive to highlight
- Scores can range from 60-100: 60-75 = potential connection, 75-85 = good match, 85+ = great match

Reason examples (${language === 'el' ? 'Greek' : 'English'}):
${language === 'el' ? `
- "Τα παιδιά σας είναι στην ίδια ηλικία - θα έχετε πολλά να μοιραστείτε!"
- "Φαίνεται να έχετε παρόμοιο mood τελευταία 🌸"
- "Είστε και οι δύο online συχνά τις ίδιες ώρες"
- "Μοιράζεστε την αγάπη για [interest] - τέλεια αφορμή για καφεδάκι!"
- "Είστε στην ίδια γειτονιά - ποτέ δεν ξέρεις!"
- "Μπορεί να σας εκπλήξει αυτή η γνωριμία 💫"
` : `
- "Your kids are the same age - you'll have so much to share!"
- "You seem to have a similar mood lately 🌸"
- "You're both online around the same times"
- "You share a love for [interest] - perfect excuse for coffee!"
- "You're in the same neighborhood - you never know!"
- "This connection might surprise you 💫"
`}`;

    const userPrompt = `Analyze these mom profiles and find the BEST match for the current user.

CURRENT MOM:
- Name: ${currentProfile.full_name}
- Location: ${currentProfile.area}, ${currentProfile.city}
- Interests: ${(currentProfile.interests || []).join(', ') || 'Not specified'}
- Child info: ${currentProfile.child_age_group || 'Not specified'}
- Bio: ${currentProfile.bio || 'Not specified'}
- Last active: ${currentProfile.last_seen_at || 'Recently'}

POTENTIAL MATCHES:
${potentialMatches.slice(0, 10).map((p: ProfileData, i: number) => `
${i + 1}. ${p.full_name}
   - Location: ${p.area}, ${p.city}
   - Interests: ${(p.interests || []).join(', ') || 'Not specified'}
   - Child info: ${p.child_age_group || 'Not specified'}
   - Bio: ${p.bio || 'Not specified'}
   - Last active: ${p.last_seen_at || 'Recently'}
`).join('\n')}

Return the TOP match with warm, human reasons for why they'd connect well.`;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "select_best_match",
              description: "Select the best matching mom and provide warm, human reasons",
              parameters: {
                type: "object",
                properties: {
                  selectedProfileIndex: {
                    type: "number",
                    description: "Index (1-based) of the best matching profile from the list"
                  },
                  matchScore: {
                    type: "number",
                    description: "Compatibility score from 60-100. Give higher scores (85+) for great matches, but always find SOMEONE even if score is lower (60-75)."
                  },
                  primaryReason: {
                    type: "string",
                    description: "The main warm, human reason for the match (e.g., 'Τα παιδιά σας είναι στην ίδια φάση!')"
                  },
                  secondaryReasons: {
                    type: "array",
                    items: { type: "string" },
                    description: "2-3 additional short reasons for the match"
                  },
                  matchType: {
                    type: "string",
                    enum: ["same_stage", "similar_mood", "common_schedule", "shared_interests", "nearby_vibes"],
                    description: "The main type of connection"
                  }
                },
                required: ["selectedProfileIndex", "matchScore", "primaryReason", "secondaryReasons", "matchType"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "select_best_match" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Fallback to first available match if AI fails
      const fallbackProfile = potentialMatches[0];
      const fallbackReason = language === 'el' 
        ? "Είστε στην ίδια πόλη — ίσως να έχετε περισσότερα κοινά απ' όσο νομίζετε! 🌸"
        : "You're in the same city — you might have more in common than you think! 🌸";
      
      return new Response(
        JSON.stringify({ 
          selectedProfile: fallbackProfile,
          matchScore: 70,
          primaryReason: fallbackReason,
          secondaryReasons: [
            language === 'el' ? "Μπορεί να σας εκπλήξει!" : "They might surprise you!"
          ],
          matchType: "nearby_vibes",
          fallback: true
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    console.log("AI response:", JSON.stringify(data));

    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    const selectedIndex = result.selectedProfileIndex - 1; // Convert to 0-based
    const selectedProfile = potentialMatches[selectedIndex] || potentialMatches[0];

    return new Response(
      JSON.stringify({
        selectedProfile,
        matchScore: result.matchScore,
        primaryReason: result.primaryReason,
        secondaryReasons: result.secondaryReasons || [],
        matchType: result.matchType
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in ai-magic-match:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});