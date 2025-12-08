import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AccountRestrictedRequest {
  user_id: string;
  reason: string;
  language?: 'el' | 'en';
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Account restricted email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, reason, language = 'el' }: AccountRestrictedRequest = await req.json();

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user_id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userName = profile.full_name || 'Μαμά';
    
    const content = language === 'el' ? {
      subject: '⚠️ Ο λογαριασμός σου έχει περιορισμένη πρόσβαση',
      greeting: `Γεια σου ${userName}`,
      message: 'Ο λογαριασμός σου στο Momster έχει περιορισμένη πρόσβαση προσωρινά.',
      reasonLabel: 'Λόγος:',
      whatToDo: 'Τι μπορείς να κάνεις:',
      steps: [
        'Έλεγξε τις φωτογραφίες και το περιεχόμενο του προφίλ σου',
        'Βεβαιώσου ότι ακολουθείς τους κανόνες της κοινότητας',
        'Αν πιστεύεις ότι πρόκειται για λάθος, επικοινώνησε μαζί μας'
      ],
      contact: 'Για απορίες ή διευκρινίσεις, απάντησε σε αυτό το email.',
      signature: 'Η ομάδα του Momster'
    } : {
      subject: '⚠️ Your account has restricted access',
      greeting: `Hi ${userName}`,
      message: 'Your Momster account has been temporarily restricted.',
      reasonLabel: 'Reason:',
      whatToDo: 'What you can do:',
      steps: [
        'Review your photos and profile content',
        'Make sure you follow community guidelines',
        'If you believe this is a mistake, contact us'
      ],
      contact: 'For questions or clarifications, reply to this email.',
      signature: 'The Momster Team'
    };

    const emailResponse = await resend.emails.send({
      from: "Momster <hello@momster.gr>",
      to: [profile.email],
      subject: content.subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #FFF5F8;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFE8F2 0%, #FFF5F8 100%); padding: 30px; border-radius: 16px; text-align: center;">
              <h1 style="color: #D946EF; margin: 0 0 10px 0; font-size: 28px;">Momster</h1>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 16px; margin-top: 20px; border-left: 4px solid #F59E0B;">
              <h2 style="color: #D97706; margin: 0 0 20px 0;">⚠️</h2>
              <p style="color: #374151; font-size: 18px; margin: 0 0 15px 0;">
                ${content.greeting},
              </p>
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                ${content.message}
              </p>
              
              <div style="background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #92400E; font-size: 14px; margin: 0;">
                  <strong>${content.reasonLabel}</strong> ${reason}
                </p>
              </div>
              
              <p style="color: #374151; font-size: 16px; margin: 20px 0 10px 0;">
                <strong>${content.whatToDo}</strong>
              </p>
              <ul style="color: #6B7280; font-size: 14px; line-height: 1.8; padding-left: 20px;">
                ${content.steps.map(step => `<li>${step}</li>`).join('')}
              </ul>
              
              <p style="color: #6B7280; font-size: 14px; margin-top: 25px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
                ${content.contact}
              </p>
              
              <p style="color: #D946EF; font-size: 14px; margin-top: 20px;">
                💕 ${content.signature}
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #9CA3AF; font-size: 12px;">
                © 2024 Momster. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Account restricted email sent:", emailResponse);

    // Also notify admin
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-admin-alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
        },
        body: JSON.stringify({
          type: 'account_restricted',
          data: {
            user_email: profile.email,
            restricted_reason: reason
          }
        })
      });
    } catch (adminError) {
      console.error("Failed to notify admin:", adminError);
    }

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending account restricted email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
