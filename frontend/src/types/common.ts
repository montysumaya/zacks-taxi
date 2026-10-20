/** Opaque identifier as returned by the API (Laravel UUID / ULID). */
export type ID = string;

/** ISO-8601 timestamp, e.g. "2026-10-20T14:30:00+03:00". */
export type ISODateString = string;

export type LocaleCode = "en" | "ar";

/** Text stored in both platform languages. */
export type LocalizedText = Record<LocaleCode, string>;

export type CurrencyCode = "USD" | "LBP";

/** Monetary value in major units (e.g. 12.5 USD). */
export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type PlaceKind = "address" | "airport" | "landmark" | "city";

export interface Place {
  id?: ID;
  name: LocalizedText;
  address?: LocalizedText;
  kind: PlaceKind;
  location: GeoPoint;
}

export type VehicleClass = "economy" | "comfort" | "business" | "van";

export type PaymentMethod = "cash" | "card" | "wallet";

export interface DateRange {
  from: ISODateString;
  to: ISODateString;
}
