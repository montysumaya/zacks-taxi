/**
 * Transport-level shapes shared by every service implementation.
 * Mirrors Laravel's paginator so an API adapter only has to map field names.
 */

export interface PaginationMeta {
  currentPage: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ListParams<TFilters = Record<string, never>> {
  page?: number;
  perPage?: number;
  sort?: string;
  search?: string;
  filters?: TFilters;
}

/** Normalized error thrown by any service (mirrors Laravel's 422 payload). */
export class ServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
