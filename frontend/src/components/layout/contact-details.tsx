import type { ReactNode } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { brand } from "@/config/brand";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

interface Labels {
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  hours: string;
  placeholder: string;
}

/**
 * Business contact details from `config/brand.ts`. Any field flagged as a
 * placeholder is visibly labelled so unverified details are never presented as real.
 */
export function ContactDetails({
  locale,
  labels,
  tone = "default",
  include = ["phone", "whatsapp", "email", "address", "hours"],
  className,
}: {
  locale: Locale;
  labels: Labels;
  tone?: "default" | "inverse";
  include?: Array<"phone" | "whatsapp" | "email" | "address" | "hours">;
  className?: string;
}) {
  const { contact } = brand;
  const rows: Record<(typeof include)[number], { icon: ReactNode; value: ReactNode; href?: string; placeholder: boolean; ltr?: boolean }> = {
    phone: { icon: <Phone />, value: contact.phone.display, href: contact.phone.href, placeholder: contact.phone.placeholder, ltr: true },
    whatsapp: { icon: <MessageCircle />, value: contact.whatsapp.display, href: contact.whatsapp.href, placeholder: contact.whatsapp.placeholder, ltr: true },
    email: { icon: <Mail />, value: contact.email.display, href: contact.email.href, placeholder: contact.email.placeholder, ltr: true },
    address: { icon: <MapPin />, value: contact.address.display[locale], placeholder: contact.address.placeholder },
    hours: { icon: <Clock />, value: contact.hours.display[locale], placeholder: contact.hours.placeholder },
  };
  const inverse = tone === "inverse";

  return (
    <dl className={cn("flex flex-col gap-4", className)}>
      {include.map((key) => {
        const row = rows[key];
        const value = row.ltr ? <span dir="ltr">{row.value}</span> : row.value;
        return (
          // Only <dt>/<dd> may sit directly in the group, so the icon lives inside the <dt>, positioned in the gutter.
          <div key={key} className="relative flex min-h-10 min-w-0 flex-col justify-center gap-0.5 ps-13">
            <dt className={cn("text-xs font-semibold uppercase tracking-wider", inverse ? "text-white/60" : "text-subtle-foreground")}>
              <span
                aria-hidden
                className={cn(
                  "absolute start-0 top-0 grid size-10 place-items-center rounded-md [&_svg]:size-[1.125rem]",
                  inverse ? "bg-white/10 text-accent" : "bg-primary-soft text-primary-soft-foreground",
                )}
              >
                {row.icon}
              </span>
              {labels[key]}
            </dt>
            <dd className="flex flex-wrap items-center gap-2">
              {row.href ? (
                <a
                  href={row.href}
                  {...(key === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={cn("font-semibold hover:underline", inverse ? "text-white" : "text-foreground")}
                >
                  {value}
                </a>
              ) : (
                <span className={cn("font-medium", inverse ? "text-white/90" : "text-foreground")}>{value}</span>
              )}
              {row.placeholder && (
                <Badge tone={inverse ? "accent" : "warning"} size="sm">
                  {labels.placeholder}
                </Badge>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
