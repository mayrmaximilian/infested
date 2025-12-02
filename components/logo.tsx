import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function Logo({ className }: Props) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-9 w-9 overflow-hidden rounded-lg bg-gradient-to-br from-[#D946EF] via-[#22D3EE] to-[#2DD4BF] shadow-lg shadow-[#D946EF]/40">
        <div className="absolute inset-0 blur-xl bg-gradient-to-br from-[#D946EF] via-transparent to-[#22D3EE]" />
        <span className="relative flex h-full items-center justify-center text-lg font-black text-black">
          in
        </span>
      </div>
      <div className="leading-tight">
        <p className="text-lg font-semibold text-white">infested</p>
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">
          indie hub
        </p>
      </div>
    </div>
  );
}
