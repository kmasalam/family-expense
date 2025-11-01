import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";

// Client-side sign in function
export const signIn = nextAuthSignIn;

// Client-side sign out function
export const signOut = nextAuthSignOut;
