import { brand } from "@/config/brand";

/**
 * Bookings and contact messages are not stored or priced by the website: the
 * visitor's details are formatted into a WhatsApp message that opens on their
 * device, and customer service replies manually with availability and the fare.
 */

export interface WhatsAppInquiryInput {
  fullName: string;
  phone: string;
  tripType?: string;
  pickup?: string;
  dropoff?: string;
  date?: string;
  time?: string;
  passengers?: string;
  vehicle?: string;
  notes?: string;
}

export type WhatsAppInquiryLabels = { greeting: string } & Record<keyof WhatsAppInquiryInput, string>;

export const defaultInquiryLabels: WhatsAppInquiryLabels = {
  greeting: "Hello, I would like to book a ride.",
  fullName: "Name",
  phone: "Phone",
  tripType: "Trip type",
  pickup: "Pickup",
  dropoff: "Destination",
  date: "Date",
  time: "Time",
  passengers: "Passengers",
  vehicle: "Vehicle",
  notes: "Notes",
};

/** Greeting line followed by one "Label: value" line per field; empty values show as "-". */
export function buildWhatsAppMessage(greeting: string, rows: Array<[label: string, value: string | undefined]>) {
  return [greeting, "", ...rows.map(([label, value]) => `${label}: ${value?.trim() || "-"}`)].join("\n");
}

export function buildWhatsAppInquiryMessage(input: WhatsAppInquiryInput, labels: WhatsAppInquiryLabels = defaultInquiryLabels) {
  const fields = Object.keys(defaultInquiryLabels).filter((key) => key !== "greeting") as Array<keyof WhatsAppInquiryInput>;
  return buildWhatsAppMessage(
    labels.greeting,
    fields.map((key) => [labels[key], input[key]]),
  );
}

/** `wa.me` link to the business number with the message prefilled. */
export function buildWhatsAppLink(message: string) {
  const baseUrl = brand.contact.whatsapp.href;
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}text=${encodeURIComponent(message)}`;
}
