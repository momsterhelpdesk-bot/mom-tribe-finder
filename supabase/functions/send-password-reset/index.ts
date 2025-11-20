import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetLink: string;
  language?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetLink, language = 'el' }: PasswordResetRequest = await req.json();
    console.log(`Sending password reset email to ${email}`);

    const isGreek = language === 'el';
    const subject = isGreek 
      ? 'Επαναφορά κωδικού για το Momster 🌸'
      : 'Reset your Momster password 🌸';
    
    const body = isGreek
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF5F7;">
          <h1 style="color: #FF69B4; text-align: center;">Momster 🌸</h1>
          <p>Γεια σου μανούλα 💕</p>
          <p>Λάβαμε αίτημα για επαναφορά του κωδικού σου στο Momster.</p>
          <p>Αν ήσουν εσύ, πάτα το κουμπί παρακάτω για να ορίσεις νέο κωδικό:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #FF69B4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Επαναφορά Κωδικού</a>
          </div>
          <p style="font-size: 12px; color: #666;">Το link θα είναι ενεργό για 15 λεπτά για την ασφάλειά σου.</p>
          <p>Αν δεν έκανες εσύ το αίτημα, μπορείς απλώς να αγνοήσεις αυτό το μήνυμα.</p>
          <p>Εμείς είμαστε εδώ — πάντα με αγάπη 🌸</p>
          <p style="text-align: center; font-style: italic; color: #FF69B4; margin-top: 20px;">Together, moms thrive! 💫</p>
          <p style="text-align: center; color: #666;">Η ομάδα του Momster</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF5F7;">
          <h1 style="color: #FF69B4; text-align: center;">Momster 🌸</h1>
          <p>Hello mom! 💕</p>
          <p>We received a request to reset your Momster password.</p>
          <p>If this was you, click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #FF69B4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
          </div>
          <p style="font-size: 12px; color: #666;">This link will be active for 15 minutes for your security.</p>
          <p>If you didn't make this request, you can simply ignore this message.</p>
          <p>We're here for you — always with love 🌸</p>
          <p style="text-align: center; font-style: italic; color: #FF69B4; margin-top: 20px;">Together, moms thrive! 💫</p>
          <p style="text-align: center; color: #666;">The Momster Team</p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Momster <onboarding@resend.dev>",
      to: [email],
      subject,
      html: body,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
