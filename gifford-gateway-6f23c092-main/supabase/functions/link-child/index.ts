import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = { id: claimsData.claims.sub as string };

    const { action, ...payload } = await req.json();

    // For "link" action, must be a parent
    if (action === "link") {
      const { data: isParent } = await supabaseAdmin.rpc("has_role", {
        _user_id: user.id,
        _role: "parent",
      });
      if (!isParent) {
        return new Response(JSON.stringify({ error: "Only parents can link children" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ==================== LINK CHILD ====================
    if (action === "link") {
      const { admission_number, verification_code } = payload;

      if (!admission_number || !verification_code) {
        return new Response(JSON.stringify({ error: "Admission number and verification code are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Find student by admission number
      const { data: student } = await supabaseAdmin
        .from("students")
        .select("id, full_name, form, admission_number")
        .eq("admission_number", admission_number.trim())
        .eq("status", "active")
        .maybeSingle();

      if (!student) {
        return new Response(JSON.stringify({ error: "No active student found with this admission number" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check verification code
      const { data: codeRecord } = await supabaseAdmin
        .from("student_verification_codes")
        .select("*")
        .eq("student_id", student.id)
        .eq("code", verification_code.trim().toUpperCase())
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (!codeRecord) {
        return new Response(JSON.stringify({ error: "Invalid or expired verification code" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if already linked
      const { data: existing } = await supabaseAdmin
        .from("parent_students")
        .select("id")
        .eq("parent_id", user.id)
        .eq("student_id", student.id)
        .maybeSingle();

      if (existing) {
        return new Response(JSON.stringify({ error: "This child is already linked to your account" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create link
      const { error: linkError } = await supabaseAdmin
        .from("parent_students")
        .insert({ parent_id: user.id, student_id: student.id });

      if (linkError) throw linkError;

      // Mark code as used
      await supabaseAdmin
        .from("student_verification_codes")
        .update({ used_at: new Date().toISOString(), used_by: user.id })
        .eq("id", codeRecord.id);

      return new Response(JSON.stringify({
        message: "Child linked successfully",
        student: { id: student.id, full_name: student.full_name, form: student.form },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== GENERATE CODE (admin only) ====================
    if (action === "generate-code") {
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Only admins can generate codes" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { student_id } = payload;
      if (!student_id) {
        return new Response(JSON.stringify({ error: "student_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate a 6-char alphanumeric code
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }

      const { error: insertError } = await supabaseAdmin
        .from("student_verification_codes")
        .insert({ student_id, code });

      if (insertError) throw insertError;

      return new Response(JSON.stringify({ code }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== BULK GENERATE CODES (admin only) ====================
    if (action === "bulk-generate-codes") {
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        return new Response(JSON.stringify({ error: "Only admins can generate codes" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { form_filter, status_filter } = payload;

      // Get active students, optionally filtered by form
      let query = supabaseAdmin
        .from("students")
        .select("id, admission_number, full_name, form, stream")
        .eq("status", status_filter || "active")
        .is("deleted_at", null)
        .order("full_name");

      if (form_filter && form_filter !== "all") {
        query = query.eq("form", form_filter);
      }

      const { data: studentsData, error: studentsError } = await query;
      if (studentsError) throw studentsError;
      if (!studentsData || studentsData.length === 0) {
        return new Response(JSON.stringify({ error: "No students found matching filters" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      const results = [];

      for (const student of studentsData) {
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }

        const { error: insertError } = await supabaseAdmin
          .from("student_verification_codes")
          .insert({ student_id: student.id, code });

        if (insertError) {
          results.push({ ...student, code: null, error: insertError.message });
        } else {
          results.push({ ...student, code, error: null });
        }
      }

      return new Response(JSON.stringify({ results }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
