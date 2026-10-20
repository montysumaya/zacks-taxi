import type { CurrencyCode, ID, ISODateString, LocaleCode, Place } from "./common";

export interface SavedPlace {
  id: ID;
  label: "home" | "work" | "other";
  customLabel?: string;
  place: Place;
}

export interface Customer {
  id: ID;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  preferredLocale: LocaleCode;
  preferredCurrency: CurrencyCode;
  rating?: number;
  totalBookings: number;
  savedPlaces: SavedPlace[];
  createdAt: ISODateString;
}
