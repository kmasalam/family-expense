"use server";

import { signOut } from "./auth-server";

export async function handleSignOut() {
  await signOut();
}
