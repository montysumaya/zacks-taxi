"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Checkbox, Radio, RadioGroup } from "@/components/ui/choice";
import type { WizardStep } from "@/features/booking/draft";
import { formatLebanesePhone, normalizeLebanesePhone } from "@/features/booking/phone";
import { localizePath } from "@/i18n/config";
import { formatDateTime, formatMoney, localize } from "@/lib/format";
import type { PaymentMethod } from "@/types";
import type { StepProps } from "./types";

const paymentMethods: PaymentMethod[] = ["cash", "card", "wallet"];

export function ReviewStep({ draft, change, errorFor, t, onEdit }: StepProps & { onEdit: (step: WizardStep) => void }) {
  const { locale, dict } = useI18n();
  const phone = normalizeLebanesePhone(draft.customer.phone);
  const when =
    draft.rideType === "now"
      ? dict.booking.now
      : draft.date && draft.time
        ? formatDateTime(`${draft.date}T${draft.time}:00`, locale, { dateStyle: "full", timeStyle: "short", timeZone: undefined })
        : "—";
  const termsError = errorFor("acceptTerms");

  return (
    <div className="flex flex-col gap-5">
      <SummarySection title={t.tripSection} onEdit={() => onEdit("locations")} editLabel={t.edit}>
        <Row label={dict.booking.pickup} value={draft.pickup ? localize(draft.pickup.name, locale) : "—"} />
        {(draft.pickupLandmark || draft.pickupInstructions) && (
          <Row label={t.pickupNotes} value={[draft.pickupLandmark, draft.pickupInstructions].filter(Boolean).join(" · ")} />
        )}
        <Row label={dict.booking.dropoff} value={draft.dropoff ? localize(draft.dropoff.name, locale) : "—"} />
      </SummarySection>

      <SummarySection title={t.rideSection} onEdit={() => onEdit("details")} editLabel={t.edit}>
        <Row label={dict.booking.when} value={when} />
        <Row
          label={dict.booking.vehicle}
          value={`${draft.vehicleClass ? dict.vehicleClass[draft.vehicleClass].name : "—"} · ${draft.passengers} ${dict.common.seats} · ${draft.luggage} ${dict.common.bags}`}
        />
        {draft.flightNumber && <Row label={dict.booking.flightNumber} value={<span dir="ltr">{draft.flightNumber}</span>} />}
        {draft.notes && <Row label={dict.booking.notes} value={draft.notes} />}
        {draft.quote && (
          <Row label={t.total} value={<strong className="text-base tabular-nums">{formatMoney(draft.quote.total, locale)}</strong>} />
        )}
      </SummarySection>

      <SummarySection title={t.contactSection} onEdit={() => onEdit("customer")} editLabel={t.edit}>
        <Row label={t.fullName} value={draft.customer.fullName} />
        <Row label={t.phone} value={<span dir="ltr">{phone ? formatLebanesePhone(phone) : draft.customer.phone}</span>} />
        {draft.customer.email && <Row label={t.email} value={<span dir="ltr">{draft.customer.email}</span>} />}
        {draft.customer.specialInstructions && <Row label={t.specialInstructions} value={draft.customer.specialInstructions} />}
      </SummarySection>

      <RadioGroup legend={dict.booking.paymentMethod} className="gap-2.5">
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-3">
          {paymentMethods.map((method) => (
            <Radio
              key={method}
              name="booking-payment-method"
              value={method}
              checked={draft.paymentMethod === method}
              onChange={() => change({ paymentMethod: method })}
              label={dict.paymentMethod[method]}
              className="rounded-md border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary-soft/50"
            />
          ))}
        </div>
      </RadioGroup>

      <div className="flex flex-col gap-1.5">
        <Checkbox
          checked={draft.acceptTerms}
          onChange={(e) => change({ acceptTerms: e.target.checked }, ["acceptTerms"])}
          aria-invalid={termsError ? true : undefined}
          aria-describedby={termsError ? "terms-error" : undefined}
          label={
            <>
              {t.acceptTermsPrefix}{" "}
              <Link href={localizePath("/terms", locale)} target="_blank" className="font-semibold text-primary-soft-foreground underline underline-offset-2">
                {t.termsLink}
              </Link>
            </>
          }
        />
        {termsError && (
          <p id="terms-error" className="ps-8 text-sm text-danger">
            {termsError}
          </p>
        )}
      </div>
    </div>
  );
}

function SummarySection({ title, children, onEdit, editLabel }: { title: string; children: ReactNode; onEdit: () => void; editLabel: string }) {
  return (
    <section className="rounded-lg border border-border">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <h3 className="text-sm font-bold">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-sm px-2 py-1 text-sm font-semibold text-primary-soft-foreground hover:bg-primary-soft"
        >
          <Pencil aria-hidden className="size-3.5" />
          {editLabel}
          <span className="sr-only">: {title}</span>
        </button>
      </header>
      <dl className="divide-y divide-border">{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground sm:text-end">{value}</dd>
    </div>
  );
}
