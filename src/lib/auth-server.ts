import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Server-side function to get session
export async function getSession() {
  return await getServerSession(authOptions);
}

// Server-side function to require authentication
export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect("/signin");
  }

  return session;
}

// Server-side sign out (for use in server components)
export async function signOut() {
  // This would typically be handled by NextAuth on the client side
  // For server components, we redirect to signout page or handle differently
  redirect("/api/auth/signout");
}
