import Image from "next/image";
import { cn } from "@/lib/utils";

export function UpdraftedLogo({
  className,
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/updrafted-logo.png"
      alt="UpDrafted"
      width={528}
      height={141}
      priority={priority}
      className={cn("h-auto w-auto object-contain", className)}
    />
  );
}
