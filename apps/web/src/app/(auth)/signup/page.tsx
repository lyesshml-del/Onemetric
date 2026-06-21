import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { GoogleButton } from "@/components/auth/google-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign up — OneMetric",
};

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>
          Start tracking with OneMetric in under a minute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* ONE-79 — Google OAuth: one-click sign-up, no email-confirmation wait. */}
        <GoogleButton label="Sign up with Google" />
        <div className="my-4 flex items-center gap-3">
          <div className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-xs">or</span>
          <div className="bg-border h-px flex-1" />
        </div>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
