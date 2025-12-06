import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';
import { corsHeaders } from '../_shared/cors.ts';

const GREEK_FEMALE_NAMES = [
  'Μαρία', 'Ελένη', 'Κατερίνα', 'Σοφία', 'Άννα', 'Ιωάννα', 'Δήμητρα',
  'Χριστίνα', 'Αικατερίνη', 'Γεωργία', 'Βασιλική', 'Αναστασία', 'Αλεξάνδρα',
  'Ευαγγελία', 'Παρασκευή', 'Νίκη', 'Θεοδώρα', 'Αθηνά', 'Άρτεμις', 'Πηνελόπη'
];

const GREEK_CITIES = [
  'Αθήνα', 'Θεσσαλονίκη', 'Πάτρα', 'Ηράκλειο', 'Λάρισα',
  'Βόλος', 'Ιωάννινα', 'Χανιά', 'Ρόδος', 'Καβάλα'
];

const ATHENS_AREAS = [
  'Κολωνάκι', 'Παγκράτι', 'Κηφισιά', 'Χαλάνδρι', 'Μαρούσι',
  'Γλυφάδα', 'Βούλα', 'Βριλήσσια', 'Αμπελόκηποι', 'Ζωγράφου'
];

const THESSALONIKI_AREAS = [
  'Καλαμαριά', 'Πανόραμα', 'Τούμπα', 'Τριανδρία', 'Εύοσμος',
  'Κέντρο', 'Νέα Παραλία', 'Χαριλάου', 'Πυλαία', 'Καλαμαριά'
];

const ALL_INTERESTS = [
  'baby_led_weaning', 'puree_feeding', 'attachment_parenting', 'montessori',
  'gentle_parenting', 'sleep_training', 'breastfeeding', 'formula_feeding',
  'cosleeping', 'twin_mom', 'working_mom', 'wfh_mom', 'sahm', 'homebody',
  'special_needs_warrior', 'decluttering', 'mom_learning', 'cooking', 'baking',
  'healthy_eating', 'vegan', 'airfryer', 'slow_cooker', 'sweet_tooth',
  'coffee_lover', 'tea_lover', 'wine_lover', 'yoga', 'pilates', 'gym',
  'running', 'walking', 'cycling', 'ski', 'swimming', 'hiking', 'self_care',
  'skincare', 'diy_crafts', 'art', 'knitting', 'photography', 'reels',
  'reading', 'gaming', 'podcasts', 'movies', 'plant_mom', 'social_butterfly',
  'party_animal', 'brunch_lover', 'travel_lover', 'camping', 'pet_lover',
  'shopping', 'beauty', 'couch_potato', 'nerdy', 'luxury_lover', 'boss_mom',
  'queen_vibes', 'mountain_lover', 'sea_lover', 'positive_vibes', 'calm_chill',
  'aesthetic_lover', 'planner', 'board_games'
];

const CHILD_AGE_GROUPS = [
  'Είμαι έγκυος 🤰',
  '0-6 μήνες',
  '6-12 μήνες',
  '1-2 χρόνια',
  '2-3 χρόνια',
  '3-5 χρόνια',
  '5+ χρόνια'
];

