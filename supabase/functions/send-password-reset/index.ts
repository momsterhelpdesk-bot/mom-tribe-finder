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
          <p>Γεια σου μαμά 🤍</p>
          <p>Λάβαμε αίτημα για επαναφορά του κωδικού σου στο Momster.</p>
          <p>Μην ανησυχείς — συμβαίνει και στις καλύτερες 😉</p>
          <p>Πάτησε στο παρακάτω κουμπί για να ορίσεις νέο κωδικό πρόσβασης:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #FF69B4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">👉 Επαναφορά κωδικού</a>
          </div>
          <p style="font-size: 13px; color: #666;">Αν δεν ζήτησες εσύ επαναφορά κωδικού, απλώς αγνόησε αυτό το email.</p>
          <p style="font-size: 13px; color: #666;">Ο λογαριασμός σου παραμένει ασφαλής ✨</p>
          <p style="margin-top: 20px;">Είμαστε εδώ για να σε βοηθήσουμε 💗</p>
          <p style="margin-top: 20px;">Με αγάπη,<br><strong>Η ομάδα του Momster 🫶</strong></p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FFF5F7;">
          <h1 style="color: #FF69B4; text-align: center;">Momster 🌸</h1>
          <p>Hey mama 🤍</p>
          <p>We received a request to reset your Momster password.</p>
          <p>Don't worry — it happens to the best of us 😉</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #FF69B4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">👉 Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #666;">If you didn't request a password reset, just ignore this email.</p>
          <p style="font-size: 13px; color: #666;">Your account remains safe and secure ✨</p>
          <p style="margin-top: 20px;">We're here to help 💗</p>
          <p style="margin-top: 20px;">With love,<br><strong>The Momster Team 🫶</strong></p>
        </div>
      `;

    const emailResponse = await resend.emails.send({
      from: "Momster <hello@momster.gr>",
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
