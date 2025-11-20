import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Checking for inactive users...");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find users inactive for 7+ days who haven't received a re-engagement email
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: inactiveUsers, error: usersError } = await supabase
      .from("user_activity")
      .select("user_id, last_activity_at")
      .lt("last_activity_at", sevenDaysAgo.toISOString())
      .is("email_sent_at", null);

    if (usersError) {
      console.error("Error fetching inactive users:", usersError);
      throw usersError;
    }

    console.log(`Found ${inactiveUsers?.length || 0} inactive users`);

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return new Response(
        JSON.stringify({ message: "No inactive users to email" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fetch email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", "reengagement")
      .single();

    if (templateError || !template) {
      console.error("Error fetching email template:", templateError);
      throw new Error("Email template not found");
    }

    const emailsSent = [];

    for (const user of inactiveUsers) {
      // Get user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.user_id)
        .single();

      if (!profile) continue;

      // Use Greek by default (can be extended to check user preferences)
      const subject = template.subject_el;
      const body = template.body_el.replace(/{user_name}/g, profile.full_name);

      // Send email
      try {
        const emailResponse = await resend.emails.send({
          from: "Momster <onboarding@resend.dev>",
          to: [profile.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #FFE5EC 0%, #FFF5F7 100%); padding: 30px; border-radius: 15px;">
                <h1 style="color: #FF69B4; text-align: center; margin-bottom: 20px;">🌸 Momster 🌸</h1>
                <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
                  ${body}
                </div>
              </div>
            </div>
          `,
        });

        console.log(`Re-engagement email sent to ${profile.email}`);

        // Update email_sent_at
        await supabase
          .from("user_activity")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("user_id", user.user_id);

        emailsSent.push(profile.email);
      } catch (emailError) {
        console.error(`Failed to send email to ${profile.email}:`, emailError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent: emailsSent.length,
        emails: emailsSent,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-reengagement-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
