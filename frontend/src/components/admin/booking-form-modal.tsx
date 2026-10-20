"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useToast } from "@/components/ui/toast";
import { normalizeLebanesePhone } from "@/features/booking/phone";
import { interpolate } from "@/i18n/interpolate";
import { localize } from "@/lib/format";
import { placeList } from "@/mocks/fixtures/places";
import { services } from "@/services";
import type { Booking, BookingType, PaymentMethod, VehicleClass } from "@/types";
import { useAdmin } from "./admin-provider";

type Errors = Partial<Record<"fullName" | "phone" | "email" | "pickup" | "dropoff" | "when", string>>;

const classes: VehicleClass[] = ["economy", "comfort", "business", "van"];
const methods: PaymentMethod[] = ["cash", "card", "wallet"];

function toLocalParts(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** Create (phone / walk-in) or edit a booking. Fares are priced by the service. */
export function BookingFormModal({
  open,
  onClose,
  booking,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  /** When set, the modal edits this booking. */
  booking?: Booking;
  onSaved: (booking: Booking) => void;
}) {
  const { t, dict, locale } = useAdmin();
  const { toast } = useToast();
  const f = t.bookings.form;
  const initialParts = booking ? toLocalParts(booking.scheduledAt) : { date: "", time: "" };

  const [source, setSource] = useState<"phone" | "walk_in">("phone");
  const [type, setType] = useState<BookingType>(booking?.type ?? "immediate");
  const [fullName, setFullName] = useState(booking?.contact.fullName ?? "");
  const [phone, setPhone] = useState(booking?.contact.phone.replace(/^\+961/, "") ?? "");
  const [email, setEmail] = useState(booking?.contact.email ?? "");
  const [pickupId, setPickupId] = useState(booking?.pickup.id ?? "");
  const [dropoffId, setDropoffId] = useState(booking?.dropoff.id ?? "");
  const [instructions, setInstructions] = useState(booking?.pickupInstructions ?? "");
  const [date, setDate] = useState(initialParts.date);
  const [time, setTime] = useState(initialParts.time);
  const [passengers, setPassengers] = useState(booking?.passengers ?? 1);
  const [luggage, setLuggage] = useState(booking?.luggage ?? 1);
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>(booking?.vehicleClass ?? "economy");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(booking?.paymentMethod ?? "cash");
  const [flightNumber, setFlightNumber] = useState(booking?.flightNumber ?? "");
  const [notes, setNotes] = useState(booking?.notes ?? "");
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);

  const pickup = placeList.find((p) => p.id === pickupId);
  const dropoff = placeList.find((p) => p.id === dropoffId);
  const airport = pickup?.kind === "airport" || dropoff?.kind === "airport";

  async function submit(event: FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    const normalizedPhone = normalizeLebanesePhone(phone);
    if (!fullName.trim()) next.fullName = t.common.fieldRequired;
    if (!normalizedPhone) next.phone = t.common.invalidPhone;
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) next.email = t.common.invalidEmail;
    if (!pickup) next.pickup = t.common.fieldRequired;
    if (!dropoff) next.dropoff = t.common.fieldRequired;
    if (pickup && dropoff && pickup.id === dropoff.id) next.dropoff = f.samePlace;
    let scheduledAt = booking?.scheduledAt ?? new Date().toISOString();
    if (type === "scheduled") {
      const when = new Date(`${date}T${time}`);
      const changed = !booking || date !== initialParts.date || time !== initialParts.time;
      if (!date || !time || Number.isNaN(when.getTime())) next.when = t.common.fieldRequired;
      else if (changed && when.getTime() < Date.now()) next.when = f.pastTime;
      else scheduledAt = when.toISOString();
    } else if (!booking) {
      scheduledAt = new Date().toISOString();
    }
    setErrors(next);
    if (Object.keys(next).length || !pickup || !dropoff || !normalizedPhone) return;

    setSaving(true);
    const common = {
      contact: { fullName: fullName.trim(), phone: normalizedPhone, email: email.trim() || undefined },
      pickup,
      dropoff,
      pickupInstructions: instructions.trim() || undefined,
      scheduledAt,
      passengers,
      luggage,
      vehicleClass,
      paymentMethod,
      flightNumber: airport ? flightNumber.trim().toUpperCase() || undefined : undefined,
      notes: notes.trim() || undefined,
    };
    try {
      const saved = booking
        ? await services.bookings.update(booking.id, common)
        : await services.bookings.createManual({ ...common, source, type });
      toast({ tone: "success", title: interpolate(booking ? f.updated : f.created, { reference: saved.reference }) });
      onSaved(saved);
      onClose();
    } catch {
      toast({ tone: "error", title: t.common.saveFailed });
    } finally {
      setSaving(false);
    }
  }

  const placeOptions = placeList.map((p) => (
    <option key={p.id} value={p.id}>
      {localize(p.name, locale)}
    </option>
  ));

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      dismissible={!saving}
      title={booking ? interpolate(f.editTitle, { reference: booking.reference }) : f.createTitle}
      description={booking ? f.fareNote : f.createDescription}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t.common.cancel}
          </Button>
          <Button type="submit" form="booking-form" loading={saving}>
            {booking ? t.common.save : t.common.create}
          </Button>
        </>
      }
    >
      <form id="booking-form" noValidate onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        {!booking && (
          <>
            <SegmentedControl
              legend={f.source}
              value={source}
              onChange={setSource}
              options={[
                { value: "phone", label: t.bookingSource.phone },
                { value: "walk_in", label: t.bookingSource.walk_in },
              ]}
            />
            <SegmentedControl
              legend={f.when}
              value={type}
              onChange={setType}
              options={[
                { value: "immediate", label: t.bookingType.immediate },
                { value: "scheduled", label: t.bookingType.scheduled },
              ]}
            />
          </>
        )}
        <Field label={f.customerName} error={errors.fullName} required>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="off" />
        </Field>
        <Field label={f.customerPhone} error={errors.phone} required>
          <PhoneInput value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="70 123 456" />
        </Field>
        <Field label={f.customerEmail} error={errors.email} optionalLabel={t.common.optional} className="sm:col-span-2">
          <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} className="rtl:text-right" />
        </Field>
        <Field label={f.pickup} error={errors.pickup} required>
          <Select value={pickupId} onChange={(e) => setPickupId(e.target.value)}>
            <option value="">—</option>
            {placeOptions}
          </Select>
        </Field>
        <Field label={f.dropoff} error={errors.dropoff} required>
          <Select value={dropoffId} onChange={(e) => setDropoffId(e.target.value)}>
            <option value="">—</option>
            {placeOptions}
          </Select>
        </Field>
        <Field label={f.instructions} optionalLabel={t.common.optional} className="sm:col-span-2">
          <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} maxLength={300} />
        </Field>
        {type === "scheduled" && (
          <>
            <Field label={f.date} error={errors.when} required>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label={f.time} required>
              <Input type="time" step={300} value={time} onChange={(e) => setTime(e.target.value)} />
            </Field>
          </>
        )}
        <Field label={f.passengers}>
          <Select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </Select>
        </Field>
        <Field label={f.luggage}>
          <Select value={luggage} onChange={(e) => setLuggage(Number(e.target.value))}>
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </Select>
        </Field>
        <Field label={f.vehicleClass}>
          <Select value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value as VehicleClass)}>
            {classes.map((c) => (
              <option key={c} value={c}>
                {dict.vehicleClass[c].name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={f.payment}>
          <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
            {methods.map((m) => (
              <option key={m} value={m}>
                {dict.paymentMethod[m]}
              </option>
            ))}
          </Select>
        </Field>
        {airport && (
          <Field label={f.flight} optionalLabel={t.common.optional}>
            <Input value={flightNumber} onChange={(e) => setFlightNumber(e.target.value)} dir="ltr" className="rtl:text-right" />
          </Field>
        )}
        <Field label={f.notes} optionalLabel={t.common.optional} className="sm:col-span-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} className="min-h-20" />
        </Field>
      </form>
    </Modal>
  );
}
