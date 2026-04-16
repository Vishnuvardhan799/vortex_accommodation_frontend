import React, { useState, useEffect, useRef, useCallback } from "react";
import { searchValediction, markValedictionToken } from "../services/api";
import type { ValedictionParticipant, ApiError, ErrorState } from "../types";

interface ValedictionSectionProps {
  onError: (error: ErrorState) => void;
  onSuccess: (message: string) => void;
}

type Degree = "btech" | "mtech" | "phd" | "custom";

const DEGREE_OPTIONS: { value: Degree; label: string; prefix: string }[] = [
  { value: "btech", label: "BTech", prefix: "10612" },
  { value: "mtech", label: "MTech", prefix: "20612" },
  { value: "phd", label: "PhD Scholar", prefix: "" },
  { value: "custom", label: "Type full number", prefix: "" },
];

const BTECH_YEARS: { label: string; prefix: string }[] = [
  { label: "1st Year", prefix: "106125" },
  { label: "2nd Year", prefix: "106124" },
  { label: "3rd Year", prefix: "106123" },
  { label: "4th Year", prefix: "106122" },
];

const MTECH_YEARS: { label: string; prefix: string }[] = [
  { label: "1st Year", prefix: "206125" },
  { label: "2nd Year", prefix: "206124" },
];

const PHD_PREFIXES: { label: string; prefix: string }[] = [
  { label: "40612", prefix: "40612" },
  { label: "40632", prefix: "40632" },
  { label: "40642", prefix: "40642" },
  { label: "40682", prefix: "40682" },
  { label: "30632", prefix: "30632" },
];

