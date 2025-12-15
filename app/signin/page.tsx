import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInClient from "./SignInClient";

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) { // If user is already looged in, redirect to home
    redirect("/home");
  }

  return <SignInClient googleButton={<GoogleSignInButton />} />;
}