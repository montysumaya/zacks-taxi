/**
 * Service contracts — the only data-access surface the UI may depend on.
 * Implementations: `services/mock` today; a Laravel API adapter later.
 * Both must satisfy these interfaces exactly, so swapping is a one-line change
 * in `services/index.ts`.
 *
 * Back-office operations (Phase 4) double as the checklist of what the Laravel
 * side must support — see docs/decisions/0001-admin-dashboard-nextjs-vs-filament.md.
 */
import type {
  Booking,
  BookingSource,
  BookingStatus,
  BookingStatusUpdate,
  BookingType,
  CompanySettings,
  ContactRequest,
  ContactSubmission,
  CreateBookingInput,
  Customer,
  DashboardMetrics,
  DateRange,
  Driver,
  DriverInput,
  DriverSettlement,
  DriverStatus,
  FareQuote,
  FareQuoteRequest,
  ID,
  ListParams,
  OperationsOverview,
  Paginated,
  Payment,
  PaymentMethod,
  PaymentStatus,
  PermissionMatrix,
  Place,
  PricingConfig,
  ReportData,
  StaffCreateBookingInput,
  StaffMember,
  StaffNotification,
  Trip,
  UpdateBookingInput,
  Vehicle,
  VehicleClass,
  VehicleClassSummary,
  VehicleStatus,
} from "@/types";

export interface BookingFilters {
  status?: BookingStatus[];
  type?: BookingType;
  source?: BookingSource;
  vehicleClass?: VehicleClass;
  customerId?: ID;
  driverId?: ID;
  /** Inclusive ISO bounds on `scheduledAt`. */
  from?: string;
  to?: string;
  /** Only bookings without a driver. */
  unassigned?: boolean;
}

export interface BookingService {
  /** `sort`: "scheduledAt" | "-scheduledAt" | "createdAt" | "-createdAt" | "estimatedFare" | "-estimatedFare". */
  list(params?: ListParams<BookingFilters>): Promise<Paginated<Booking>>;
  getById(id: ID): Promise<Booking>;
  /** Lookup by the customer-facing reference, e.g. "MSR-7K2Q9". */
  getByReference(reference: string): Promise<Booking>;
  create(input: CreateBookingInput): Promise<Booking>;
  cancel(id: ID, reason?: string): Promise<Booking>;
  /** Staff-created booking (phone / walk-in). The fare is priced by the service. */
  createManual(input: StaffCreateBookingInput): Promise<Booking>;
  update(id: ID, input: UpdateBookingInput): Promise<Booking>;
  assignDriver(id: ID, driverId: ID): Promise<Booking>;
  updateStatus(id: ID, status: BookingStatusUpdate): Promise<Booking>;
}

export interface DriverFilters {
  status?: DriverStatus[];
}

export interface DriverService {
  list(params?: ListParams<DriverFilters>): Promise<Paginated<Driver>>;
  getById(id: ID): Promise<Driver>;
  create(input: DriverInput): Promise<Driver>;
  update(id: ID, input: Partial<DriverInput>): Promise<Driver>;
}

export interface VehicleFilters {
  vehicleClass?: VehicleClass[];
  status?: VehicleStatus[];
}

export type VehicleInput = Omit<Vehicle, "id">;

export interface VehicleService {
  list(params?: ListParams<VehicleFilters>): Promise<Paginated<Vehicle>>;
  getById(id: ID): Promise<Vehicle>;
  listClasses(): Promise<VehicleClassSummary[]>;
  create(input: VehicleInput): Promise<Vehicle>;
  update(id: ID, input: Partial<VehicleInput>): Promise<Vehicle>;
}

export interface CustomerService {
  list(params?: ListParams): Promise<Paginated<Customer>>;
  getById(id: ID): Promise<Customer>;
  /** The authenticated customer. */
  getCurrent(): Promise<Customer>;
}

export interface FareService {
  getQuote(request: FareQuoteRequest): Promise<FareQuote>;
  /** One quote per vehicle class, for a comparison picker. */
  getQuotes(request: Omit<FareQuoteRequest, "vehicleClass">): Promise<FareQuote[]>;
}

export interface PricingService {
  getConfig(): Promise<PricingConfig>;
  updateConfig(config: Omit<PricingConfig, "updatedAt">): Promise<PricingConfig>;
}

export interface TripService {
  getById(id: ID): Promise<Trip>;
  getByBookingId(bookingId: ID): Promise<Trip | null>;
}

export interface PaymentFilters {
  method?: PaymentMethod;
  status?: PaymentStatus;
  driverId?: ID;
}

export interface PaymentService {
  list(params?: ListParams<PaymentFilters>): Promise<Paginated<Payment>>;
  getById(id: ID): Promise<Payment>;
  listByBooking(bookingId: ID): Promise<Payment[]>;
  listSettlements(): Promise<DriverSettlement[]>;
  /** Record that a driver handed over their collected cash. */
  settleDriver(driverId: ID): Promise<DriverSettlement>;
}

export interface DashboardService {
  getMetrics(period: DateRange): Promise<DashboardMetrics>;
  getOverview(): Promise<OperationsOverview>;
}

export interface ReportService {
  getReport(period: DateRange): Promise<ReportData>;
}

export interface StaffService {
  list(params?: ListParams): Promise<Paginated<StaffMember>>;
  invite(input: Pick<StaffMember, "fullName" | "email" | "role">): Promise<StaffMember>;
  update(id: ID, input: Partial<Pick<StaffMember, "fullName" | "email" | "phone" | "role" | "status">>): Promise<StaffMember>;
  getPermissions(): Promise<PermissionMatrix>;
  updatePermissions(matrix: PermissionMatrix): Promise<PermissionMatrix>;
}

export interface NotificationService {
  list(params?: ListParams<{ unreadOnly?: boolean }>): Promise<Paginated<StaffNotification>>;
  markRead(id: ID): Promise<void>;
  markAllRead(): Promise<void>;
}

export interface SettingsService {
  get(): Promise<CompanySettings>;
  update(settings: Omit<CompanySettings, "updatedAt">): Promise<CompanySettings>;
}

export interface PlaceService {
  /** Autocomplete over known pickup / destination locations. */
  search(query: string, options?: { limit?: number }): Promise<Place[]>;
}

export interface ContactService {
  submit(request: ContactRequest): Promise<ContactSubmission>;
}

export interface Services {
  places: PlaceService;
  contact: ContactService;
  bookings: BookingService;
  drivers: DriverService;
  vehicles: VehicleService;
  customers: CustomerService;
  fares: FareService;
  pricing: PricingService;
  trips: TripService;
  payments: PaymentService;
  dashboard: DashboardService;
  reports: ReportService;
  staff: StaffService;
  notifications: NotificationService;
  settings: SettingsService;
}
