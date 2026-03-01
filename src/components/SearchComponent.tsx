import React, { useState, useCallback, useMemo } from "react";
import { debounce } from "lodash";
import { validateEmail, getEmailErrorMessage } from "../utils/validation";

interface SearchComponentProps {
  onSearch: (email: string) => Promise<void>;
  isLoading: boolean;
}

export const SearchComponent: React.FC<SearchComponentProps> = ({
  onSearch,
  isLoading,
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  // Memoize validation function to prevent recreation
  const emailValidator = useMemo(() => validateEmail, []);

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((value: string) => {
      if (touched) {
        const error = getEmailErrorMessage(value);
        setEmailError(error);
      }
    }, 300),
    [touched],
  );

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    debouncedValidate(value);
  };

  const handleBlur = () => {
    setTouched(true);
    const error = getEmailErrorMessage(email);
    setEmailError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    const error = getEmailErrorMessage(email);
    setEmailError(error);

    if (!error) {
      await onSearch(email);
    }
  };

  const handleClear = () => {
    setEmail("");
    setEmailError(null);
    setTouched(false);
  };

  const isValid = emailValidator(email);
  const showError = touched && emailError;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Search Participant by Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="text"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              placeholder="Enter email address"
              disabled={isLoading}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                showError
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              aria-invalid={showError ? "true" : "false"}
              aria-describedby={showError ? "email-error" : undefined}
            />
            {email && !isLoading && (
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
          {showError && (
            <p
              id="email-error"
              className="mt-2 text-sm text-error-600"
              role="alert"
            >
              {emailError}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !email || !isValid}
            className="flex-1 px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Searching...
              </span>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
