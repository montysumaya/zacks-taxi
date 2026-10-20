import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminProvider } from "@/components/admin/admin-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { adminPrototypeEnabled } from "@/config/features";
import { getAdminDictionary } from "@/i18n/get-admin-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getAdminDictionary();
  return {
    title: { default: t.meta.title, template: `%s · ${t.meta.title}` },
    robots: { index: false, follow: false },
  };
}

/** Back-office prototype shell. Disabled in production unless ADMIN_PROTOTYPE=true. */
export default async function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  if (!adminPrototypeEnabled) notFound();
  const t = await getAdminDictionary();

  return (
    <AdminProvider dict={t}>
      <Suspense fallback={<ShellSkeleton />}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AdminProvider>
  );
}

function ShellSkeleton() {
  return (
    <div className="flex min-h-dvh bg-surface-muted">
      <Skeleton className="hidden h-dvh w-64 rounded-none lg:block" />
      <div className="flex flex-1 flex-col gap-6 p-8">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
