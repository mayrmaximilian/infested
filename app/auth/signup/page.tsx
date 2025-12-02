import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignupForm } from "@/components/auth/signup-form";
import { Separator } from "@/components/ui/separator";

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_20%,#D946EF26,transparent_35%),radial-gradient(circle_at_90%_10%,#2DD4BF26,transparent_30%),linear-gradient(140deg,#05060a,#020203)]" />
      <div className="absolute inset-10 -z-10 rounded-3xl border border-white/5 bg-white/10 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-6">
          <Logo />
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Join the infected network.
          </h1>
          <p className="text-lg text-white/70">
            A curated home for indie gamers and creators. Stay synced with
            releases, backstage drops, and community signals.
          </p>
          <Separator className="w-40" />
          <p className="text-sm text-white/60">
            Have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#22D3EE] underline underline-offset-4"
            >
              Jump in here
            </Link>
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
