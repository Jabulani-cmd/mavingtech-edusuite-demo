import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    const { action, ...payload } = await req.json();

    // Verify caller is admin (except for seed/public actions)
    if (action !== "seed-admin" && action !== "seed-teacher" && action !== "register-parent") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const token = authHeader.replace("Bearer ", "");
      
      // Use getClaims for faster validation, fall back to getUser
      const supabaseAuth = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );
      const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const userId = claimsData.claims.sub;
      const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
        _user_id: userId,
        _role: "admin",
      });
      const { data: isPrincipal } = await supabaseAdmin.rpc("has_role", {
        _user_id: userId,
        _role: "principal",
      });
      const { data: isAdminSupervisor } = await supabaseAdmin.rpc("has_role", {
        _user_id: userId,
        _role: "admin_supervisor",
      });
      if (!isAdmin && !isPrincipal && !isAdminSupervisor && action !== "get-students") {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ==================== SEED ADMIN ====================
    if (action === "seed-admin") {
      const { data: existingUsers } =
        await supabaseAdmin.auth.admin.listUsers();
      const adminExists = existingUsers?.users?.some(
        (u) => u.email === "admin@giffordhigh.com"
      );
      if (adminExists) {
        return new Response(
          JSON.stringify({ message: "Admin already exists" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: "admin@giffordhigh.com",
          password: "GiffordAdmin2026$",
          email_confirm: true,
          user_metadata: { full_name: "System Administrator" },
        });

      if (createError) throw createError;

      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: newUser.user.id, role: "admin" });

      return new Response(
        JSON.stringify({ message: "Admin seeded successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ==================== SEED TEACHER ====================
    if (action === "seed-teacher") {
      const { email, password, full_name, department } = payload;
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const exists = existingUsers?.users?.some((u) => u.email === email);
      if (exists) {
        const existingUser = existingUsers?.users?.find((u) => u.email === email);
        if (existingUser && password) {
          await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password });
        }
        return new Response(JSON.stringify({ message: "Teacher already exists, password updated" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true,
        user_metadata: { full_name: full_name || "Teacher" },
      });
      if (createError) throw createError;
      await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: "teacher" });
      await supabaseAdmin.from("staff").insert({
        full_name: full_name || "Teacher", email, department, user_id: newUser.user.id, category: "teaching",
      });
      return new Response(JSON.stringify({ message: "Teacher seeded", user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== CREATE USER (unified) ====================
    if (action === "create-user") {
      const { email, password, full_name, portal_role, staff_role, department, phone, grade, class_name, assigned_class_id } = payload;

      if (!email || !password || !full_name || !portal_role) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if user already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const exists = existingUsers?.users?.some((u) => u.email === email);
      if (exists) {
        return new Response(JSON.stringify({ error: "A user with this email already exists" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, must_change_password: true },
      });
      if (createError) throw createError;

      const userId = newUser.user.id;

      // Assign portal role (admin, teacher, student, parent)
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: portal_role });

      // Update profile
      await supabaseAdmin.from("profiles").update({ phone: phone || null }).eq("user_id", userId);
      if (portal_role === "student") {
        // Create student record linked to auth user
        await supabaseAdmin.from("students").insert({
          full_name,
          user_id: userId,
          form: grade || null,
          stream: class_name || null,
          guardian_phone: phone || null,
          status: "active",
        });
      } else if (portal_role !== "parent") {
        // Determine proper category
        let staffCategory = "teaching";
        if (["principal", "deputy_principal"].includes(staff_role || "")) staffCategory = "leadership";
        else if (["bursar", "secretary"].includes(staff_role || "")) staffCategory = "administrative";
        else if (["groundsman", "matron"].includes(staff_role || "")) staffCategory = "general";

        const { data: staffRecord } = await supabaseAdmin.from("staff").insert({
          full_name,
          email,
          phone: phone || null,
          department: department || null,
          user_id: userId,
          category: staffCategory,
          role: staff_role || "teacher",
        }).select("id").single();

        // Assign as class teacher if a class was selected
        if (assigned_class_id && staffRecord) {
          await supabaseAdmin.from("classes").update({ class_teacher_id: staffRecord.id }).eq("id", assigned_class_id);
        }
      }

      return new Response(JSON.stringify({ message: "User created successfully", user_id: userId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== LIST USERS ====================
    if (action === "list-users") {
      const { data: allRoles } = await supabaseAdmin.from("user_roles").select("user_id, role");
      const { data: allProfiles } = await supabaseAdmin.from("profiles").select("id, user_id, full_name, email");
      const { data: allStaff } = await supabaseAdmin.from("staff").select("user_id, role, department");

      const roleMap: Record<string, string> = {};
      (allRoles || []).forEach((r) => { roleMap[r.user_id] = r.role; });

      const staffMap: Record<string, { role: string; department: string | null }> = {};
      (allStaff || []).forEach((s) => {
        if (s.user_id) staffMap[s.user_id] = { role: s.role || "", department: s.department };
      });

      const users = (allProfiles || []).map((p) => {
        const uid = p.user_id || p.id;
        return {
          id: uid,
          email: p.email || "",
          full_name: p.full_name || "",
          portal_role: roleMap[uid] || "unknown",
          staff_role: staffMap[uid]?.role || null,
          department: staffMap[uid]?.department || null,
          created_at: "",
        };
      });

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== RESET PASSWORD ====================
    if (action === "reset-password") {
      const { user_id, password: newPassword, force_change } = payload;
      if (!user_id || !newPassword) {
        return new Response(JSON.stringify({ error: "user_id and password required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const updatePayload: any = { password: newPassword };
      if (force_change) {
        updatePayload.user_metadata = { must_change_password: true };
      }
      const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, updatePayload);
      if (error) throw error;
      return new Response(JSON.stringify({ message: "Password reset successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== DELETE USER ====================
    if (action === "delete-user") {
      const { user_id } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get staff record ID for this user (needed to clean up FK references)
      const { data: staffRecord } = await supabaseAdmin
        .from("staff")
        .select("id")
        .eq("user_id", user_id)
        .maybeSingle();

      if (staffRecord) {
        // Nullify foreign key references pointing to this staff record
        await supabaseAdmin.from("classes").update({ class_teacher_id: null }).eq("class_teacher_id", staffRecord.id);
        await supabaseAdmin.from("class_subjects").update({ teacher_id: null }).eq("teacher_id", staffRecord.id);
        await supabaseAdmin.from("timetable_entries").update({ teacher_id: null }).eq("teacher_id", staffRecord.id);
        await supabaseAdmin.from("hostels").update({ housemaster_id: null }).eq("housemaster_id", staffRecord.id);
        await supabaseAdmin.from("hostels").update({ assistant_housemaster_id: null }).eq("assistant_housemaster_id", staffRecord.id);
        // Delete owned records
        await supabaseAdmin.from("contracts").delete().eq("staff_id", staffRecord.id);
        await supabaseAdmin.from("leave_requests").delete().eq("staff_id", staffRecord.id);
        // Now delete the staff record itself
        await supabaseAdmin.from("staff").delete().eq("id", staffRecord.id);
      }

      // Delete related data referencing user_id directly
      await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
      await supabaseAdmin.from("personal_timetables").delete().eq("user_id", user_id);
      await supabaseAdmin.from("notifications").delete().eq("user_id", user_id);
      // Remove teacher-owned academic records that FK to auth.users
      await supabaseAdmin.from("homework").delete().eq("teacher_id", user_id);
      await supabaseAdmin.from("marks").delete().eq("teacher_id", user_id);
      // Clean up messaging
      await supabaseAdmin.from("conversation_participants").delete().eq("user_id", user_id);
      // Nullify author references
      await supabaseAdmin.from("announcements").update({ author_id: null }).eq("author_id", user_id);
      // Clean up parent links
      await supabaseAdmin.from("parent_students").delete().eq("parent_id", user_id);

      // Delete auth user (cascades to profiles via trigger)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ message: "User deleted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== UPDATE USER ====================
    if (action === "update-user") {
      const { user_id, portal_role, staff_role, department, full_name, assigned_class_id,
        phone, email: staffEmail, address, emergency_contact, qualifications, bio, title,
        subjects_taught, national_id, nssa_number, paye_number, bank_details, employment_date } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update portal role if provided
      if (portal_role) {
        await supabaseAdmin.from("user_roles").update({ role: portal_role }).eq("user_id", user_id);
      }

      // Update Auth email if provided
      const newAuthEmail = payload.new_email;
      if (newAuthEmail) {
        const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
          email: newAuthEmail,
          email_confirm: true,
        });
        if (emailError) throw emailError;
        // Also update profile email
        await supabaseAdmin.from("profiles").update({ email: newAuthEmail }).eq("user_id", user_id);
      }

      // Update profile name if provided
      if (full_name) {
        await supabaseAdmin.from("profiles").update({ full_name }).eq("user_id", user_id);
        // Also update auth user metadata
        await supabaseAdmin.auth.admin.updateUserById(user_id, {
          user_metadata: { full_name },
        });
      }

      // Update staff record if staff_role or departmentuser_ provided
      if (staff_role || department !== undefined || phone !== undefined || staffEmail !== undefined ||
          address !== undefined || emergency_contact !== undefined || qualifications !== undefined ||
          bio !== undefined || title !== undefined || subjects_taught !== undefined ||
          national_id !== undefined || nssa_number !== undefined || paye_number !== undefined ||
          bank_details !== undefined || employment_date !== undefined) {
        const { data: existingStaff } = await supabaseAdmin.from("staff").select("id").eq("user_id", user_id).maybeSingle();
        
        if (existingStaff) {
          const updates: Record<string, any> = {};
          if (staff_role) {
            updates.role = staff_role;
            let staffCategory = "teaching";
            if (["principal", "deputy_principal"].includes(staff_role)) staffCategory = "leadership";
            else if (["bursar", "secretary"].includes(staff_role)) staffCategory = "administrative";
            else if (["groundsman", "matron"].includes(staff_role)) staffCategory = "general";
            updates.category = staffCategory;
          }
          if (department !== undefined) updates.department = department || null;
          if (full_name) updates.full_name = full_name;
          if (phone !== undefined) updates.phone = phone || null;
          if (staffEmail !== undefined) updates.email = staffEmail || null;
          if (address !== undefined) updates.address = address || null;
          if (emergency_contact !== undefined) updates.emergency_contact = emergency_contact || null;
          if (qualifications !== undefined) updates.qualifications = qualifications || null;
          if (bio !== undefined) updates.bio = bio || null;
          if (title !== undefined) updates.title = title || null;
          if (subjects_taught !== undefined) updates.subjects_taught = subjects_taught;
          if (national_id !== undefined) updates.national_id = national_id || null;
          if (nssa_number !== undefined) updates.nssa_number = nssa_number || null;
          if (paye_number !== undefined) updates.paye_number = paye_number || null;
          if (bank_details !== undefined) updates.bank_details = bank_details || null;
          if (employment_date !== undefined) updates.employment_date = employment_date || null;
          await supabaseAdmin.from("staff").update(updates).eq("user_id", user_id);

          // Update class teacher assignment
          if (assigned_class_id !== undefined) {
            await supabaseAdmin.from("classes").update({ class_teacher_id: null }).eq("class_teacher_id", existingStaff.id);
            if (assigned_class_id) {
              await supabaseAdmin.from("classes").update({ class_teacher_id: existingStaff.id }).eq("id", assigned_class_id);
            }
          }
        } else if (portal_role === "teacher" || portal_role === "admin") {
          const { data: profile } = await supabaseAdmin.from("profiles").select("full_name, email").eq("user_id", user_id).maybeSingle();
          let staffCategory = "teaching";
          if (["principal", "deputy_principal"].includes(staff_role || "")) staffCategory = "leadership";
          else if (["bursar", "secretary"].includes(staff_role || "")) staffCategory = "administrative";
          else if (["groundsman", "matron"].includes(staff_role || "")) staffCategory = "general";
          const { data: newStaff } = await supabaseAdmin.from("staff").insert({
            full_name: full_name || profile?.full_name || "",
            email: staffEmail || profile?.email || "",
            user_id,
            role: staff_role || "teacher",
            category: staffCategory,
            department: department || null,
            phone: phone || null,
            address: address || null,
            emergency_contact: emergency_contact || null,
            qualifications: qualifications || null,
            bio: bio || null,
            title: title || null,
            subjects_taught: subjects_taught || null,
            national_id: national_id || null,
            nssa_number: nssa_number || null,
            paye_number: paye_number || null,
            bank_details: bank_details || null,
            employment_date: employment_date || null,
          }).select("id").single();

          if (assigned_class_id && newStaff) {
            await supabaseAdmin.from("classes").update({ class_teacher_id: newStaff.id }).eq("id", assigned_class_id);
          }
        }
      }

      return new Response(JSON.stringify({ message: "User updated successfully" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== REGISTER PARENT (public, post-signup) ====================
    if (action === "register-parent") {
      const { user_id, phone, children } = payload;
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify user exists
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(user_id);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Invalid user" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update phone on profile
      if (phone) {
        await supabaseAdmin.from("profiles").update({ phone }).eq("user_id", user_id);
      }

      // Assign parent role (ignore if already exists)
      await supabaseAdmin.from("user_roles").upsert(
        { user_id, role: "parent" },
        { onConflict: "user_id,role" }
      );

      // Link children via verification codes
      const linkResults: string[] = [];
      if (children && Array.isArray(children)) {
        for (const child of children) {
          if (!child.admissionNumber || !child.verificationCode) continue;
          try {
            const { data: student } = await supabaseAdmin
              .from("students")
              .select("id, full_name, form")
              .eq("admission_number", child.admissionNumber.trim())
              .eq("status", "active")
              .maybeSingle();

            if (!student) { linkResults.push(`No student found: ${child.admissionNumber}`); continue; }

            const { data: codeRecord } = await supabaseAdmin
              .from("student_verification_codes")
              .select("*")
              .eq("student_id", student.id)
              .eq("code", child.verificationCode.trim().toUpperCase())
              .is("used_at", null)
              .gt("expires_at", new Date().toISOString())
              .maybeSingle();

            if (!codeRecord) { linkResults.push(`Invalid/expired code for ${child.admissionNumber}`); continue; }

            const { data: existing } = await supabaseAdmin
              .from("parent_students")
              .select("id")
              .eq("parent_id", user_id)
              .eq("student_id", student.id)
              .maybeSingle();

            if (existing) { linkResults.push(`${student.full_name} already linked`); continue; }

            await supabaseAdmin.from("parent_students").insert({ parent_id: user_id, student_id: student.id });
            await supabaseAdmin.from("student_verification_codes")
              .update({ used_at: new Date().toISOString(), used_by: user_id })
              .eq("id", codeRecord.id);

            linkResults.push(student.full_name);
          } catch {
            linkResults.push(`Failed to link ${child.admissionNumber}`);
          }
        }
      }

      return new Response(JSON.stringify({ message: "Parent registered", linkResults }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== LEGACY: register-student ====================
    if (action === "register-student") {
      const { email, password, full_name, grade, class_name, phone } = payload;
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name },
      });
      if (createError) throw createError;
      await supabaseAdmin.from("profiles").update({ grade, class_name, phone }).eq("id", newUser.user.id);
      await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: "student" });
      return new Response(JSON.stringify({ message: "Student registered", user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== LEGACY: register-teacher ====================
    if (action === "register-teacher") {
      const { email, password, full_name, department, phone } = payload;
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email, password, email_confirm: true, user_metadata: { full_name },
      });
      if (createError) throw createError;
      await supabaseAdmin.from("profiles").update({ phone }).eq("id", newUser.user.id);
      await supabaseAdmin.from("user_roles").insert({ user_id: newUser.user.id, role: "teacher" });
      await supabaseAdmin.from("staff").insert({ full_name, email, phone, department, user_id: newUser.user.id });
      return new Response(JSON.stringify({ message: "Teacher registered", user_id: newUser.user.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== PROVISION STUDENT ====================
    if (action === "provision-student") {
      const { student_id, full_name, admission_number, guardian_email } = payload;
      if (!student_id || !full_name || !admission_number) {
        return new Response(JSON.stringify({ error: "student_id, full_name, and admission_number are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if student already has a user_id
      const { data: existingStudent } = await supabaseAdmin
        .from("students")
        .select("user_id")
        .eq("id", student_id)
        .single();
      if (existingStudent?.user_id) {
        return new Response(JSON.stringify({ error: "Student already has an account" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate email and temporary password
      const studentEmail = `${admission_number.toLowerCase()}@giffordhigh.ac.zw`;
      const tempPassword = `${admission_number}@Ghs2026`;

      // Check if email already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const emailExists = existingUsers?.users?.some((u) => u.email === studentEmail);
      if (emailExists) {
        return new Response(JSON.stringify({ error: `Email ${studentEmail} already exists` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth user with must_change_password flag
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: studentEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name, must_change_password: true },
      });
      if (createError) throw createError;

      const userId = newUser.user.id;

      // Assign student role
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "student" });

      // Link student record to auth user
      await supabaseAdmin.from("students").update({ user_id: userId }).eq("id", student_id);

      // Update profile with guardian email if available
      if (guardian_email) {
        await supabaseAdmin.from("profiles").update({ email: guardian_email }).eq("user_id", userId);
      }

      return new Response(JSON.stringify({
        message: "Student account provisioned",
        user_id: userId,
        email: studentEmail,
        temp_password: tempPassword,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ==================== LEGACY: get-students ====================
    if (action === "get-students") {
      const { data: studentRoles } = await supabaseAdmin.from("user_roles").select("user_id").eq("role", "student");
      if (!studentRoles || studentRoles.length === 0) {
        return new Response(JSON.stringify({ students: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const studentIds = studentRoles.map((r) => r.user_id);
      const { data: profiles } = await supabaseAdmin.from("profiles").select("*").in("id", studentIds);
      return new Response(JSON.stringify({ students: profiles || [] }), {
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
