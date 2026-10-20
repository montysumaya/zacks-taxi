/**
 * Tiny localStorage wrapper for mock data. No-ops on the server and when
 * storage is unavailable, so the mock layer works everywhere.
 */
export function createBrowserStore<T>(key: string, fallback: T) {
  const available = () => typeof window !== "undefined" && "localStorage" in window;
  return {
    read(): T {
      if (!available()) return fallback;
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        return fallback;
      }
    },
    write(value: T) {
      if (!available()) return;
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Ignore quota / privacy-mode errors in the demo store.
      }
    },
  };
}
