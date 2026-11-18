// Shared caller check for edge functions that spend AI credits or read school data.
// The platform's verify_jwt flag also accepts the public anon key, so every function must
// confirm a real signed-in user with an allowed role before doing any work.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const STAFF_ROLES = [
  "admin", "admin_supervisor", "principal", "deputy_principal", "supervisor",
  "hod", "teacher", "staff", "registration",
];

/** Returns null when the caller is a signed-in user holding one of `roles`, otherwise a ready 401/403 response. */
export async function requireRole(
  req: Request,
  corsHeaders: Record<string, string>,
  roles: string[] = STAFF_ROLES,
): Promise<Response | null> {
  const deny = (status: number, error: string) =>
    new Response(JSON.stringify({ error }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return deny(401, "Sign in to use this feature");
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return deny(401, "Your session has expired. Please sign in again");
  const { data: rows, error: rErr } = await admin.from("user_roles").select("role").eq("user_id", data.user.id);
  if (rErr) return deny(500, "Could not verify your permissions");
  if (!(rows ?? []).some((r: { role: string }) => roles.includes(String(r.role)))) {
    return deny(403, "Your account is not allowed to use this feature");
  }
  return null;
}
