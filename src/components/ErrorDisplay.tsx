import React, { memo } from "react";
import type { ErrorState } from "../types";

interface ErrorDisplayProps {
  error: ErrorState | null;
  onDismiss: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = memo(
  ({ error, onDismiss }) => {
    if (!error) return null;

    const getErrorColor = (): string => {
      switch (error.type) {
        case "validation":
          return "bg-yellow-50 border-yellow-500 text-yellow-800";
        case "duplicate":
          return "bg-blue-50 border-blue-500 text-blue-800";
        case "service_unavailable":
        case "network":
          return "bg-red-50 border-red-500 text-red-800";
        case "rate_limit":
          return "bg-orange-50 border-orange-500 text-orange-800";
        default:
          return "bg-red-50 border-red-500 text-red-800";
      }
    };

    const getErrorIcon = (): JSX.Element => {
      switch (error.type) {
        case "validation":
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          );
        case "duplicate":
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
        case "network":
        case "service_unavailable":
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3"
              />
            </svg>
          );
        default:
          return (
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          );
      }
    };

    const getErrorTitle = (): string => {
      switch (error.type) {
        case "validation":
          return "Validation Error";
        case "duplicate":
          return "Duplicate Entry";
        case "auth":
          return "Authentication Error";
        case "rate_limit":
          return "Rate Limit Exceeded";
        case "service_unavailable":
          return "Service Unavailable";
        case "network":
          return "Network Error";
        default:
          return "Error";
      }
    };

    return (
      <div
        className={`border-l-4 p-4 mb-4 rounded-r-lg ${getErrorColor()}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            {getErrorIcon()}
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">{getErrorTitle()}</h3>
              <p className="text-sm">{error.message}</p>

              {/* Field-specific validation errors */}
              {error.details && error.details.length > 0 && (
                <ul className="mt-3 ml-4 space-y-1 list-disc text-sm">
                  {error.details.map((detail, idx) => (
                    <li key={idx}>
                      <strong className="font-medium">{detail.field}:</strong>{" "}
                      {detail.message}
                    </li>
                  ))}
                </ul>
              )}

              {/* Duplicate entry information */}
              {error.type === "duplicate" && error.existingEntry && (
                <div className="mt-3 p-3 bg-white bg-opacity-50 rounded border border-current">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2">
                    Existing Entry:
                  </p>
                  <dl className="text-sm space-y-1">
                    {error.existingEntry.name && (
                      <div>
                        <dt className="inline font-medium">Name: </dt>
                        <dd className="inline">{error.existingEntry.name}</dd>
                      </div>
                    )}
                    {error.existingEntry.email && (
                      <div>
                        <dt className="inline font-medium">Email: </dt>
                        <dd className="inline">{error.existingEntry.email}</dd>
                      </div>
                    )}
                    {error.existingEntry.fromDate &&
                      error.existingEntry.toDate && (
                        <div>
                          <dt className="inline font-medium">Dates: </dt>
                          <dd className="inline">
                            {new Date(
                              error.existingEntry.fromDate,
                            ).toLocaleDateString()}{" "}
                            -{" "}
                            {new Date(
                              error.existingEntry.toDate,
                            ).toLocaleDateString()}
                          </dd>
                        </div>
                      )}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={onDismiss}
            className="text-current hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="Dismiss error"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  },
);
