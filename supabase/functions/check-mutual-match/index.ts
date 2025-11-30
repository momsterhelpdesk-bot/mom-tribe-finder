import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { fromUserId, toUserId, choice } = await req.json();

    console.log('Checking mutual match:', { fromUserId, toUserId, choice });

    // Insert or update the swipe
    const { error: swipeError } = await supabaseClient
      .from('swipes')
      .upsert({
        from_user_id: fromUserId,
        to_user_id: toUserId,
        choice: choice
      }, {
        onConflict: 'from_user_id,to_user_id'
      });

    if (swipeError) {
      console.error('Error saving swipe:', swipeError);
      throw swipeError;
    }

    // If this was a "yes", check for mutual match
    if (choice === 'yes') {
      // Check if the other user also swiped yes
      const { data: reciprocalSwipe, error: reciprocalError } = await supabaseClient
        .from('swipes')
        .select('*')
        .eq('from_user_id', toUserId)
        .eq('to_user_id', fromUserId)
        .eq('choice', 'yes')
        .maybeSingle();

      if (reciprocalError) {
        console.error('Error checking reciprocal swipe:', reciprocalError);
        throw reciprocalError;
      }

      console.log('Reciprocal swipe:', reciprocalSwipe);

      // If mutual match exists
      if (reciprocalSwipe) {
        console.log('Mutual match found!');

        // Check if match already exists
        const { data: existingMatch } = await supabaseClient
          .from('matches')
          .select('id')
          .or(`and(user1_id.eq.${fromUserId},user2_id.eq.${toUserId}),and(user1_id.eq.${toUserId},user2_id.eq.${fromUserId})`)
          .maybeSingle();

        if (!existingMatch) {
          // Create match
          const { data: newMatch, error: matchError } = await supabaseClient
            .from('matches')
            .insert({
              user1_id: fromUserId,
              user2_id: toUserId,
              last_message_at: new Date().toISOString()
            })
            .select()
            .single();

          if (matchError) {
            console.error('Error creating match:', matchError);
            throw matchError;
          }

          console.log('Match created:', newMatch);

          // Get both users' profiles
          const { data: fromUserProfile } = await supabaseClient
            .from('profiles')
            .select('full_name')
            .eq('id', fromUserId)
            .single();

          const { data: toUserProfile } = await supabaseClient
            .from('profiles')
            .select('full_name')
            .eq('id', toUserId)
            .single();

          // Create notifications for both users
          const notifications = [
            {
              user_id: fromUserId,
              type: 'match',
              title: 'Νέο Match! 💕',
              message: `Έχεις νέο match με την ${toUserProfile?.full_name}!`,
              icon: '💕',
              metadata: {
                match_id: newMatch.id,
                other_user_id: toUserId,
                other_user_name: toUserProfile?.full_name
              }
            },
            {
              user_id: toUserId,
              type: 'match',
              title: 'Νέο Match! 💕',
              message: `Έχεις νέο match με την ${fromUserProfile?.full_name}!`,
              icon: '💕',
              metadata: {
                match_id: newMatch.id,
                other_user_id: fromUserId,
                other_user_name: fromUserProfile?.full_name
              }
            }
          ];

          const { error: notificationError } = await supabaseClient
            .from('notifications')
            .insert(notifications);

          if (notificationError) {
            console.error('Error creating notifications:', notificationError);
          }

          return new Response(
            JSON.stringify({ 
              mutualMatch: true, 
              matchId: newMatch.id,
              otherUserName: toUserProfile?.full_name
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
          );
        }
      }
    }

    return new Response(
      JSON.stringify({ mutualMatch: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in check-mutual-match:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});