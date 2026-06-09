import { auth } from "@/lib/auth";

export async function getSessionUserId(): Promise<string> {
  try {
    const session = await auth();
    if (session?.user?.id) return session.user.id;
  } catch {
    // Auth not configured or session error
  }
  return "anonymous";
}
