"use client";

/**
 * FRONTEND-ONLY role simulation. The selected role lives in localStorage and
 * only changes what the prototype shows. Real authorization must be enforced
 * by the backend (Laravel policies) — never trust these checks for security.
 */
import { useEffect, useSyncExternalStore } from "react";
import { services } from "@/services";
import type { Permission, PermissionMatrix, StaffRole } from "@/types";

const ROLE_KEY = "masar.admin.simulated-role";

interface AccessState {
  role: StaffRole;
  matrix: PermissionMatrix | null;
}

let state: AccessState = { role: "admin", matrix: null };
let loadedRole = false;
let loadingMatrix = false;
const listeners = new Set<() => void>();
const serverState: AccessState = { role: "admin", matrix: null };

function emit() {
  listeners.forEach((l) => l());
}

function readRole() {
  if (loadedRole || typeof window === "undefined") return;
  loadedRole = true;
  try {
    const saved = window.localStorage.getItem(ROLE_KEY) as StaffRole | null;
    if (saved && ["admin", "dispatcher", "accountant", "support"].includes(saved)) state = { ...state, role: saved };
  } catch {
    // Storage unavailable: stay on the default role.
  }
}

export const accessStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): AccessState {
    readRole();
    return state;
  },
  getServerSnapshot(): AccessState {
    return serverState;
  },
  setRole(role: StaffRole) {
    state = { ...state, role };
    try {
      window.localStorage.setItem(ROLE_KEY, role);
    } catch {
      // ignore
    }
    emit();
  },
  setMatrix(matrix: PermissionMatrix) {
    state = { ...state, matrix };
    emit();
  },
  async loadMatrix() {
    if (loadingMatrix || state.matrix) return;
    loadingMatrix = true;
    try {
      accessStore.setMatrix(await services.staff.getPermissions());
    } finally {
      loadingMatrix = false;
    }
  },
};

export function useAccess() {
  const access = useSyncExternalStore(accessStore.subscribe, accessStore.getSnapshot, accessStore.getServerSnapshot);
  useEffect(() => {
    void accessStore.loadMatrix();
  }, []);
  const can = (permission: Permission) => Boolean(access.matrix?.[access.role].includes(permission));
  return { role: access.role, matrix: access.matrix, ready: access.matrix !== null, can };
}
