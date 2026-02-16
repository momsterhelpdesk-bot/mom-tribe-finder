import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Get the user from the authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create a client with the user's JWT to verify identity
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Not authenticated");
    }

    const userId = user.id;
    console.log("Deleting account for user:", userId);

    // Create admin client with service role key
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Delete user's photos from storage
    try {
      const { data: files } = await adminClient.storage
        .from("profile-photos")
        .list(userId);

      if (files && files.length > 0) {
        const filePaths = files.map((f) => `${userId}/${f.name}`);
        await adminClient.storage.from("profile-photos").remove(filePaths);
      }
    } catch (storageError) {
      console.error("Storage cleanup error (non-fatal):", storageError);
    }

    // Delete the Auth user (cascades to profiles and related data)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteError) {
      throw deleteError;
    }

    console.log("Account deleted successfully:", userId);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in delete-account function:", error);
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
