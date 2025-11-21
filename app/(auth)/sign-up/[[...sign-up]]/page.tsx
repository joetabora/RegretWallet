import { SignUp } from "@clerk/nextjs";
import { ReferralSignupHandler } from "@/components/social/referral-signup-handler";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
      <ReferralSignupHandler />
    </div>
  );
}

