/**
 * Type definitions for Vortex 2026 Accommodation System
 */

export interface ParticipantData {
  name: string;
  email: string;
  college: string;
  events: string[];
  workshops: string[];
  accommodation: AccommodationStatus | null;
}

export interface AccommodationStatus {
  hasAccommodation: boolean;
  fromDate: string; // ISO date string: "2026-03-06"
  toDate: string; // ISO date string: "2026-03-08"
  type: 'Boys' | 'Girls' | 'Other';
  notes?: string;
}

export interface AccommodationFormData {
  name: string;
  email: string;
  phone: string;
  college: string;
  fromDate: string;
  toDate: string;
  accommodationType: 'Boys' | 'Girls' | 'Other';
  notes?: string;
}

export interface AccommodationEntry extends AccommodationFormData {
  timestamp: string;
  enteredBy: string;
}

export interface SearchRequest {
  email: string;
}

export interface SearchResponse {
  found: boolean;
  participant?: ParticipantData;
  message?: string;
}

export interface AccommodationRequest extends AccommodationFormData {
  force?: boolean;
}

export interface AccommodationResponse {
  success: boolean;
  message: string;
  entry?: AccommodationEntry;
  duplicate?: boolean;
  existingEntry?: Partial<AccommodationEntry>;
}

export interface ErrorState {
  type: 'validation' | 'auth' | 'duplicate' | 'rate_limit' | 'service_unavailable' | 'network' | 'client' | 'unknown';
  message: string;
  details?: Array<{ field: string; message: string }>;
  existingEntry?: Partial<AccommodationEntry>;
}

export interface ApiError extends Error {
  type: ErrorState['type'];
  details?: ErrorState['details'];
  existingEntry?: Partial<AccommodationEntry>;
}

// Event and Workshop Registration Types
export interface EventRegistrationRequest {
  name: string;
  email: string;
  phone: string;
  eventNames: string[];
  teamName?: string;
  paymentStatus: 'Paid' | 'Pending' | 'Waived';
  notes?: string;
  force?: boolean;
}

export interface WorkshopRegistrationRequest {
  name: string;
  email: string;
  phone: string;
  workshopNames: string[];
  paymentStatus: 'Paid' | 'Pending' | 'Waived';
  notes?: string;
  force?: boolean;
}

export interface EventRegistrationResponse {
  success: boolean;
  message: string;
  entry?: any;
  duplicate?: boolean;
  existingEntry?: any;
}

export interface WorkshopRegistrationResponse {
  success: boolean;
  message: string;
  entry?: any;
  duplicate?: boolean;
  existingEntry?: any;
}

// Valid dates for the event (To Date starts from March 7th)
export const VALID_DATES = ['2026-03-06', '2026-03-07', '2026-03-08'] as const;
export const VALID_TO_DATES = ['2026-03-07', '2026-03-08'] as const;
export type ValidDate = typeof VALID_DATES[number];
export type ValidToDate = typeof VALID_TO_DATES[number];

// Valid accommodation types
export const ACCOMMODATION_TYPES = ['Boys', 'Girls', 'Other'] as const;
export type AccommodationType = typeof ACCOMMODATION_TYPES[number];

// Payment status types
export const PAYMENT_STATUSES = ['Paid', 'Pending', 'Waived'] as const;
export type PaymentStatus = typeof PAYMENT_STATUSES[number];
