"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { stepIndex, wizardSteps, type BookingDraft, type WizardStep } from "@/features/booking/draft";
import { bookingDraftStore, useBookingDraft, useHydrated } from "@/features/booking/draft-store";
import { draftToCreateInput } from "@/features/booking/to-input";
import { firstInvalidStep, validateStep, type FieldKey, type StepErrors } from "@/features/booking/validation";
import { services } from "@/services";
import { ServiceError, type Booking, type VehicleClass, type VehicleClassSummary } from "@/types";
import { BookingSuccess } from "./booking-success";
import { CustomerStep } from "./customer-step";
import { DetailsStep } from "./details-step";
import { FareStep } from "./fare-step";
import { LocationsStep } from "./locations-step";
import { ReviewStep } from "./review-step";
import { RideStep } from "./ride-step";
import { TripSummary } from "./trip-summary";
import { WizardProgress } from "./wizard-progress";
import type { StepProps } from "./types";

export interface BookingWizardProps {
  classes: VehicleClassSummary[];
  /** From `?class=` (Fleet "Book now"): preselects a category once. */
  initialVehicleClass?: VehicleClass;
}

/**
 * Multi-step booking flow. Owns navigation, validation and submission; each
 * step only renders fields. All data access goes through `services`.
 */
export function BookingWizard({ classes, initialVehicleClass }: BookingWizardProps) {
  const { dict } = useI18n();
  const { toast } = useToast();
  const t = dict.bookingFlow;
  const hydrated = useHydrated();
  const { draft, update, reset } = useBookingDraft();
  const [errors, setErrors] = useState<StepErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [startOverOpen, setStartOverOpen] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocusHeading = useRef(false);

  useEffect(() => {
    if (initialVehicleClass) bookingDraftStore.update({ vehicleClass: initialVehicleClass });
  }, [initialVehicleClass]);

  // Move focus to the new step's heading after navigation (not on first load).
  useEffect(() => {
    if (!shouldFocusHeading.current) return;
    shouldFocusHeading.current = false;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "nearest" });
  }, [draft.step]);

  const change = useCallback((patch: Partial<BookingDraft>, fields: FieldKey[] = []) => {
    update(patch);
    if (fields.length) {
      setErrors((current) => {
        if (!fields.some((f) => f in current)) return current;
        const next = { ...current };
        fields.forEach((f) => delete next[f]);
        return next;
      });
    }
  }, [update]);

  const errorFor = (field: FieldKey) => {
    const code = errors[field];
    return code ? t.errors[code] : undefined;
  };

  function goTo(step: WizardStep) {
    shouldFocusHeading.current = true;
    setErrors({});
    update({ step });
  }

  function showErrors(next: StepErrors) {
    setErrors(next);
    requestAnimationFrame(() =>
      document
        .querySelector<HTMLElement>("[data-booking-wizard] [aria-invalid='true'], [data-booking-wizard] [data-invalid='true'] input")
        ?.focus(),
    );
  }

  const ctx = () => ({ now: Date.now(), classes });
  const index = stepIndex(draft.step);
  const isLast = index === wizardSteps.length - 1;

  function next() {
    const stepErrors = validateStep(draft.step, draft, ctx());
    if (Object.keys(stepErrors).length) return showErrors(stepErrors);
    if (isLast) return submit();
    goTo(wizardSteps[index + 1]);
  }

  async function submit() {
    // Re-check every step: the draft may have been restored from storage.
    const invalid = firstInvalidStep(wizardSteps, draft, ctx());
    if (invalid && invalid !== "review") {
      goTo(invalid);
      requestAnimationFrame(() => setErrors(validateStep(invalid, draft, ctx())));
      return;
    }
    setSubmitting(true);
    try {
      const booking = await services.bookings.create(draftToCreateInput(draft));
      setConfirmed(booking);
      // Keep contact details for the next booking; clear the trip.
      reset({ customer: draft.customer });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      if (error instanceof ServiceError && error.code === "invalid_quote") {
        update({ quote: null });
        goTo("fare");
        toast({ tone: "warning", title: t.errors.quoteExpired });
      } else {
        toast({ tone: "error", title: t.errors.submitFailed });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return <BookingSuccess booking={confirmed} onBookAnother={() => setConfirmed(null)} />;
  }

  if (!hydrated) return <WizardSkeleton />;

  const stepProps: StepProps = { draft, change, errors, errorFor, classes, t };
  const steps: Record<WizardStep, ReactNode> = {
    ride: <RideStep {...stepProps} />,
    locations: <LocationsStep {...stepProps} />,
    details: <DetailsStep {...stepProps} />,
    fare: <FareStep {...stepProps} />,
    customer: <CustomerStep {...stepProps} />,
    review: <ReviewStep {...stepProps} onEdit={goTo} />,
  };
  const hasErrors = Object.keys(errors).length > 0;
  const nextDisabled = draft.step === "fare" && !draft.quote;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
      <div data-booking-wizard className="flex flex-col rounded-2xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-5 py-4 sm:px-7">
          <WizardProgress current={draft.step} onSelect={goTo} />
        </div>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          className="flex flex-col"
        >
          <div key={draft.step} className="flex animate-fade-in flex-col gap-6 px-5 py-6 sm:px-7 sm:py-8">
            <header className="flex flex-col gap-1.5">
              <h2 ref={headingRef} tabIndex={-1} className="text-h3 font-bold outline-none">
                {t.steps[draft.step].heading}
              </h2>
              <p className="text-muted-foreground">{t.steps[draft.step].description}</p>
            </header>
            {hasErrors && (
              <p role="alert" className="rounded-md bg-danger-soft px-4 py-3 text-sm font-medium text-danger-soft-foreground">
                {t.checkFields}
              </p>
            )}
            {steps[draft.step]}
          </div>

          <div className="sticky bottom-0 z-20 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border bg-surface/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-7 sm:py-4">
            {index > 0 ? (
              <Button variant="ghost" onClick={() => goTo(wizardSteps[index - 1])} disabled={submitting}>
                <ArrowLeft aria-hidden className="rtl:-scale-x-100" />
                {t.back}
              </Button>
            ) : (
              <span />
            )}
            <Button type="submit" variant={isLast ? "accent" : "primary"} size="lg" loading={submitting} disabled={nextDisabled} className="min-w-36">
              {isLast ? t.confirm : t.next}
              {!isLast && <ArrowRight aria-hidden className="rtl:-scale-x-100" />}
            </Button>
          </div>
        </form>
      </div>

      <div className="hidden lg:sticky lg:top-24 lg:block">
        <TripSummary draft={draft} onStartOver={() => setStartOverOpen(true)} />
      </div>
      <button type="button" onClick={() => setStartOverOpen(true)} className="text-sm font-semibold text-danger hover:underline lg:hidden">
        {t.startOver}
      </button>

      <ConfirmDialog
        open={startOverOpen}
        onClose={() => setStartOverOpen(false)}
        tone="danger"
        title={t.startOverTitle}
        description={t.startOverBody}
        confirmLabel={t.startOver}
        onConfirm={() => {
          reset();
          setErrors({});
          setStartOverOpen(false);
        }}
      />
    </div>
  );
}

function WizardSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-7 shadow-lg">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="ms-auto h-13 w-36" />
      </div>
      <Skeleton className="hidden h-96 rounded-2xl lg:block" />
    </div>
  );
}
