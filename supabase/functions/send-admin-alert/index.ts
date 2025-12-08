import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminAlertRequest {
  type: 'new_user' | 'new_report' | 'new_marketplace_signup' | 'photo_pending' | 'email_failure' | 'account_restricted';
  data: {
    user_email?: string;
    user_name?: string;
    report_reason?: string;
    reported_user?: string;
    photo_count?: number;
    error_message?: string;
    restricted_reason?: string;
  };
}

const getAlertContent = (type: string, data: any): { subject: string; body: string } => {
  switch (type) {
    case 'new_user':
      return {
        subject: '🌸 Νέα Μαμά στο Momster!',
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FFE8F2 0%, #FFF5F8 100%); padding: 30px; border-radius: 16px;">
              <h1 style="color: #D946EF; margin: 0 0 20px 0;">Νέα Εγγραφή! 🎀</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Email:</strong> ${data.user_email || 'N/A'}<br>
                <strong>Όνομα:</strong> ${data.user_name || 'N/A'}
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Ώρα: ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}
              </p>
            </div>
          </div>
        `
      };
    
    case 'new_report':
      return {
        subject: '⚠️ Νέα Αναφορά Προφίλ',
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%); padding: 30px; border-radius: 16px; border-left: 4px solid #F59E0B;">
              <h1 style="color: #D97706; margin: 0 0 20px 0;">Αναφορά Προφίλ ⚠️</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Λόγος:</strong> ${data.report_reason || 'N/A'}<br>
                <strong>Αναφερόμενο προφίλ:</strong> ${data.reported_user || 'N/A'}
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Παρακαλώ έλεγξε την αναφορά στο Admin Panel.
              </p>
            </div>
          </div>
        `
      };
    
    case 'new_marketplace_signup':
      return {
        subject: '🛍️ Νέα Εγγραφή Marketplace',
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #D1FAE5 0%, #ECFDF5 100%); padding: 30px; border-radius: 16px;">
              <h1 style="color: #059669; margin: 0 0 20px 0;">Marketplace Signup! 🛍️</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Email:</strong> ${data.user_email || 'N/A'}
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Ώρα: ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}
              </p>
            </div>
          </div>
        `
      };
    
    case 'photo_pending':
      return {
        subject: '📸 Φωτογραφίες για Έγκριση',
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #E0E7FF 0%, #EEF2FF 100%); padding: 30px; border-radius: 16px;">
              <h1 style="color: #4F46E5; margin: 0 0 20px 0;">Εκκρεμείς Φωτογραφίες 📸</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Αριθμός φωτογραφιών:</strong> ${data.photo_count || 1}
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Παρακαλώ έλεγξε τις φωτογραφίες στο Admin Panel.
              </p>
            </div>
          </div>
        `
      };
    
    case 'email_failure':
      return {
        subject: '❌ Αποτυχία Αποστολής Email',
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FEE2E2 0%, #FEF2F2 100%); padding: 30px; border-radius: 16px; border-left: 4px solid #EF4444;">
              <h1 style="color: #DC2626; margin: 0 0 20px 0;">Email Failure ❌</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Email:</strong> ${data.user_email || 'N/A'}<br>
                <strong>Σφάλμα:</strong> ${data.error_message || 'Unknown error'}
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Ώρα: ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}
              </p>
            </div>
          </div>
        `
      };

    case 'account_restricted':
      return {
        subject: '🔒 Λογαριασμός Περιορίστηκε',
        body: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%); padding: 30px; border-radius: 16px;">
              <h1 style="color: #D97706; margin: 0 0 20px 0;">Account Restricted 🔒</h1>
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                <strong>Email:</strong> ${data.user_email || 'N/A'}<br>
                <strong>Λόγος:</strong> ${data.restricted_reason || 'N/A'}
              </p>
              <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
                Ώρα: ${new Date().toLocaleString('el-GR', { timeZone: 'Europe/Athens' })}
              </p>
            </div>
          </div>
        `
      };
    
    default:
      return {
        subject: '📢 Momster Alert',
        body: `<p>New alert: ${type}</p><pre>${JSON.stringify(data, null, 2)}</pre>`
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("Admin alert function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!adminEmail) {
      console.error("ADMIN_EMAIL not configured");
      return new Response(
        JSON.stringify({ error: "Admin email not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { type, data }: AdminAlertRequest = await req.json();
    console.log(`Processing admin alert: ${type}`, data);

    const { subject, body } = getAlertContent(type, data);

    const emailResponse = await resend.emails.send({
      from: "Momster <hello@momster.gr>",
      to: [adminEmail],
      subject: subject,
      html: body,
    });

    console.log("Admin alert sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, id: emailResponse.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error sending admin alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
