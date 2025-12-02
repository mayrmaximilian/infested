import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function Logo({ className }: Props) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-3", className)} aria-label="Go to home">
      <div className="relative h-12 w-[180px]">
        <Image
          src="/InfestedLogo2.png"
          alt="infested logo"
          fill
          sizes="180px"
          priority
          className="object-contain drop-shadow-[0_0_25px_rgba(217,70,239,0.35)]"
        />
      </div>
    </Link>
  );
}