export const ValedictionSection: React.FC<ValedictionSectionProps> = ({
  onError,
  onSuccess,
}) => {
  const [degree, setDegree] = useState<Degree>("btech");
  const [btechYear, setBtechYear] = useState(BTECH_YEARS[2].prefix); // default 3rd year
  const [mtechYear, setMtechYear] = useState(MTECH_YEARS[0].prefix); // default 1st year
  const [phdPrefix, setPhdPrefix] = useState(PHD_PREFIXES[0].prefix);
  const [remaining, setRemaining] = useState("");
  const [customRoll, setCustomRoll] = useState("");
  const [rollError, setRollError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [participant, setParticipant] = useState<ValedictionParticipant | null>(
    null,
  );
  const [notFound, setNotFound] = useState(false);
  const remainingInputRef = useRef<HTMLInputElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);
  const autoSearchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isCustomMode = degree === "custom";

  // Compute the current prefix and how many remaining digits are needed
  const getPrefix = (): string => {
    if (degree === "btech") return btechYear; // 6 digits, need 3 more
    if (degree === "mtech") return mtechYear; // 6 digits, need 3 more
    if (degree === "phd") return phdPrefix; // 5 digits, need 4 more
    return "";
  };

  const currentPrefix = getPrefix();
  const remainingLength = degree === "btech" || degree === "mtech" ? 3 : 4;
  const fullRollNumber = isCustomMode ? customRoll : currentPrefix + remaining;

  const doSearch = useCallback(
    async (rollNum: string) => {
      setIsSearching(true);
      setParticipant(null);
      setNotFound(false);
      try {
        const response = await searchValediction(rollNum);
        if (response.found && response.participant) {
          setParticipant(response.participant);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        const apiError = err as ApiError;
        onError({
          type: apiError.type || "unknown",
          message: apiError.message,
        });
      } finally {
        setIsSearching(false);
      }
    },
    [onError],
  );

  // Auto-search when digits are complete
  useEffect(() => {
    if (autoSearchTimerRef.current) clearTimeout(autoSearchTimerRef.current);
    const shouldAutoSearch = isCustomMode
      ? customRoll.length === 9
      : remaining.length === remainingLength;
    if (shouldAutoSearch) {
      const rollNum = isCustomMode ? customRoll : currentPrefix + remaining;
      autoSearchTimerRef.current = setTimeout(() => doSearch(rollNum), 300);
    }
    return () => {
      if (autoSearchTimerRef.current) clearTimeout(autoSearchTimerRef.current);
    };
  }, [
    remaining,
    currentPrefix,
    remainingLength,
    customRoll,
    isCustomMode,
    doSearch,
  ]);

  const clearResults = () => {
    setParticipant(null);
    setNotFound(false);
    setRollError(null);
    setTouched(false);
  };

  const handleDegreeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDegree(e.target.value as Degree);
    setRemaining("");
    setCustomRoll("");
    clearResults();
    setTimeout(() => {
      if (e.target.value === "custom") customInputRef.current?.focus();
      else remainingInputRef.current?.focus();
    }, 50);
  };

  const handleBtechYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBtechYear(e.target.value);
    setRemaining("");
    clearResults();
    setTimeout(() => remainingInputRef.current?.focus(), 50);
  };

  const handleMtechYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMtechYear(e.target.value);
    setRemaining("");
    clearResults();
    setTimeout(() => remainingInputRef.current?.focus(), 50);
  };

  const handlePhdPrefixChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPhdPrefix(e.target.value);
    setRemaining("");
    clearResults();
    setTimeout(() => remainingInputRef.current?.focus(), 50);
  };

  const handleRemainingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, remainingLength);
    setRemaining(value);
    setRollError(null);
    if (value.length < remainingLength) {
      setParticipant(null);
      setNotFound(false);
    }
  };

  const handleCustomRollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 9);
    setCustomRoll(value);
    setRollError(null);
    if (value.length < 9) {
      setParticipant(null);
      setNotFound(false);
    }
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isCustomMode) {
      if (customRoll.length !== 9) {
        setRollError("Roll number must be exactly 9 digits");
        return;
      }
    } else {
      if (remaining.length !== remainingLength) {
        setRollError(`Enter exactly ${remainingLength} digits`);
        return;
      }
    }
    setRollError(null);
    doSearch(fullRollNumber);
  };

  const handleMarkToken = async () => {
    if (!participant) return;
    setIsMarking(true);
    try {
      const response = await markValedictionToken(participant.rollNumber);
      if (response.alreadyGiven) {
        onError({
          type: "duplicate",
          message: "Token has already been given to this participant",
        });
      } else if (response.success && response.participant) {
        setParticipant(response.participant);
        onSuccess("Token marked as given successfully!");
      } else if (response.success) {
        const refreshed = await searchValediction(participant.rollNumber);
        if (refreshed.found && refreshed.participant)
          setParticipant(refreshed.participant);
        onSuccess("Token marked as given successfully!");
      }
    } catch (err) {
      const apiError = err as ApiError;
      onError({ type: apiError.type || "unknown", message: apiError.message });
    } finally {
      setIsMarking(false);
    }
  };

  const handleClear = () => {
    setRemaining("");
    setCustomRoll("");
    setRollError(null);
    setTouched(false);
    setParticipant(null);
    setNotFound(false);
    if (isCustomMode) customInputRef.current?.focus();
    else remainingInputRef.current?.focus();
  };

  const inputValue = isCustomMode ? customRoll : remaining;
  const isReady = isCustomMode
    ? customRoll.length === 9
    : remaining.length === remainingLength;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Roll Number (CSE Valediction)
          </label>

          {/* Row 1: Degree + Year/PhD prefix */}
          <div className="flex flex-wrap gap-2 mb-2">
            <select
              value={degree}
              onChange={handleDegreeChange}
              disabled={isSearching}
              className="flex-1 min-w-[120px] px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-base"
              aria-label="Degree"
            >
              {DEGREE_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {degree === "btech" && (
              <select
                value={btechYear}
                onChange={handleBtechYearChange}
                disabled={isSearching}
                className="flex-1 min-w-[120px] px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-base"
                aria-label="Year"
              >
                {BTECH_YEARS.map((y) => (
                  <option key={y.prefix} value={y.prefix}>
                    {y.label}
                  </option>
                ))}
              </select>
            )}

            {degree === "mtech" && (
              <select
                value={mtechYear}
                onChange={handleMtechYearChange}
                disabled={isSearching}
                className="flex-1 min-w-[120px] px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-semibold text-base"
                aria-label="Year"
              >
                {MTECH_YEARS.map((y) => (
                  <option key={y.prefix} value={y.prefix}>
                    {y.label}
                  </option>
                ))}
              </select>
            )}

            {degree === "phd" && (
              <select
                value={phdPrefix}
                onChange={handlePhdPrefixChange}
                disabled={isSearching}
                className="flex-1 min-w-[120px] px-3 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono font-semibold text-base"
                aria-label="PhD prefix"
              >
                {PHD_PREFIXES.map((p) => (
                  <option key={p.prefix} value={p.prefix}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 2: Prefix display + remaining digits input */}
          <div className="flex flex-wrap gap-2 items-center">
            {!isCustomMode && (
              <span className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-lg font-mono font-semibold text-gray-700 select-none">
                {currentPrefix}
              </span>
            )}
            <div className="relative flex-1">
              {isCustomMode ? (
                <input
                  ref={customInputRef}
                  type="text"
                  inputMode="numeric"
                  value={customRoll}
                  onChange={handleCustomRollChange}
                  onBlur={handleBlur}
                  placeholder="Enter full 9-digit roll number"
                  disabled={isSearching}
                  autoFocus
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg font-mono tracking-widest ${
                    touched && rollError
                      ? "border-error-500 focus:ring-error-500"
                      : "border-gray-300 focus:ring-primary-500"
                  } ${isSearching ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
              ) : (
                <input
                  ref={remainingInputRef}
                  type="text"
                  inputMode="numeric"
                  value={remaining}
                  onChange={handleRemainingChange}
                  onBlur={handleBlur}
                  placeholder={`Last ${remainingLength} digits`}
                  disabled={isSearching}
                  autoFocus
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors text-lg font-mono tracking-widest ${
                    touched && rollError
                      ? "border-error-500 focus:ring-error-500"
                      : "border-gray-300 focus:ring-primary-500"
                  } ${isSearching ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                />
              )}
              {inputValue && !isSearching && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear search"
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
              )}
            </div>
          </div>

          {inputValue.length > 0 && (
            <p className="mt-1 text-xs text-gray-500 font-mono">
              Searching: {fullRollNumber}
              {isReady && " ✓"}
            </p>
          )}
          {touched && rollError && (
            <p
              id="roll-error"
              className="mt-2 text-sm text-error-600"
              role="alert"
            >
              {rollError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching || !isReady}
          className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Searching...
            </span>
          ) : (
            "Search"
          )}
        </button>
      </form>

      {notFound && (
        <div className="mt-6 p-4 bg-warning-50 border border-warning-500 rounded-lg text-center">
          <p className="text-warning-700 font-medium">
            No participant found with roll number {fullRollNumber}
          </p>
        </div>
      )}

      {participant && (
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="bg-primary-600 text-white px-6 py-4">
              <h2 className="text-2xl font-bold">{participant.name}</h2>
              <p className="text-primary-100 mt-1">
                Roll: {participant.rollNumber}
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Gender
                  </h3>
                  <p className="text-lg text-gray-900">
                    {participant.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Year
                  </h3>
                  <p className="text-lg text-gray-900">
                    {participant.year || "Not specified"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Food Preference
                  </h3>
                  <p className="text-lg text-gray-900">
                    {participant.foodPreference || "Not specified"}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Token Status
                </h3>
                {participant.tokenGiven ? (
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
                        Token Already Provided
                      </span>
                      {participant.givenBy && (
                        <p className="text-sm text-success-600 mt-1">
                          Given by: {participant.givenBy}
                        </p>
                      )}
                      {participant.givenAt && (
                        <p className="text-sm text-success-600">
                          At: {new Date(participant.givenAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
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
                        Token Not Given
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={handleMarkToken}
                        disabled={isMarking}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {isMarking ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Marking...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Mark Token as Given
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
