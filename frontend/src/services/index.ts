import type { Services } from "./contracts";
import { createMockServices, type BookingSimulator, type MockControls } from "./mock";

/**
 * Single entry point for data access. UI code imports `services` from here
 * and never from an implementation folder.
 *
 * To connect the Laravel API: add `services/api/` implementing `Services`,
 * then add an "api" case below and set NEXT_PUBLIC_DATA_SOURCE=api.
 */
export type DataSource = "mock";

interface ServiceInstance {
  services: Services;
  simulator: BookingSimulator | null;
  controls: MockControls | null;
}

function createServices(source: DataSource): ServiceInstance {
  switch (source) {
    case "mock":
      return createMockServices();
  }
}

const source = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") as DataSource;
const instance = createServices(source);

export const services: Services = instance.services;

/**
 * Demo-only status simulator. `null` with a real backend — UI that uses it
 * must hide itself in that case.
 */
export const demoSimulator: BookingSimulator | null = instance.simulator;

/** Demo-only data controls (reset). `null` with a real backend. */
export const demoControls: MockControls | null = instance.controls;

export type * from "./contracts";
export type { BookingSimulator, MockControls };
