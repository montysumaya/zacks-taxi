import { cn } from "@/lib/cn";

const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm", lg: "size-14 text-lg" } as const;

export interface AvatarProps {
  name: string;
  initials: string;
  src?: string;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({ name, initials, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-800 ring-2 ring-surface",
        sizes[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote avatars of unknown origin
        <img src={src} alt={name} className="size-full object-cover" />
      ) : (
        <span role="img" aria-label={name}>
          {initials}
        </span>
      )}
    </span>
  );
}
