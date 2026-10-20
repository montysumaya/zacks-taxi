import type { BookingDraft } from "@/features/booking/draft";
import type { FieldKey, StepErrors } from "@/features/booking/validation";
import type { ClientDictionary } from "@/i18n/dictionaries/en";
import type { VehicleClassSummary } from "@/types";

/** Props every wizard step receives from the orchestrator. */
export interface StepProps {
  draft: BookingDraft;
  /** Update the draft and clear the errors of the fields being edited. */
  change: (patch: Partial<BookingDraft>, fields?: FieldKey[]) => void;
  errors: StepErrors;
  /** Translated message for a field's current error, if any. */
  errorFor: (field: FieldKey) => string | undefined;
  classes: VehicleClassSummary[];
  t: ClientDictionary["bookingFlow"];
}
