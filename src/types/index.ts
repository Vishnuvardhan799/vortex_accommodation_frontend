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

// Valid dates for the event (To Date starts from March 7th)
export const VALID_DATES = ['2026-03-06', '2026-03-07', '2026-03-08'] as const;
export const VALID_TO_DATES = ['2026-03-07', '2026-03-08'] as const;
export type ValidDate = typeof VALID_DATES[number];
export type ValidToDate = typeof VALID_TO_DATES[number];

// Valid accommodation types
export const ACCOMMODATION_TYPES = ['Boys', 'Girls', 'Other'] as const;
export type AccommodationType = typeof ACCOMMODATION_TYPES[number];
