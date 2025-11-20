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

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName, language = "el" }: WelcomeEmailRequest = await req.json();
    
    console.log("Sending welcome email to:", email);

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch email template
    const { data: template, error: templateError } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_key", "welcome")
      .single();

    if (templateError || !template) {
      console.error("Error fetching email template:", templateError);
      throw new Error("Email template not found");
    }

    // Select subject and body based on language
    const subject = language === "en" ? template.subject_en : template.subject_el;
    const body = (language === "en" ? template.body_en : template.body_el)
      .replace(/{user_name}/g, fullName);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Momster <onboarding@resend.dev>",
      to: [email],
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

    console.log("Welcome email sent successfully:", emailResponse);

    // Track user activity
    await supabase.from("user_activity").upsert({
      user_id: userId,
      last_activity_at: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
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
