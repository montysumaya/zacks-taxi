import { describe, expect, it } from "vitest";
import { buildWhatsAppInquiryMessage, buildWhatsAppLink } from "@/lib/whatsapp";

describe("whatsapp inquiry builder", () => {
  it("creates a message with the customer trip details", () => {
    const message = buildWhatsAppInquiryMessage({
      fullName: "Lara Mansour",
      phone: "+961 70 123 456",
      tripType: "Airport transfer",
      pickup: "Beirut Airport",
      dropoff: "Hamra",
      date: "2026-11-12",
      time: "09:30",
      passengers: "2",
      notes: "Need a child seat.",
    });

    expect(message).toContain("Lara Mansour");
    expect(message).toContain("Airport transfer");
    expect(message).toContain("Beirut Airport");
    expect(message).toContain("Hamra");
    expect(message).toContain("Need a child seat.");
  });

  it("uses the given labels and marks empty fields", async () => {
    const { default: ar } = await import("@/i18n/dictionaries/ar");
    const message = buildWhatsAppInquiryMessage({ fullName: "لارا", phone: "+961 70 123 456", pickup: "الحمرا" }, ar.booking.message);

    expect(message.split("\n")[0]).toBe(ar.booking.message.greeting);
    expect(message).toContain("الاسم: لارا");
    expect(message).toContain(`${ar.booking.message.dropoff}: -`);
  });

  it("builds a WhatsApp URL that opens with the prefilled text", () => {
    const link = buildWhatsAppLink("Hello");

    expect(link).toContain("wa.me");
    expect(link).toContain("text=");
    expect(link).toContain("Hello");
  });
});
