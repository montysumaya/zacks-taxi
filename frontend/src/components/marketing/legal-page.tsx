import { TriangleAlert } from "lucide-react";
import { Container, Section } from "@/components/ui/layout";

interface LegalDocument {
  title: string;
  intro: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
}

/** Long-form legal document with a table of contents. */
export function LegalPage({
  document,
  notice,
  updated,
  contentsLabel,
}: {
  document: LegalDocument;
  notice: string;
  updated: string;
  contentsLabel: string;
}) {
  return (
    <>
      <header className="border-b border-border bg-surface-muted">
        <Container size="content" className="flex flex-col gap-4 py-12 sm:py-16">
          <h1 className="text-h1 font-bold">{document.title}</h1>
          <p className="text-sm text-subtle-foreground">{updated}</p>
          <p role="note" className="flex gap-2.5 rounded-md border border-warning/30 bg-warning-soft p-4 text-sm font-medium text-warning-soft-foreground">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {notice}
          </p>
        </Container>
      </header>
      <Section spacing="sm">
        <Container size="content" className="grid gap-12 lg:grid-cols-[15rem_1fr]">
          <nav aria-label={contentsLabel} className="lg:order-2 lg:hidden">
            <TableOfContents document={document} label={contentsLabel} />
          </nav>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents document={document} label={contentsLabel} />
            </div>
          </aside>
          <article className="flex max-w-(--container-prose) flex-col gap-10">
            <p className="text-lead text-muted-foreground">{document.intro}</p>
            {document.sections.map((section, i) => (
              <section key={section.title} id={`section-${i + 1}`} className="flex scroll-mt-24 flex-col gap-3">
                <h2 className="text-h4 font-bold">
                  <span className="me-2 text-subtle-foreground tabular-nums">{i + 1}.</span>
                  {section.title}
                </h2>
                {section.paragraphs.map((p) => (
                  <p key={p} className="leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </section>
            ))}
          </article>
        </Container>
      </Section>
    </>
  );
}

function TableOfContents({ document, label }: { document: LegalDocument; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-bold tracking-wider text-subtle-foreground uppercase">{label}</p>
      <ol className="flex flex-col gap-1 border-s border-border">
        {document.sections.map((section, i) => (
          <li key={section.title}>
            <a
              href={`#section-${i + 1}`}
              className="-ms-px block border-s-2 border-transparent py-1.5 ps-4 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              {section.title}
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}
