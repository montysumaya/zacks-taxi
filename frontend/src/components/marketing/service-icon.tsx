import { Briefcase, Building2, CalendarClock, Plane, Route } from "lucide-react";

const icons = {
  city: Building2,
  airport: Plane,
  scheduled: CalendarClock,
  corporate: Briefcase,
  longDistance: Route,
} as const;

export type ServiceKey = keyof typeof icons;
export const serviceKeys = Object.keys(icons) as ServiceKey[];

export function ServiceIcon({ service, className }: { service: ServiceKey; className?: string }) {
  const Icon = icons[service];
  return <Icon aria-hidden className={className} />;
}
