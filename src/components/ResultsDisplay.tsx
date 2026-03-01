import React, { memo } from "react";
import type { ParticipantData } from "../types";

interface ResultsDisplayProps {
  participant: ParticipantData;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = memo(
  ({ participant }) => {
    const { name, email, college, events, workshops, accommodation } =
      participant;

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    };

    return (
      <div className="w-full max-w-2xl mx-auto mt-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 text-white px-6 py-4">
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-primary-100 mt-1">{email}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* College */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                College
              </h3>
              <p className="text-lg text-gray-900">{college}</p>
            </div>

            {/* Accommodation Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Accommodation Status
              </h3>
              {accommodation && accommodation.hasAccommodation ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-50 border border-success-500 rounded-lg">
                  <svg
                    className="w-5 h-5 text-success-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <span className="font-semibold text-success-700">
                      Accommodation Confirmed
                    </span>
                    <p className="text-sm text-success-600 mt-1">
                      {formatDate(accommodation.fromDate)} -{" "}
                      {formatDate(accommodation.toDate)}
                    </p>
                    <p className="text-sm text-success-600">
                      Type: {accommodation.type}
                    </p>
                    {accommodation.notes && (
                      <p className="text-sm text-success-600 mt-1">
                        Notes: {accommodation.notes}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-error-50 border border-error-500 rounded-lg">
                  <svg
                    className="w-5 h-5 text-error-700"
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
                  <span className="font-semibold text-error-700">
                    No Accommodation
                  </span>
                </div>
              )}
            </div>

            {/* Events */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Registered Events
              </h3>
              {events.length > 0 ? (
                <ul className="space-y-2">
                  {events.map((event, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      <span>{event}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No events registered</p>
              )}
            </div>

            {/* Workshops */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Registered Workshops
              </h3>
              {workshops.length > 0 ? (
                <ul className="space-y-2">
                  {workshops.map((workshop, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <svg
                        className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                      <span>{workshop}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">No workshops registered</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
