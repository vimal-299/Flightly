import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import LandingContent from "@/app/components/LandingContent";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <LandingContent isLoggedIn={!!session} />;
}