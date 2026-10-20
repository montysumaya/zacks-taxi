import type { ID, ISODateString, Money, PaymentMethod } from "./common";

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "paid"
  | "failed"
  | "refunded";

export interface Payment {
  id: ID;
  bookingId: ID;
  tripId?: ID;
  customerId: ID;
  amount: Money;
  method: PaymentMethod;
  status: PaymentStatus;
  /** Gateway / wallet provider identifier, when not cash. */
  provider?: string;
  transactionReference?: string;
  failureReason?: string;
  paidAt?: ISODateString;
  createdAt: ISODateString;
}
