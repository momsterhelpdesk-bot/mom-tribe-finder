import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UsernameReminderRequest {
  email: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, language = 'el' }: UsernameReminderRequest = await req.json();
    console.log(`Sending username reminder to ${email}`);

    // Create Supabase client with service role key to access auth users
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if user exists
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find(u => u.email === email);

    if (userError || !user) {
      console.error("User not found or error:", userError);
      return new Response(
        JSON.stringify({ error: "User not found" }), 
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const resetLink = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovable.app')}/auth?forgot=true`;
    const isGreek = language === 'el';
    
    const subject = isGreek 
      ? 'Να ποιο email χρησιμοποιείς στο Momster 🌷'
      : 'Here\'s your Momster email 🌷';
    
    const body = isGreek
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF5F7;">
          <h1 style="color: #FF69B4; text-align: center;">Momster 🌷</h1>
          <p>Γεια σου μανούλα 💕</p>
          <p>Ζήτησες υπενθύμιση για το email/username του λογαριασμού σου στο Momster.</p>
          <p>Ο λογαριασμός σου είναι συνδεδεμένος με το:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #FF69B4; margin: 0;">📧 ${email}</p>
          </div>
          <p>Αν δεν θυμάσαι τον κωδικό σου, μπορείς να τον επαναφέρεις εδώ:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #FF69B4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Επαναφορά Κωδικού</a>
          </div>
          <p>Είμαστε πάντα εδώ για σένα 🌸</p>
          <p style="text-align: center; font-style: italic; color: #FF69B4; margin-top: 20px;">Together, moms thrive! 💫</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF5F7;">
          <h1 style="color: #FF69B4; text-align: center;">Momster 🌷</h1>
          <p>Hello mom! 💕</p>
          <p>You requested a reminder for your Momster account email/username.</p>
          <p>Your account is connected to:</p>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="font-size: 18px; font-weight: bold; color: #FF69B4; margin: 0;">📧 ${email}</p>
          </div>
          <p>If you don't remember your password, you can reset it here:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #FF69B4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p>We're always here for you 🌸</p>
          <p style="text-align: center; font-style: italic; color: #FF69B4; margin-top: 20px;">Together, moms thrive! 💫</p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Momster <onboarding@resend.dev>",
      to: [email],
      subject,
      html: body,
    });

    console.log("Username reminder email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-username-reminder function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
