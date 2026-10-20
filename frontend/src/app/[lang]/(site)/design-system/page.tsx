import type { ReactNode } from "react";
import { ArrowRight, Plus, TrendingUp } from "lucide-react";
import { FormDemo, OverlayDemo } from "@/components/design-system/interactive-demos";
import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button, type ButtonVariant } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container, Grid, Section } from "@/components/ui/layout";
import { Skeleton, SkeletonText } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { formatMoney, formatNumber, formatPercent } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { dashboardMetrics } from "@/mocks/fixtures/dashboard";
import { statusTones } from "@/features/booking/status";
import type { BookingStatus } from "@/types";

export async function generateMetadata() {
  const { meta } = (await getDictionary()).pages.designSystem;
  return pageMetadata({ path: "/design-system", ...meta, noIndex: true });
}

const swatches = [
  ["primary", "bg-primary"],
  ["accent", "bg-accent"],
  ["surface-inverse", "bg-surface-inverse"],
  ["success", "bg-success"],
  ["warning", "bg-warning"],
  ["danger", "bg-danger"],
  ["info", "bg-info"],
  ["surface", "bg-surface"],
  ["surface-muted", "bg-surface-muted"],
  ["border", "bg-border"],
] as const;

const brandRamp = ["bg-brand-50", "bg-brand-100", "bg-brand-200", "bg-brand-300", "bg-brand-400", "bg-brand-500", "bg-brand-600", "bg-brand-700", "bg-brand-800", "bg-brand-900", "bg-brand-950"];
const buttonVariants: ButtonVariant[] = ["primary", "accent", "secondary", "soft", "ghost", "danger", "link"];
const badgeTones: BadgeTone[] = ["neutral", "brand", "accent", "success", "warning", "danger", "info", "solid"];

function DsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-6 border-t border-border pt-10">
      <h2 className="text-h3 font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default async function DesignSystemPage() {
  const locale = await getLocale();
  const dict = await getDictionary(locale);
  const m = dashboardMetrics;

  return (
    <Section spacing="sm">
      <Container className="flex flex-col gap-12">
        <header className="flex flex-col gap-3">
          <Eyebrow>Phase 1</Eyebrow>
          <Heading level={1}>{dict.pages.designSystem.title}</Heading>
          <Text tone="muted" size="lead">
            {dict.pages.designSystem.subtitle}
          </Text>
        </header>

        <DsSection title="Color tokens">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {swatches.map(([name, cls]) => (
              <div key={name} className="flex flex-col gap-2">
                <div className={`h-16 rounded-md border border-border ${cls}`} />
                <code className="text-xs text-muted-foreground">{name}</code>
              </div>
            ))}
          </div>
          <div className="flex overflow-hidden rounded-md">
            {brandRamp.map((cls) => (
              <div key={cls} className={`h-10 flex-1 ${cls}`} />
            ))}
          </div>
        </DsSection>

        <DsSection title="Typography">
          <div className="flex flex-col gap-3">
            <p className="text-display font-extrabold">Display</p>
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
              <Heading key={level} level={level}>
                Heading {level} — {dict.pages.home.hero.title}
              </Heading>
            ))}
            <Text size="lead" tone="muted">
              Lead — {dict.pages.home.hero.subtitle}
            </Text>
            <Text>Body — {dict.pages.about.intro.paragraphs[0]}</Text>
            <Text size="sm" tone="subtle">
              Small — {dict.booking.fareNote}
            </Text>
          </div>
        </DsSection>

        <DsSection title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            {buttonVariants.map((variant) => (
              <Button key={variant} variant={variant}>
                {variant}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Medium</Button>
            <Button size="lg">
              Large <ArrowRight className="rtl:-scale-x-100" />
            </Button>
            <Button size="icon" variant="secondary" aria-label="Add">
              <Plus />
            </Button>
            <Button loading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
        </DsSection>

        <DsSection title="Form controls">
          <FormDemo />
        </DsSection>

        <DsSection title="Cards, badges & avatars">
          <div className="flex flex-wrap gap-2">
            {badgeTones.map((tone) => (
              <Badge key={tone} tone={tone} dot>
                {tone}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(statusTones) as BookingStatus[]).map((status) => (
              <Badge key={status} tone={statusTones[status]} dot>
                {dict.status.booking[status]}
              </Badge>
            ))}
          </div>
          <Grid cols={3}>
            <Card>
              <CardHeader>
                <CardTitle>Elevated card</CardTitle>
                <CardDescription>Default surface for content.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar name="Karim Haddad" initials="KH" />
                <div>
                  <p className="font-semibold">Karim Haddad</p>
                  <p className="text-sm text-muted-foreground">Mercedes E-Class · B 100772</p>
                </div>
              </CardContent>
              <CardFooter>
                <Badge tone="success" dot>
                  {dict.status.driver.available}
                </Badge>
              </CardFooter>
            </Card>
            <Card variant="outline" interactive>
              <CardTitle>Interactive card</CardTitle>
              <CardDescription className="mt-1.5">Lifts on hover.</CardDescription>
            </Card>
            <Card variant="inverse">
              <CardTitle className="text-white">Inverse card</CardTitle>
              <CardDescription className="mt-1.5 text-white/70">For emphasis on light pages.</CardDescription>
            </Card>
          </Grid>
        </DsSection>

        <DsSection title="Data display (mock DashboardMetrics)">
          <Grid cols={4} gap={4}>
            {[
              ["Bookings", formatNumber(m.bookings.total, locale), m.bookings.changePct],
              ["Revenue", formatMoney(m.revenue.total, locale), m.revenue.changePct],
              ["Online drivers", `${m.drivers.online} / ${m.drivers.active}`, null],
              ["Completion rate", formatPercent(m.completionRatePct, locale).replace("+", ""), null],
            ].map(([label, value, change]) => (
              <Card key={label as string} padding="md">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-h3 font-bold tabular-nums">{value}</p>
                {typeof change === "number" && (
                  <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-success">
                    <TrendingUp aria-hidden className="size-4" />
                    {formatPercent(change, locale)}
                  </p>
                )}
              </Card>
            ))}
          </Grid>
          <Text size="xs" tone="subtle">
            Sample figures from the mock data layer.
          </Text>
        </DsSection>

        <DsSection title="Loading states">
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" className="text-primary" />
          </div>
          <Card className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
            <SkeletonText lines={3} />
          </Card>
        </DsSection>

        <DsSection title="Empty & error states">
          <Grid cols={2}>
            <Card padding="none">
              <EmptyState compact title={dict.states.emptyTitle} description={dict.states.emptyBody} actions={<Button size="sm">{dict.states.emptyAction}</Button>} />
            </Card>
            <Card padding="none">
              <ErrorState compact title={dict.states.errorTitle} description={dict.states.errorBody} actions={<Button size="sm" variant="secondary">{dict.common.retry}</Button>} />
            </Card>
          </Grid>
        </DsSection>

        <DsSection title="Modals, confirmations & toasts">
          <OverlayDemo />
        </DsSection>
      </Container>
    </Section>
  );
}
