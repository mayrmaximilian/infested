import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOutAction } from "@/app/actions/auth";
import { NavLinks } from "@/components/navigation/nav-links";

type Props = {
  userEmail?: string | null;
};

export function Sidebar({ userEmail }: Props) {
  return (
    <aside className="flex h-full w-72 flex-col gap-6 border-r border-[#12131a] bg-[#05060a]/80 px-6 py-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <Logo />
        <span className="rounded-full bg-[#0f1117] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/60">
          beta
        </span>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto pr-1">
        <NavLinks />
      </div>

      <Separator />

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">
            signed in
          </p>
          <p className="text-sm font-medium text-white">
            {userEmail ?? "Player"}
          </p>
        </div>
        <form action={signOutAction}>
          <Button variant="outline" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
