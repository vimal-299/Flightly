import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignUpClient from "./SignUpClient";

export default async function SignUpPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) { // If user is already looged in, redirect to home
    redirect("/home");
  }
  return <SignUpClient googleButton={<GoogleSignInButton />} />;
}