const MATCH_PREFERENCES = [
  'Μόνο κοντινές μαμάδες',
  'Από όλη την Ελλάδα'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateUsername(name: string): string {
  // Complete Greek to Latin transliteration
  const greekToLatin: Record<string, string> = {
    'α': 'a', 'ά': 'a', 'β': 'v', 'γ': 'g', 'δ': 'd', 'ε': 'e', 'έ': 'e',
    'ζ': 'z', 'η': 'i', 'ή': 'i', 'θ': 'th', 'ι': 'i', 'ί': 'i', 'ϊ': 'i', 'ΐ': 'i',
    'κ': 'k', 'λ': 'l', 'μ': 'm', 'ν': 'n', 'ξ': 'x', 'ο': 'o', 'ό': 'o',
    'π': 'p', 'ρ': 'r', 'σ': 's', 'ς': 's', 'τ': 't', 'υ': 'y', 'ύ': 'y', 'ϋ': 'y', 'ΰ': 'y',
    'φ': 'f', 'χ': 'ch', 'ψ': 'ps', 'ω': 'o', 'ώ': 'o'
  };
  
  let cleaned = name.toLowerCase();
  for (const [greek, latin] of Object.entries(greekToLatin)) {
    cleaned = cleaned.replace(new RegExp(greek, 'g'), latin);
  }
  
  // Remove any remaining non-alphanumeric characters
  cleaned = cleaned.replace(/[^a-z0-9]/g, '');
  
  const randomNum = Math.floor(Math.random() * 9999);
  return `${cleaned}_mom${randomNum}`;
}

function generatePlaceholderPhotos(count: number): string[] {
  const photos: string[] = [];
  // Use female avatar range and ensure they're unique
  const usedSeeds = new Set<number>();
  for (let i = 0; i < count; i++) {
    let seed;
    do {
      seed = Math.floor(Math.random() * 70); // pravatar has 70 avatars
    } while (usedSeeds.has(seed));
    usedSeeds.add(seed);
    photos.push(`https://i.pravatar.cc/600?img=${seed}`);
  }
  return photos;
}

function generateChildren(count: number): any[] {
  const children = [];
  for (let i = 0; i < count; i++) {
    const gender = getRandomElement(['boy', 'girl', 'baby']);
    children.push({
      ageGroup: getRandomElement(CHILD_AGE_GROUPS),
      gender: gender
    });
  }
  return children;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { count = 10 } = await req.json();

    if (count > 50) {
      return new Response(
        JSON.stringify({ error: 'Μέγιστος αριθμός accounts: 50' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const createdAccounts = [];

    for (let i = 0; i < count; i++) {
      const name = getRandomElement(GREEK_FEMALE_NAMES);
      const username = generateUsername(name);
      const email = `${username}@test.momconnect.com`;
      const password = 'TestMom2024!';

      // Create user
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name
        }
      });

      if (userError) {
        console.error('Error creating user:', userError);
        continue;
      }

      if (!userData.user) continue;

      // Generate profile data
      const city = getRandomElement(GREEK_CITIES);
      const areas = city === 'Αθήνα' ? ATHENS_AREAS : city === 'Θεσσαλονίκη' ? THESSALONIKI_AREAS : ATHENS_AREAS;
      const area = getRandomElement(areas);
      const interests = getRandomElements(ALL_INTERESTS, Math.floor(Math.random() * 8) + 5);
      const childrenCount = Math.floor(Math.random() * 2) + 1;
      const children = generateChildren(childrenCount);
      const photoCount = Math.floor(Math.random() * 4) + 2;
      const photos = generatePlaceholderPhotos(photoCount);

      // Update profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          username,
          full_name: name,
          city,
          area,
          children,
          child_age_group: children[0].ageGroup,
          match_preference: getRandomElement(MATCH_PREFERENCES),
          interests,
          profile_photo_url: photos[0],
          profile_photos_urls: photos,
          profile_completed: true,
          has_completed_onboarding: true,
          latitude: 37.9838 + (Math.random() - 0.5) * 0.1,
          longitude: 23.7275 + (Math.random() - 0.5) * 0.1
        })
        .eq('id', userData.user.id);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        continue;
      }

      createdAccounts.push({
        id: userData.user.id,
        email,
        password,
        name,
        city,
        area
      });
    }

    // Create mutual swipes between all test accounts so they can match
    if (createdAccounts.length >= 2) {
      console.log('Creating mutual swipes between test accounts...');
      for (let i = 0; i < createdAccounts.length; i++) {
        for (let j = i + 1; j < createdAccounts.length; j++) {
          // User i swipes yes on user j
          await supabaseAdmin.from('swipes').upsert({
            from_user_id: createdAccounts[i].id,
            to_user_id: createdAccounts[j].id,
            choice: 'yes'
          }, { onConflict: 'from_user_id,to_user_id' });

          // User j swipes yes on user i - this creates a mutual match!
          await supabaseAdmin.from('swipes').upsert({
            from_user_id: createdAccounts[j].id,
            to_user_id: createdAccounts[i].id,
            choice: 'yes'
          }, { onConflict: 'from_user_id,to_user_id' });

          // Create the match
          const existingMatch = await supabaseAdmin
            .from('matches')
            .select('id')
            .or(`and(user1_id.eq.${createdAccounts[i].id},user2_id.eq.${createdAccounts[j].id}),and(user1_id.eq.${createdAccounts[j].id},user2_id.eq.${createdAccounts[i].id})`)
            .maybeSingle();

          if (!existingMatch.data) {
            await supabaseAdmin.from('matches').insert({
              user1_id: createdAccounts[i].id,
              user2_id: createdAccounts[j].id
            });
          }
        }
      }
      console.log('Mutual swipes and matches created!');
    }

    return new Response(
      JSON.stringify({
        success: true,
        count: createdAccounts.length,
        accounts: createdAccounts,
        message: `Δημιουργήθηκαν ${createdAccounts.length} test accounts!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
