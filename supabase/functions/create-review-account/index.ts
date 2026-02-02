import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';

type CreateReviewAccountResponse = {
  success: boolean;
  email: string;
  password: string;
  userId: string;
  message: string;
};

const REVIEW_EMAIL = 'test.reviewer@momster.gr';
const REVIEW_PASSWORD = 'Momster2024!';

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !anonKey || !serviceKey) {
      return json({ error: 'Missing backend configuration' }, 500);
    }

    // Check for service key in header (for automated calls)
    const serviceKeyHeader = req.headers.get('x-service-key');
    const isServiceCall = serviceKeyHeader === serviceKey;

    if (!isServiceCall) {
      // Verify caller is authenticated + admin
      const authClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: userData, error: userError } = await authClient.auth.getUser();
      if (userError || !userData.user) return json({ error: 'Unauthorized' }, 401);

      const { data: isAdmin, error: roleErr } = await authClient.rpc('has_role', {
        _user_id: userData.user.id,
        _role: 'admin',
      });

      if (roleErr) return json({ error: 'Role check failed' }, 403);
      if (!isAdmin) return json({ error: 'Admins only' }, 403);
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Create or update the review user
    // 1) Try to find existing profile by email
    const { data: existingProfiles, error: findErr } = await supabaseAdmin
      .from('profiles')
      .select('id,email')
      .eq('email', REVIEW_EMAIL)
      .limit(1);

    if (findErr) {
      console.error('Find profile by email error:', findErr);
    }

    let reviewUserId: string | null = existingProfiles?.[0]?.id ?? null;

    if (!reviewUserId) {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: REVIEW_EMAIL,
        password: REVIEW_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: 'Test Reviewer' },
      });

      if (createErr || !created.user) {
        console.error('Create user error:', createErr);
        return json({ error: createErr?.message ?? 'Failed to create user' }, 500);
      }

      reviewUserId = created.user.id;
    } else {
      // Ensure password is known (reset to our standard)
      const { error: updateUserErr } = await supabaseAdmin.auth.admin.updateUserById(reviewUserId, {
        password: REVIEW_PASSWORD,
        user_metadata: { full_name: 'Test Reviewer' },
      });

      if (updateUserErr) {
        console.error('Update user error:', updateUserErr);
        // non-fatal; continue
      }
    }

    // Fill profile with a complete setup so reviewer can access app immediately
    const photos = [
      'https://i.pravatar.cc/600?img=12',
      'https://i.pravatar.cc/600?img=24',
      'https://i.pravatar.cc/600?img=36',
    ];

    const { error: profileUpdateErr } = await supabaseAdmin
      .from('profiles')
      .update({
        full_name: 'Test Reviewer',
        username: 'test_reviewer',
        city: 'Αθήνα',
        area: 'Κολωνάκι',
        children: [{ ageGroup: '1-2 χρόνια', gender: 'baby' }],
        child_age_group: '1-2 χρόνια',
        match_preference: 'Από όλη την Ελλάδα',
        interests: ['gentle_parenting', 'coffee_lover', 'walking', 'homebody', 'mom_learning'],
        profile_photo_url: photos[0],
        profile_photos_urls: photos,
        profile_completed: true,
        has_completed_onboarding: true,
      })
      .eq('id', reviewUserId);

    if (profileUpdateErr) {
      console.error('Profile update error:', profileUpdateErr);
      return json({ error: profileUpdateErr.message }, 500);
    }

    // Ensure role exists
    await supabaseAdmin.from('user_roles').upsert(
      { user_id: reviewUserId, role: 'user' },
      { onConflict: 'user_id,role' },
    );

    const res: CreateReviewAccountResponse = {
      success: true,
      email: REVIEW_EMAIL,
      password: REVIEW_PASSWORD,
      userId: reviewUserId,
      message: 'Το Google Review test account είναι έτοιμο.',
    };

    return json(res);
  } catch (error) {
    console.error('create-review-account error:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
