import type { ID, ISODateString } from "./common";

export type ContactTopic = "general" | "booking" | "corporate" | "feedback";

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  topic: ContactTopic;
  message: string;
}

export interface ContactSubmission {
  id: ID;
  reference: string;
  receivedAt: ISODateString;
}
