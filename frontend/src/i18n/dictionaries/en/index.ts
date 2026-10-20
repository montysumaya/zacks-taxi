import core from "./core";
import legal from "./legal";
import pages from "./pages";

const en = { ...core, pages, legal };
export default en;

type DeepStringify<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? DeepStringify<U>[]
    : { [K in keyof T]: DeepStringify<T[K]> };

export type Dictionary = DeepStringify<typeof en>;

/** The subset of the dictionary sent to Client Components. */
export const clientKeys = [
  "meta",
  "common",
  "nav",
  "booking",
  "bookingFlow",
  "bookingStatus",
  "contactForm",
  "vehicleClass",
  "vehicleFeature",
  "paymentMethod",
  "status",
  "states",
  "toast",
] as const satisfies readonly (keyof Dictionary)[];

export type ClientDictionary = Pick<Dictionary, (typeof clientKeys)[number]>;
