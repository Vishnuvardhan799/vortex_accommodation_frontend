import React, { useState, lazy, Suspense } from "react";
import { Navbar, NavSection } from "./components/Navbar";
import { SearchComponent } from "./components/SearchComponent";
import { ResultsDisplay } from "./components/ResultsDisplay";
import { ErrorDisplay } from "./components/ErrorDisplay";
import { searchParticipant, addAccommodation } from "./services/api";
import type {
  ParticipantData,
  AccommodationFormData,
  ErrorState,
  ApiError,
  AccommodationEntry,
} from "./types";

// Lazy load heavy components
const AccommodationForm = lazy(() =>
  import("./components/AccommodationForm").then((module) => ({
    default: module.AccommodationForm,
  })),
);

const EventRegistrationForm = lazy(() =>
  import("./components/EventRegistrationForm").then((module) => ({
    default: module.EventRegistrationForm,
  })),
);

const WorkshopRegistrationForm = lazy(() =>
  import("./components/EventRegistrationForm").then((module) => ({
    default: module.EventRegistrationForm,
  })),
);

const DuplicateWarningModal = lazy(() =>
  import("./components/DuplicateWarningModal").then((module) => ({
    default: module.DuplicateWarningModal,
  })),
);

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

interface AppState {
  activeSection: NavSection;
  searchResults: ParticipantData | null;
  error: ErrorState | null;
  isSearching: boolean;
  isSubmitting: boolean;
  showDuplicateModal: boolean;
  duplicateData: {
    existingEntry: Partial<AccommodationEntry>;
    newEntry: AccommodationFormData;
  } | null;
  successMessage: string | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    activeSection: "search",
    searchResults: null,
    error: null,
    isSearching: false,
    isSubmitting: false,
    showDuplicateModal: false,
    duplicateData: null,
    successMessage: null,
  });

  const handleSearch = async (email: string): Promise<void> => {
    setState((prev) => ({
      ...prev,
      isSearching: true,
      error: null,
      successMessage: null,
    }));

    try {
      const response = await searchParticipant(email);

      if (response.found && response.participant) {
        setState((prev) => ({
          ...prev,
          searchResults: response.participant!,
          isSearching: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          searchResults: null,
          isSearching: false,
          error: {
            type: "validation",
            message: response.message || "No participant found with this email",
          },
        }));
      }
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        isSearching: false,
        searchResults: null,
        error: {
          type: apiError.type || "unknown",
          message: apiError.message,
          details: apiError.details,
        },
      }));
    }
  };

  const handleAddAccommodation = async (
    data: AccommodationFormData,
  ): Promise<void> => {
    setState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
      successMessage: null,
    }));

    try {
      const response = await addAccommodation(data);

      if (response.success) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          successMessage:
            response.message || "Accommodation entry created successfully!",
        }));

        // Refresh search results if we have a current search
        if (state.searchResults) {
          await handleSearch(data.email);
        }
      }
    } catch (err) {
      const apiError = err as ApiError;

      // Show simple error message for all errors including duplicates
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: {
          type: apiError.type || "unknown",
          message: apiError.message,
          details: apiError.details,
        },
      }));
    }
  };

  const handleConfirmDuplicate = async (): Promise<void> => {
    if (!state.duplicateData) return;

    setState((prev) => ({
      ...prev,
      showDuplicateModal: false,
      isSubmitting: true,
    }));

    try {
      const response = await addAccommodation({
        ...state.duplicateData.newEntry,
        force: true,
      });

      if (response.success) {
        setState((prev) => ({
          ...prev,
          isSubmitting: false,
          duplicateData: null,
          successMessage:
            response.message || "Accommodation entry created successfully!",
        }));

        // Refresh search results
        if (state.searchResults) {
          await handleSearch(state.duplicateData.newEntry.email);
        }
      }
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        duplicateData: null,
        error: {
          type: apiError.type || "unknown",
          message: apiError.message,
          details: apiError.details,
        },
      }));
    }
  };

  const handleCancelDuplicate = (): void => {
    setState((prev) => ({
      ...prev,
      showDuplicateModal: false,
      duplicateData: null,
    }));
  };

  const handleDismissError = (): void => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  };

  const handleDismissSuccess = (): void => {
    setState((prev) => ({
      ...prev,
      successMessage: null,
    }));
  };

  const handleReset = (): void => {
    setState((prev) => ({
      ...prev,
      searchResults: null,
      successMessage: null,
      error: null,
    }));
  };

  const handleSectionChange = (section: NavSection): void => {
    setState((prev) => ({
      ...prev,
      activeSection: section,
      error: null,
      successMessage: null,
    }));
  };

  const handleEventRegistrationSuccess = (): void => {
    setState((prev) => ({
      ...prev,
      successMessage: "Registration successful!",
    }));
  };

  const handleEventRegistrationError = (error: any): void => {
    setState((prev) => ({
      ...prev,
      error: {
        type: error.type || "unknown",
        message: error.message || "Failed to register. Please try again.",
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Vortex 2026</h1>
          <p className="text-primary-100 mt-1">
            Accommodation & Registration Management System
          </p>
        </div>
      </header>

      {/* Navigation */}
      <Navbar
        activeSection={state.activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Success Message */}
        {state.successMessage && (
          <div className="max-w-2xl mx-auto mb-6">
            <div
              className="bg-success-50 border-l-4 border-success-500 p-4 rounded-r-lg"
              role="alert"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-success-700 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-sm text-success-800 mb-1">
                      Success
                    </h3>
                    <p className="text-sm text-success-700">
                      {state.successMessage}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDismissSuccess}
                  className="text-success-700 hover:opacity-70 transition-opacity"
                  aria-label="Dismiss success message"
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
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="max-w-2xl mx-auto mb-6">
            <ErrorDisplay error={state.error} onDismiss={handleDismissError} />
          </div>
        )}

        {/* Search Section */}
        {state.activeSection === "search" && (
          <>
            <section className="mb-8">
              <SearchComponent
                onSearch={handleSearch}
                isLoading={state.isSearching}
              />
            </section>

            {state.searchResults && (
              <section>
                <ResultsDisplay participant={state.searchResults} />
              </section>
            )}
          </>
        )}

        {/* Accommodation Section */}
        {state.activeSection === "accommodation" && (
          <section>
            <Suspense fallback={<LoadingFallback />}>
              <AccommodationForm
                onSubmit={handleAddAccommodation}
                initialEmail={state.searchResults?.email}
                initialName={state.searchResults?.name}
                initialPhone={state.searchResults?.phone}
                initialCollege={state.searchResults?.college}
                isLoading={state.isSubmitting}
                onReset={handleReset}
                showResetButton={!!state.successMessage}
              />
            </Suspense>
          </section>
        )}

        {/* Events Section */}
        {state.activeSection === "events" && (
          <section>
            <Suspense fallback={<LoadingFallback />}>
              <EventRegistrationForm
                onSuccess={handleEventRegistrationSuccess}
                onError={handleEventRegistrationError}
                registrationType="event"
              />
            </Suspense>
          </section>
        )}

        {/* Workshops Section */}
        {state.activeSection === "workshops" && (
          <section>
            <Suspense fallback={<LoadingFallback />}>
              <WorkshopRegistrationForm
                onSuccess={handleEventRegistrationSuccess}
                onError={handleEventRegistrationError}
                registrationType="workshop"
              />
            </Suspense>
          </section>
        )}
      </main>

      {/* Duplicate Warning Modal */}
      {state.duplicateData && (
        <Suspense fallback={null}>
          <DuplicateWarningModal
            isOpen={state.showDuplicateModal}
            existingEntry={state.duplicateData.existingEntry}
            newEntry={state.duplicateData.newEntry}
            onConfirm={handleConfirmDuplicate}
            onCancel={handleCancelDuplicate}
          />
        </Suspense>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600 text-sm">
          <p>Vortex 2026 - NIT Trichy | March 6-8, 2026</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
