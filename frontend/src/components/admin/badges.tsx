"use client";

import { Badge, type BadgeTone } from "@/components/ui/badge";
import { expiryState } from "@/features/admin/format";
import { statusTones } from "@/features/booking/status";
import { interpolate } from "@/i18n/interpolate";
import type { BookingStatus, DriverStatus, PaymentStatus, StaffMember, VehicleStatus } from "@/types";
import { useAdmin } from "./admin-provider";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { dict } = useAdmin();
  return (
    <Badge tone={statusTones[status]} dot size="sm">
      {dict.status.booking[status]}
    </Badge>
  );
}

const driverTones: Record<DriverStatus, BadgeTone> = { available: "success", on_trip: "info", offline: "neutral", suspended: "danger" };
export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  const { dict } = useAdmin();
  return (
    <Badge tone={driverTones[status]} dot size="sm">
      {dict.status.driver[status]}
    </Badge>
  );
}

const vehicleTones: Record<VehicleStatus, BadgeTone> = { active: "success", maintenance: "warning", inactive: "neutral" };
export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const { t } = useAdmin();
  return (
    <Badge tone={vehicleTones[status]} dot size="sm">
      {t.vehicles.status[status]}
    </Badge>
  );
}

const paymentTones: Record<PaymentStatus, BadgeTone> = { pending: "warning", authorized: "info", paid: "success", failed: "danger", refunded: "neutral" };
export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { dict } = useAdmin();
  return (
    <Badge tone={paymentTones[status]} dot size="sm">
      {dict.status.payment[status]}
    </Badge>
  );
}

const staffTones: Record<StaffMember["status"], BadgeTone> = { active: "success", invited: "info", suspended: "danger" };
export function StaffStatusBadge({ status }: { status: StaffMember["status"] }) {
  const { t } = useAdmin();
  return (
    <Badge tone={staffTones[status]} dot size="sm">
      {t.staff.status[status]}
    </Badge>
  );
}

/** Document expiry indicator: valid / expires in N days / expired. */
export function ExpiryBadge({ iso, now, label }: { iso?: string; now: number; label?: string }) {
  const { t } = useAdmin();
  const { state, days } = expiryState(iso, now);
  const tone: BadgeTone = state === "expired" ? "danger" : state === "expiring" ? "warning" : "success";
  const text = state === "expired" ? t.vehicles.docState.expired : state === "expiring" ? interpolate(t.vehicles.docState.expiring, { days }) : t.vehicles.docState.ok;
  return (
    <Badge tone={tone} dot size="sm" title={label}>
      {label ? `${label}: ${text}` : text}
    </Badge>
  );
}
