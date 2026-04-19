import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
};

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ✅ Create Supabase client (using service role key)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ Fetch users from profiles table
    const { data, error } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url, department, graduation_year")
      .limit(5); // 🔥 CHANGE THIS NUMBER FOR MORE USERS

    if (error) {
      throw error;
    }

    // ✅ Format response
    const recommendations = (data || []).map((p) => ({
      user_id: p.user_id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      department: p.department,
      graduation_year: p.graduation_year,
      connect_reason: "Suggested batch mate",
      common_ground: [],
    }));

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err.message,
        recommendations: [],
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
