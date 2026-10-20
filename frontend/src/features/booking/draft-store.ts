"use client";

import { useSyncExternalStore } from "react";
import { applyDraftPatch, initialDraft, type BookingDraft } from "./draft";

const STORAGE_KEY = "masar.booking-draft.v1";

type Listener = () => void;

let state: BookingDraft = initialDraft;
let loaded = false;
const listeners = new Set<Listener>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<BookingDraft>;
    if (parsed.version === initialDraft.version) {
      state = { ...initialDraft, ...parsed, customer: { ...initialDraft.customer, ...parsed.customer } };
    }
  } catch {
    // Corrupt or inaccessible storage: start fresh.
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or disabled (private mode): the draft still lives in memory.
  }
}

function emit() {
  listeners.forEach((listener) => listener());
}

export const bookingDraftStore = {
  getSnapshot(): BookingDraft {
    load();
    return state;
  },
  getServerSnapshot(): BookingDraft {
    return initialDraft;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    // Keep tabs in sync.
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        loaded = false;
        load();
        listener();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  update(patch: Partial<BookingDraft> | ((draft: BookingDraft) => Partial<BookingDraft>)) {
    load();
    state = applyDraftPatch(state, typeof patch === "function" ? patch(state) : patch);
    persist();
    emit();
  },
  reset(patch: Partial<BookingDraft> = {}) {
    state = { ...initialDraft, ...patch };
    persist();
    emit();
  },
};

/** Current draft plus update helpers. Renders `initialDraft` on the server. */
export function useBookingDraft() {
  const draft = useSyncExternalStore(
    bookingDraftStore.subscribe,
    bookingDraftStore.getSnapshot,
    bookingDraftStore.getServerSnapshot,
  );
  return { draft, update: bookingDraftStore.update, reset: bookingDraftStore.reset };
}

/** True after hydration — lets the UI avoid flashing the empty server draft. */
export function useHydrated() {
  return useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
}
