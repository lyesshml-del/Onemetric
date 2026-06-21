import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { GoogleButton } from "@/components/auth/google-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in — OneMetric",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // ONE-79 — OAuth/confirm failures redirect here with an `error` param.
  const { error } = await searchParams;
  const errorMessage = error
    ? error === "google" || error === "oauth"
      ? "Google sign-in didn't complete. Please try again, or use your email."
      : "That sign-in link was invalid or expired. Please sign in again."
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your OneMetric account.</CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage ? (
          <p className="text-destructive mb-4 text-sm">{errorMessage}</p>
        ) : null}
        {/* ONE-79 — Google OAuth: one-click sign-in. */}
        <GoogleButton label="Continue with Google" />
        <div className="my-4 flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
