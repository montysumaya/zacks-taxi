import { notFound } from "next/navigation";

/**
 * This segment only ever renders the 404, so instant-navigation validation
 * (which needs a renderable page) is switched off for it.
 */
export const instant = false;

/** Unmatched URLs under a locale render the localized not-found page with site chrome. */
export default function CatchAll() {
  notFound();
}
