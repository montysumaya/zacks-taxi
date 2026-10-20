"use client";

import { useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore } from "react";

export type QueryState<T> =
  | { status: "loading"; data: T | undefined }
  | { status: "error"; data: T | undefined; error: unknown }
  | { status: "success"; data: T };

/**
 * Runs a service call and re-runs it when `key` changes. Previous data is kept
 * while reloading so tables don't flash empty between pages or filters.
 * The same hook works unchanged once services hit the real API.
 */
export function useServiceQuery<T>(fetcher: () => Promise<T>, key: unknown[]) {
  const [state, setState] = useState<QueryState<T>>({ status: "loading", data: undefined });
  const [version, setVersion] = useState(0);
  const run = useEffectEvent(fetcher);
  const serializedKey = JSON.stringify(key);

  useEffect(() => {
    let ignore = false;
    run()
      .then((data) => {
        if (!ignore) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (!ignore) setState((s) => ({ status: "error", data: s.data, error }));
      });
    return () => {
      ignore = true;
    };
  }, [serializedKey, version]);

  const reload = useCallback(() => {
    setState((s) => ({ status: "loading", data: s.data }));
    setVersion((v) => v + 1);
  }, []);

  return { ...state, reload, refreshing: state.status === "loading" && state.data !== undefined };
}

/* A shared, ticking clock: components read time from here, never Date.now() in render. */
let now: number | null = null;
const clockListeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribeClock(listener: () => void) {
  clockListeners.add(listener);
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((l) => l());
    }, 30_000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Current time, refreshed every 30 s. 0 during server rendering. */
export function useNow() {
  return useSyncExternalStore(
    subscribeClock,
    () => (now ??= Date.now()),
    () => 0,
  );
}
