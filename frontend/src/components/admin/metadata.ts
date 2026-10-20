import type { Metadata } from "next";
import type { AdminNavKey } from "@/features/admin/navigation";
import { getAdminDictionary } from "@/i18n/get-admin-dictionary";

export async function adminMetadata(key: AdminNavKey): Promise<Metadata> {
  const t = await getAdminDictionary();
  return { title: t.nav[key], robots: { index: false, follow: false } };
}
