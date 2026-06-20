/**
 * Server-side gate for resume AI endpoints.
 * Allows admins/super_admins always; allows other authenticated users when
 * the admin `resume_ai_public` toggle is on.
 */
import { canUseResumeAi, getCurrentUserWithRole } from "@/lib/admin";
import { getResumeAiPublicEnabled } from "@/lib/tool-settings";

export type ResumeAiGate =
  | { ok: true; role: string }
  | { ok: false; status: number; message: string };

export async function checkResumeAiAccess(): Promise<ResumeAiGate> {
  const auth = await getCurrentUserWithRole();
  if (!auth?.user) {
    return { ok: false, status: 401, message: "Sign in required" };
  }
  if (auth.profile?.banned) {
    return { ok: false, status: 403, message: "Account suspended" };
  }
  const role = auth.profile?.role ?? "user";
  if (canUseResumeAi(role)) return { ok: true, role };

  const publicEnabled = await getResumeAiPublicEnabled();
  if (publicEnabled) return { ok: true, role };

  return {
    ok: false,
    status: 403,
    message: "AI assist is not enabled for your account.",
  };
}
