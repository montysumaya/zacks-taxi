import type { ReactNode } from "react";
import { CircleAlert, Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

interface StateProps {
  title: ReactNode;
  description?: ReactNode;
  /** Primary/secondary actions, e.g. a retry button or a link. */
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
  /** Compact variant for use inside cards and tables. */
  compact?: boolean;
}

function StateLayout({
  title,
  description,
  actions,
  icon,
  className,
  compact,
  iconClassName,
  role,
}: StateProps & { iconClassName: string; role?: string }) {
  return (
    <div
      role={role}
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-3 px-4 py-8" : "gap-4 px-6 py-14 sm:py-20",
        className,
      )}
    >
      <div
        className={cn(
          "grid place-items-center rounded-2xl [&_svg]:size-6",
          compact ? "size-12" : "size-16 [&_svg]:size-7",
          iconClassName,
        )}
      >
        {icon}
      </div>
      <div className="flex max-w-md flex-col gap-1.5">
        <h3 className={cn("font-semibold text-foreground", compact ? "text-h6" : "text-h4")}>{title}</h3>
        {description && <p className="text-sm text-muted-foreground sm:text-[0.9375rem]">{description}</p>}
      </div>
      {actions && <div className="mt-2 flex flex-wrap items-center justify-center gap-3">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon, ...props }: StateProps) {
  return (
    <StateLayout
      {...props}
      icon={icon ?? <Inbox aria-hidden />}
      iconClassName="bg-surface-sunken text-subtle-foreground ring-8 ring-surface-muted"
    />
  );
}

export function ErrorState({ icon, ...props }: StateProps) {
  return (
    <StateLayout
      {...props}
      role="alert"
      icon={icon ?? <CircleAlert aria-hidden />}
      iconClassName="bg-danger-soft text-danger ring-8 ring-danger-soft/50"
    />
  );
}
