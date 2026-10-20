import { ServiceError, type ListParams, type Paginated } from "@/types";

const latencyMs = Number(process.env.NEXT_PUBLIC_MOCK_LATENCY_MS ?? 350);

/** Resolve with a copy of `value` after simulated network latency. */
export async function respond<T>(value: T): Promise<T> {
  if (latencyMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, latencyMs));
  }
  return structuredClone(value);
}

export function notFoundError(entity: string, id: string) {
  return new ServiceError(`${entity} ${id} not found`, 404, "not_found");
}

export function validationError(field: string, message: string) {
  return new ServiceError(message, 422, "validation_failed", { [field]: [message] });
}

export function paginate<T>(items: T[], params: ListParams<unknown> = {}): Paginated<T> {
  const perPage = params.perPage ?? 15;
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(Math.max(1, params.page ?? 1), lastPage);
  const start = (currentPage - 1) * perPage;
  return {
    data: items.slice(start, start + perPage),
    meta: { currentPage, perPage, total, lastPage },
  };
}

type SortValue = string | number | undefined;

/**
 * Search + sort + paginate, mirroring what the API will do server-side.
 * `sort` follows the Laravel convention: "field" ascending, "-field" descending.
 */
export function query<T>(
  items: T[],
  params: ListParams<unknown>,
  options: { searchable?: (item: T) => Array<string | undefined>; sorters?: Record<string, (item: T) => SortValue>; defaultSort?: string },
): Paginated<T> {
  const term = params.search?.trim().toLowerCase();
  let result = term && options.searchable
    ? items.filter((item) => options.searchable!(item).some((v) => v?.toLowerCase().includes(term)))
    : [...items];
  const sort = params.sort ?? options.defaultSort;
  if (sort && options.sorters) {
    const desc = sort.startsWith("-");
    const getter = options.sorters[desc ? sort.slice(1) : sort];
    if (getter) {
      result = result.sort((a, b) => {
        const av = getter(a) ?? "";
        const bv = getter(b) ?? "";
        const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
        return desc ? -cmp : cmp;
      });
    }
  }
  return paginate(result, params);
}

let sequence = 0;
export function mockId(prefix: string) {
  sequence += 1;
  return `${prefix}_${Date.now().toString(36)}${sequence}`;
}

export function bookingReference() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "";
  for (let i = 0; i < 5; i++) ref += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `MSR-${ref}`;
}
