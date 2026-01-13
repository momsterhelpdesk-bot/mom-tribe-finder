import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminEmailRequest {
  recipientUserId: string;
  recipientEmail: string;
  recipientName: string;
  reason: string;
  templateKey?: string;
  customSubject?: string;
  customBody?: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header to identify the admin
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Verify the user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is admin
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const {
      recipientUserId,
      recipientEmail,
      recipientName,
      reason,
      templateKey,
      customSubject,
      customBody,
      language = "el"
    }: AdminEmailRequest = await req.json();

    console.log("Sending admin email:", { recipientEmail, reason, templateKey });

    let subject: string;
    let body: string;

    // If using a template, fetch it
    if (templateKey && !customSubject) {
      const { data: template, error: templateError } = await supabase
        .from("email_templates")
        .select("*")
        .eq("template_key", templateKey)
        .single();

      if (templateError || !template) {
        console.error("Template fetch error:", templateError);
        return new Response(
          JSON.stringify({ error: "Template not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      subject = language === "el" ? template.subject_el : template.subject_en;
      body = language === "el" ? template.body_el : template.body_en;
    } else if (customSubject && customBody) {
      subject = customSubject;
      body = customBody;
    } else {
      return new Response(
        JSON.stringify({ error: "Either templateKey or customSubject/customBody required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Replace variables in the email
    body = body.replace(/{user_name}/g, recipientName || "μαμά");

    // Convert newlines to HTML breaks for email
    const htmlBody = body
      .split("\n")
      .map(line => line.trim() === "" ? "<br>" : `<p style="margin: 8px 0;">${line}</p>`)
      .join("");

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Momster <hello@momster.gr>",
      to: [recipientEmail],
      subject: subject,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #E91E63; font-size: 28px; margin: 0;">Momster</h1>
          </div>
          <div style="background: linear-gradient(135deg, #fce4ec 0%, #f8bbd9 100%); border-radius: 16px; padding: 30px; color: #333;">
            ${htmlBody}
          </div>
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>Momster - Η μαμαδοπαρέα σου 💕</p>
            <p>hello@momster.gr</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email in database
    const { error: logError } = await supabase
      .from("admin_email_logs")
      .insert({
        admin_id: user.id,
        recipient_user_id: recipientUserId,
        recipient_email: recipientEmail,
        reason: reason,
        template_key: templateKey || null,
        custom_subject: customSubject || null,
        custom_body: customBody || null,
      });

    if (logError) {
      console.error("Error logging email:", logError);
      // Don't fail the request, email was sent
    }

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.data?.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-admin-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
