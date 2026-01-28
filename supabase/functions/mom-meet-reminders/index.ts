import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Checking for upcoming Mom Meets in the next hour...');

    // Get current time and 1 hour from now
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    // Format dates for comparison
    const todayDate = now.toISOString().split('T')[0];
    const oneHourLaterTime = oneHourFromNow.toTimeString().slice(0, 5);

    console.log(`Looking for meets on ${todayDate} between ${oneHourLaterTime} (1 hour window)`);

    // Find Mom Meets happening in approximately 1 hour
    // Using correct column names from mom_meets table: meet_date, meet_time, meet_type, exact_location, creator_id
    const { data: upcomingMeets, error: meetsError } = await supabase
      .from('mom_meets')
      .select(`
        id,
        meet_type,
        meet_date,
        meet_time,
        exact_location,
        area,
        city,
        creator_id
      `)
      .eq('meet_date', todayDate)
      .in('status', ['open', 'full'])
      .gte('meet_time', oneHourLaterTime)
      .lt('meet_time', twoHoursFromNow.toTimeString().slice(0, 5));

    if (meetsError) {
      console.error('Error fetching meets:', meetsError);
      throw meetsError;
    }

    console.log(`Found ${upcomingMeets?.length || 0} upcoming meets`);

    if (!upcomingMeets || upcomingMeets.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No upcoming meets in the next hour', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let notificationsSent = 0;

    for (const meet of upcomingMeets) {
      // Build a descriptive title from meet_type and location
      const meetTitle = `${meet.meet_type} - ${meet.area}`;
      console.log(`Processing meet: ${meetTitle} at ${meet.meet_time}`);

      // Get all confirmed participants for this meet
      const { data: participants, error: participantsError } = await supabase
        .from('mom_meet_participants')
        .select('user_id')
        .eq('mom_meet_id', meet.id)
        .eq('status', 'confirmed');

      if (participantsError) {
        console.error(`Error fetching participants for meet ${meet.id}:`, participantsError);
        continue;
      }

      // Include creator (organizer)
      const allUserIds = [
        meet.creator_id,
        ...(participants?.map(p => p.user_id) || [])
      ];

      // Remove duplicates
      const uniqueUserIds = [...new Set(allUserIds)];

      console.log(`Sending reminders to ${uniqueUserIds.length} users`);

      // Check if we already sent a reminder for this meet (prevent duplicates)
      const { data: existingReminders } = await supabase
        .from('notifications')
        .select('id')
        .eq('type', 'mom_meet_reminder')
        .contains('metadata', { meet_id: meet.id })
        .limit(1);

      if (existingReminders && existingReminders.length > 0) {
        console.log(`Reminder already sent for meet ${meet.id}, skipping`);
        continue;
      }

      // Create notifications for all participants
      const locationText = meet.exact_location || meet.area;
      const notifications = uniqueUserIds.map(userId => ({
        user_id: userId,
        type: 'mom_meet_reminder',
        title: '⏰ Σε 1 ώρα!',
        message: `Το "${meetTitle}" ξεκινάει σε 1 ώρα στις ${meet.meet_time}. Ετοιμάσου! 🏡`,
        icon: '🏡',
        metadata: {
          meet_id: meet.id,
          meet_type: meet.meet_type,
          meet_time: meet.meet_time,
          location: locationText
        }
      }));

      const { error: insertError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (insertError) {
        console.error(`Error inserting notifications for meet ${meet.id}:`, insertError);
      } else {
        notificationsSent += notifications.length;
        console.log(`Sent ${notifications.length} reminders for meet ${meet.id}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${upcomingMeets.length} meets`, 
        sent: notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in mom-meet-reminders:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
