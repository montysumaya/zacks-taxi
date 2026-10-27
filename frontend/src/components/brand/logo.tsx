import { cn } from "@/lib/cn";

/** The two yellow chevrons that form the "Z" of the Zacks logo, traced from the brand PDF. */
const chevrons = [
  "195,325 237,291 389,395 291,547 428,639 386,673 219,561 317,408",
  "295,305 337,271 489,376 391,527 528,620 485,654 319,542 416,389",
];

/** Square brand mark: the "Z" chevrons on their own. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="160 250 400 440" aria-hidden className={cn("size-9 shrink-0", className)}>
      {chevrons.map((points) => (
        <polygon key={points} points={points} fill="var(--accent)" />
      ))}
    </svg>
  );
}

/**
 * Full Zacks lockup: "Z" chevrons, "ACKS" wordmark and the "Airport & tourism taxi"
 * tagline. The wordmark is always Latin and left-to-right, in both locales.
 */
export function Logo({
  name,
  tone = "default",
  className,
}: {
  name: string;
  tone?: "default" | "inverse";
  className?: string;
}) {
  return (
    <svg
      role="img"
      aria-label={name}
      viewBox="190 265 850 415"
      direction="ltr"
      className={cn("h-12 w-auto shrink-0", tone === "inverse" ? "text-white" : "text-black", className)}
    >
      {chevrons.map((points) => (
        <polygon key={points} points={points} fill="var(--accent)" />
      ))}
      <g aria-hidden fill="currentColor" fontFamily="var(--font-latin), sans-serif" fontStyle="italic">
        <text x="460" y="511" fontSize="188" fontWeight="800" textLength="575" lengthAdjust="spacingAndGlyphs">
          ACKS
        </text>
        <text x="463" y="545" fontSize="25" fontWeight="700" textLength="572" lengthAdjust="spacing">
          AIRPORT &amp; TOURISM TAXI
        </text>
      </g>
    </svg>
  );
}
