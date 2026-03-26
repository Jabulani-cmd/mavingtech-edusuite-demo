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
    const resolvePortalRole = (portalRole?: string, staffRole?: string) => {
      const normalizedStaffRole = (staffRole || "").toLowerCase();
      if (normalizedStaffRole === "bursar") return "bursar";
      if (normalizedStaffRole === "finance_clerk") return "finance_clerk";
      return portalRole;
    };

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, ...payload } = await req.json();

    // Verify caller authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");

    // Use getClaims for faster validation
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

    // For register-parent: caller must be registering themselves
    if (action === "register-parent") {
      if (payload.user_id !== userId) {
        return new Response(JSON.stringify({ error: "Forbidden: can only register yourself as parent" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Admin-level actions require admin/principal/admin_supervisor role
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
      // get-students: allow teachers and HODs in addition to admins
      const { data: isTeacher } = await supabaseAdmin.rpc("has_role", {
        _user_id: userId,
        _role: "teacher",
      });
      const { data: isHod } = await supabaseAdmin.rpc("has_role", {
        _user_id: userId,
        _role: "hod",
      });
      if (action === "get-students") {
        if (!isAdmin && !isPrincipal && !isAdminSupervisor && !isTeacher && !isHod) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (!isAdmin && !isPrincipal && !isAdminSupervisor) {
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
      const adminCheckEmail = Deno.env.get("ADMIN_SEED_EMAIL") || "admin@giffordhigh.com";
      const adminExists = existingUsers?.users?.some(
        (u) => u.email === adminCheckEmail
      );
      if (adminExists) {
        return new Response(
          JSON.stringify({ message: "Admin already exists" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const adminEmail = Deno.env.get("ADMIN_SEED_EMAIL") || "admin@giffordhigh.com";
      const adminPassword = Deno.env.get("ADMIN_SEED_PASSWORD");
      if (!adminPassword) {
        return new Response(JSON.stringify({ error: "ADMIN_SEED_PASSWORD secret not configured" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: adminPassword,
          email_confirm: true,
          user_metadata: { full_name: "System Administrator" },
          app_metadata: { must_change_password: true },
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
      const effectivePortalRole = resolvePortalRole(portal_role, staff_role);

      if (!email || !password || !full_name || !effectivePortalRole) {
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
        user_metadata: { full_name },
        app_metadata: { must_change_password: true },
      });
      if (createError) throw createError;

      const userId = newUser.user.id;

      // Assign portal role (admin, teacher, student, parent)
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: effectivePortalRole });

      // Update profile (profiles.id = auth user id)
      await supabaseAdmin.from("profiles").update({ phone: phone || null }).eq("id", userId);
      if (effectivePortalRole === "student") {
        // Create student record linked to auth user
        await supabaseAdmin.from("students").insert({
          full_name,
          user_id: userId,
          form: grade || null,
          stream: class_name || null,
          guardian_phone: phone || null,
          status: "active",
        });
      } else if (effectivePortalRole !== "parent") {
        // Determine proper category
        let staffCategory = "teaching";
        if (["principal", "deputy_principal"].includes(staff_role || "")) staffCategory = "leadership";
        else if (["bursar", "finance_clerk", "secretary"].includes(staff_role || "")) staffCategory = "administrative";
        else if (["groundsman", "matron"].includes(staff_role || "")) staffCategory = "general";

        const staffInsert: Record<string, any> = {
          full_name,
          email,
          phone: phone || null,
          department: department || null,
          user_id: userId,
          category: staffCategory,
          role: staff_role || "teacher",
        };
        // Pass through optional fields from the frontend
        if (payload.photo_url) staffInsert.photo_url = payload.photo_url;
        if (payload.title) staffInsert.title = payload.title;
        if (payload.bio) staffInsert.bio = payload.bio;
        if (payload.address) staffInsert.address = payload.address;
        if (payload.emergency_contact) staffInsert.emergency_contact = payload.emergency_contact;
        if (payload.qualifications) staffInsert.qualifications = payload.qualifications;
        if (payload.national_id) staffInsert.national_id = payload.national_id;
        if (payload.employment_date) staffInsert.employment_date = payload.employment_date;
        if (payload.subjects_taught) staffInsert.subjects_taught = payload.subjects_taught;

        const { data: staffRecord } = await supabaseAdmin.from("staff").insert(staffInsert).select("id, staff_number").single();

        // Assign as class teacher if a class was selected
        if (assigned_class_id && staffRecord) {
          await supabaseAdmin.from("classes").update({ class_teacher_id: staffRecord.id }).eq("id", assigned_class_id);
        }

        // Auto-create class_subjects entries for teaching assignments
        if (staffRecord && payload.teaching_class_ids && payload.subjects_taught) {
          const teachingClassIds = payload.teaching_class_ids as string[];
          const subjectNames = payload.subjects_taught as string[];
          
          // Look up subject IDs by name
          const { data: subjectRecords } = await supabaseAdmin
            .from("subjects")
            .select("id, name")
            .in("name", subjectNames);
          
          if (subjectRecords && subjectRecords.length > 0) {
            const classSubjectInserts: { class_id: string; subject_id: string; teacher_id: string }[] = [];
            for (const classId of teachingClassIds) {
              for (const subject of subjectRecords) {
                classSubjectInserts.push({
                  class_id: classId,
                  subject_id: subject.id,
                  teacher_id: staffRecord.id,
                });
              }
            }
            if (classSubjectInserts.length > 0) {
              await supabaseAdmin.from("class_subjects").upsert(classSubjectInserts, { onConflict: "class_id,subject_id" });
            }
          }

          // Also create timetable-relevant personal_timetable entries for the teacher
          // based on existing timetable_entries for their assigned classes
          const academicYear = new Date().getFullYear().toString();
          const { data: timetableEntries } = await supabaseAdmin
            .from("timetable_entries")
            .select("day_of_week, start_time, end_time, room, subject_id, subjects(name)")
            .in("class_id", teachingClassIds)
            .eq("academic_year", academicYear);
          
          if (timetableEntries && timetableEntries.length > 0) {
            const subjectIds = subjectRecords?.map(s => s.id) || [];
            const relevantEntries = timetableEntries.filter((te: any) => subjectIds.includes(te.subject_id));
            
            if (relevantEntries.length > 0) {
              const personalEntries = relevantEntries.map((te: any) => ({
                user_id: userId,
                day_of_week: te.day_of_week,
                time_slot: te.start_time,
                end_time: te.end_time,
                activity: te.subjects?.name || "Class",
                activity_type: "class",
                location: te.room,
              }));
              await supabaseAdmin.from("personal_timetables").insert(personalEntries);
            }
          }
        }

        return new Response(JSON.stringify({ message: "User created successfully", user_id: userId, staff_number: staffRecord?.staff_number }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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
        updatePayload.app_metadata = { must_change_password: true };
        updatePayload.user_metadata = { must_change_password: true }; // legacy compat
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

      // Get student record for this user (needed to clean up FK references)
      const { data: studentRecord } = await supabaseAdmin
        .from("students")
        .select("id")
        .eq("user_id", user_id)
        .maybeSingle();

      if (studentRecord) {
        // Use the cascade delete RPC
        await supabaseAdmin.rpc("delete_student_cascade", { _student_id: studentRecord.id });
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
      const effectivePortalRole = resolvePortalRole(portal_role, staff_role);
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update portal role if provided
      if (effectivePortalRole) {
        await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
        await supabaseAdmin.from("user_roles").insert({ user_id, role: effectivePortalRole });
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

      // Update phone on profile (profiles.id = auth user id)
      if (phone) {
        await supabaseAdmin.from("profiles").update({ phone }).eq("id", user_id);
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

    // ==================== PROVISION STAFF ====================
    if (action === "provision-staff") {
      const { staff_id, full_name, email: staffEmail, role: staffRole } = payload;
      if (!staff_id || !full_name) {
        return new Response(JSON.stringify({ error: "staff_id and full_name are required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check if staff already has a user_id
      const { data: existingStaff } = await supabaseAdmin
        .from("staff")
        .select("user_id, staff_number, email")
        .eq("id", staff_id)
        .single();
      if (existingStaff?.user_id) {
        return new Response(JSON.stringify({ error: "Staff member already has an account" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate email: use staff email if available, otherwise generate from name
      const useEmail = staffEmail || existingStaff?.email;
      let generatedEmail: string;
      if (useEmail) {
        generatedEmail = useEmail;
      } else {
        const nameParts = full_name.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
        generatedEmail = `${nameParts.join(".")}@giffordhigh.ac.zw`;
      }

      // Generate temporary password
      const staffNum = existingStaff?.staff_number || "Staff";
      const tempPassword = `${staffNum}@Ghs2026`;

      // Check if email already exists
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const emailExists = existingUsers?.users?.some((u) => u.email === generatedEmail);
      if (emailExists) {
        return new Response(JSON.stringify({ error: `Email ${generatedEmail} already in use` }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create auth user with must_change_password flag
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: generatedEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name, must_change_password: true },
      });
      if (createError) throw createError;

      const userId = newUser.user.id;

      // Determine portal role based on staff role
      let portalRole = "teacher";
      if (["principal"].includes(staffRole || "")) portalRole = "principal";
      else if (["deputy_principal"].includes(staffRole || "")) portalRole = "deputy_principal";
      else if (["hod"].includes(staffRole || "")) portalRole = "hod";
      else if (["bursar"].includes(staffRole || "")) portalRole = "bursar";
      else if (["finance_clerk"].includes(staffRole || "")) portalRole = "finance_clerk";

      // Assign portal role
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: portalRole });

      // Link staff record to auth user
      await supabaseAdmin.from("staff").update({ user_id: userId }).eq("id", staff_id);

      return new Response(JSON.stringify({
        message: "Staff account provisioned",
        user_id: userId,
        email: generatedEmail,
        temp_password: tempPassword,
        portal_role: portalRole,
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
