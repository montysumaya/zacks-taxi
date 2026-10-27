export type LocaleCode = "en" | "ar";

/** Text stored in both platform languages. */
export type LocalizedText = Record<LocaleCode, string>;

export type VehicleClass = "economy" | "comfort" | "business" | "van";
