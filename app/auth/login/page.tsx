import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "@/components/auth/login-form";
import { Separator } from "@/components/ui/separator";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#D946EF26,transparent_35%),radial-gradient(circle_at_80%_0%,#22D3EE1f,transparent_30%),linear-gradient(140deg,#05060a,#020203)]" />
      <div className="absolute inset-10 -z-10 rounded-3xl border border-white/5 bg-white/10 blur-3xl" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-6">
          <Logo />
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            Plug back into the swarm.
          </h1>
          <p className="text-lg text-white/70">
            Securely sign in to your infested cockpit, track drops, sync your
            indie library, and keep pulse on creators you love.
          </p>
          <Separator className="w-40" />
          <p className="text-sm text-white/60">
            No account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#22D3EE] underline underline-offset-4"
            >
              Create one here
            </Link>
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
