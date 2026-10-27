"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, Circle, Clock, MapPin, MessageCircle, User } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, PhoneInput, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { buildWhatsAppInquiryMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import type { VehicleClass } from "@/types";

type TripType = "city" | "scheduled" | "airportPickup" | "airportDropoff" | "longDistance";

const allTripTypes: TripType[] = ["city", "scheduled", "airportPickup", "airportDropoff", "longDistance"];
const airportTripTypes: TripType[] = ["airportPickup", "airportDropoff"];
const vehicleClasses: VehicleClass[] = ["economy", "comfort", "business", "van"];
const passengerCounts = ["1", "2", "3", "4", "5", "6", "7", "8+"];

interface Values {
  fullName: string;
  phone: string;
  tripType: TripType;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  vehicle: VehicleClass | "";
  notes: string;
}

type Errors = Partial<Record<keyof Values, string>>;

export interface BookingWidgetProps {
  /** "airport" limits the trip type to airport pickups and drop-offs. */
  variant?: "default" | "airport";
  /** Pre-selects a vehicle category (Fleet "Book now"). */
  initialVehicleClass?: VehicleClass;
  /** Shorter form for the home page hero: passengers, vehicle and notes are left for the WhatsApp chat. */
  compact?: boolean;
  className?: string;
}

/**
 * Booking request form. Nothing is priced or stored by the website: the details
 * are formatted into a WhatsApp message to the business number, and customer
 * service replies manually to confirm the ride and the fare.
 */
export function BookingWidget({ variant = "default", initialVehicleClass, compact, className }: BookingWidgetProps) {
  const { dict } = useI18n();
  const { toast } = useToast();
  const t = dict.booking;
  const tripTypes = variant === "airport" ? airportTripTypes : allTripTypes;

  const [values, setValues] = useState<Values>(() => ({
    fullName: "",
    phone: "",
    tripType: tripTypes[0],
    pickup: variant === "airport" ? t.airport : "",
    dropoff: "",
    date: "",
    time: "",
    passengers: "1",
    vehicle: initialVehicleClass ?? "",
    notes: "",
  }));
  const [errors, setErrors] = useState<Errors>({});

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  /** Airport trips fill in the airport end of the route; switching away clears it again. */
  function changeTripType(tripType: TripType) {
    setValues((v) => {
      const clear = (place: string) => (place === t.airport ? "" : place);
      const pickup = clear(v.pickup);
      const dropoff = clear(v.dropoff);
      if (tripType === "airportPickup") return { ...v, tripType, pickup: t.airport, dropoff };
      if (tripType === "airportDropoff") return { ...v, tripType, pickup, dropoff: t.airport };
      return { ...v, tripType, pickup, dropoff };
    });
    setErrors({});
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.fullName.trim()) next.fullName = t.errors.nameRequired;
    if (!values.phone.trim()) next.phone = t.errors.phoneRequired;
    if (!values.pickup.trim()) next.pickup = t.errors.pickupRequired;
    if (!values.dropoff.trim()) next.dropoff = t.errors.dropoffRequired;
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const form = event.currentTarget;
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }

    const phone = values.phone.trim();
    const message = buildWhatsAppInquiryMessage(
      {
        fullName: values.fullName,
        phone: phone.startsWith("+") ? phone : `+961 ${phone}`,
        tripType: t.tripTypes[values.tripType],
        pickup: values.pickup,
        dropoff: values.dropoff,
        date: values.date,
        time: values.time,
        passengers: compact ? undefined : values.passengers,
        vehicle: values.vehicle ? dict.vehicleClass[values.vehicle].name : undefined,
        notes: values.notes,
      },
      t.message,
    );
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
    toast({ tone: "success", title: t.sentTitle, description: t.sentBody });
  }

  const twoColumns = compact ? "grid gap-4 xs:grid-cols-2" : "grid gap-4 sm:grid-cols-2";

  return (
    <div data-booking-widget className={cn("rounded-2xl border border-border/70 bg-surface p-5 text-foreground shadow-xl sm:p-6", className)}>
      <div className={compact ? "mb-4" : "mb-5"}>
        <h2 className="text-h4 font-bold">{t.title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.subtitle}</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className={compact ? "flex flex-col gap-4" : twoColumns}>
          <Field label={t.fullName} error={errors.fullName} required>
            <Input
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              autoComplete="name"
              startAdornment={<User aria-hidden />}
            />
          </Field>
          <Field label={t.phone} error={errors.phone} required>
            <PhoneInput value={values.phone} onChange={(e) => set("phone", e.target.value)} placeholder="70 000 000" />
          </Field>
        </div>

        {tripTypes.length > 1 && (
          <Field label={t.tripType}>
            <Select value={values.tripType} onChange={(e) => changeTripType(e.target.value as TripType)}>
              {tripTypes.map((type) => (
                <option key={type} value={type}>
                  {t.tripTypes[type]}
                </option>
              ))}
            </Select>
          </Field>
        )}

        <div className={twoColumns}>
          <Field label={t.pickup} error={errors.pickup} required>
            <Input
              value={values.pickup}
              onChange={(e) => set("pickup", e.target.value)}
              placeholder={t.pickupPlaceholder}
              startAdornment={<Circle aria-hidden className="fill-current" />}
            />
          </Field>
          <Field label={t.dropoff} error={errors.dropoff} required>
            <Input
              value={values.dropoff}
              onChange={(e) => set("dropoff", e.target.value)}
              placeholder={t.dropoffPlaceholder}
              startAdornment={<MapPin aria-hidden />}
            />
          </Field>
        </div>

        <div className={twoColumns}>
          <Field label={t.date} optionalLabel={dict.common.optional}>
            <Input
              type="date"
              value={values.date}
              onChange={(e) => set("date", e.target.value)}
              startAdornment={<CalendarDays aria-hidden />}
            />
          </Field>
          <Field label={t.time} optionalLabel={dict.common.optional}>
            <Input
              type="time"
              value={values.time}
              onChange={(e) => set("time", e.target.value)}
              startAdornment={<Clock aria-hidden />}
            />
          </Field>
        </div>

        {!compact && (
          <>
            <div className={twoColumns}>
              <Field label={t.passengers}>
                <Select value={values.passengers} onChange={(e) => set("passengers", e.target.value)}>
                  {passengerCounts.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t.vehicle}>
                <Select value={values.vehicle} onChange={(e) => set("vehicle", e.target.value as Values["vehicle"])}>
                  <option value="">{t.anyVehicle}</option>
                  {vehicleClasses.map((vehicleClass) => (
                    <option key={vehicleClass} value={vehicleClass}>
                      {dict.vehicleClass[vehicleClass].name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label={t.notes} optionalLabel={dict.common.optional}>
              <Textarea
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={3}
                maxLength={1000}
                placeholder={t.notesPlaceholder}
              />
            </Field>
          </>
        )}

        <Button type="submit" variant="accent" size="lg" fullWidth className="mt-1">
          <MessageCircle aria-hidden />
          {t.submit}
        </Button>
        <p className="text-center text-xs text-subtle-foreground">{t.hint}</p>
      </form>
    </div>
  );
}
