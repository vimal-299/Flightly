"use client";
import { createAuthClient } from "better-auth/client";
import { redirect } from "next/navigation";

export default function GoogleSignInButton() {
  const handleGoogleSignIn = async () => {
    try {
      const authClient = createAuthClient();
      const res: any = await authClient.signIn.social({ provider: "google" });

      const redirectUrl = res?.redirectUrl || res?.redirect || res?.url || res?.redirect_to;

      if (redirectUrl && typeof window !== "undefined") {
        window.location.href = redirectUrl;
        return;
      }

      if (res?.session || res?.user) {
        redirect("/home");
        return;
      }

    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  };

  return (
    <button type="button" onClick={handleGoogleSignIn}>
      Sign in with Google
    </button>
  );
}
