"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useI18n } from "@/components/providers/i18n-provider";
import { localeMeta } from "@/i18n/config";
import type { AdminDictionary } from "@/i18n/dictionaries/en/admin";

const AdminContext = createContext<AdminDictionary | null>(null);

export function AdminProvider({ dict, children }: { dict: AdminDictionary; children: ReactNode }) {
  return <AdminContext value={dict}>{children}</AdminContext>;
}

/** Admin strings plus the shared locale helpers. */
export function useAdmin() {
  const t = useContext(AdminContext);
  const i18n = useI18n();
  if (!t) throw new Error("useAdmin must be used within <AdminProvider>");
  return { t, ...i18n, intl: localeMeta[i18n.locale].intl };
}
