import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as api from "./services/api";

// Mock the API module
vi.mock("./services/api");

describe("App Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial Rendering", () => {
    it("should render header with title", () => {
      render(<App />);
      expect(screen.getByText("Vortex 2026")).toBeInTheDocument();
      expect(
        screen.getByText(/accommodation & registration check system/i),
      ).toBeInTheDocument();
    });

    it("should render search component", () => {
      render(<App />);
      expect(
        screen.getByPlaceholderText(/enter email address/i),
      ).toBeInTheDocument();
    });

    it("should render accommodation form", () => {
      render(<App />);
      expect(screen.getByText(/add accommodation entry/i)).toBeInTheDocument();
    });

    it("should render footer", () => {
      render(<App />);
      expect(screen.getByText(/vortex 2026 - nit trichy/i)).toBeInTheDocument();
    });
  });

  describe("Search Workflow", () => {
    it("should search and display participant results", async () => {
      const mockResponse = {
        found: true,
        participant: {
          name: "John Doe",
          email: "john@example.com",
          college: "NIT Trichy",
          events: ["Tech Talk"],
          workshops: ["AI Workshop"],
          accommodation: null,
        },
      };

      vi.mocked(api.searchParticipant).mockResolvedValue(mockResponse);

      render(<App />);

      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(emailInput, "john@example.com");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("NIT Trichy")).toBeInTheDocument();
        expect(screen.getByText("Tech Talk")).toBeInTheDocument();
        expect(screen.getByText("AI Workshop")).toBeInTheDocument();
      });
    });

    it("should display error when participant not found", async () => {
      const mockResponse = {
        found: false,
        message: "No participant found with this email",
      };

      vi.mocked(api.searchParticipant).mockResolvedValue(mockResponse);

      render(<App />);

      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(emailInput, "notfound@example.com");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/no participant found/i)).toBeInTheDocument();
      });
    });

    it("should display error when search fails", async () => {
      const mockError = new Error("Network error") as any;
      mockError.type = "network";

      vi.mocked(api.searchParticipant).mockRejectedValue(mockError);

      render(<App />);

      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(emailInput, "test@example.com");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it("should pre-fill accommodation form email after successful search", async () => {
      const mockResponse = {
        found: true,
        participant: {
          name: "John Doe",
          email: "john@example.com",
          college: "NIT Trichy",
          events: [],
          workshops: [],
          accommodation: null,
        },
      };

      vi.mocked(api.searchParticipant).mockResolvedValue(mockResponse);

      render(<App />);

      const searchInput = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(searchInput, "john@example.com");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        const formEmailInput = screen.getByLabelText(
          /email/i,
        ) as HTMLInputElement;
        expect(formEmailInput.value).toBe("john@example.com");
      });
    });
  });

  describe("Add Accommodation Workflow", () => {
    const fillAccommodationForm = async () => {
      await userEvent.type(screen.getByLabelText(/^name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/college/i), "NIT Trichy");
      await userEvent.selectOptions(
        screen.getByLabelText(/from date/i),
        "2026-03-06",
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/to date/i),
        "2026-03-08",
      );
    };

    it("should successfully add accommodation entry", async () => {
      const mockResponse = {
        success: true,
        message: "Accommodation entry created successfully",
      };

      vi.mocked(api.addAccommodation).mockResolvedValue(mockResponse);

      render(<App />);

      await fillAccommodationForm();

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/accommodation entry created successfully/i),
        ).toBeInTheDocument();
      });
    });

    it("should display validation errors from API", async () => {
      const mockError = new Error("Validation failed") as any;
      mockError.type = "validation";
      mockError.details = [{ field: "email", message: "Invalid email format" }];

      vi.mocked(api.addAccommodation).mockRejectedValue(mockError);

      render(<App />);

      await fillAccommodationForm();

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe("Duplicate Handling Workflow", () => {
    const fillAccommodationForm = async () => {
      await userEvent.type(screen.getByLabelText(/^name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/college/i), "NIT Trichy");
      await userEvent.selectOptions(
        screen.getByLabelText(/from date/i),
        "2026-03-06",
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/to date/i),
        "2026-03-08",
      );
    };

    it("should show duplicate warning modal when duplicate is detected", async () => {
      const mockError = new Error("Duplicate entry found") as any;
      mockError.type = "duplicate";
      mockError.existingEntry = {
        name: "John Doe",
        email: "john@example.com",
        fromDate: "2026-03-06",
        toDate: "2026-03-07",
      };

      vi.mocked(api.addAccommodation).mockRejectedValue(mockError);

      render(<App />);

      await fillAccommodationForm();

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/duplicate entry warning/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/existing entry/i)).toBeInTheDocument();
      });
    });

    it("should cancel duplicate and close modal", async () => {
      const mockError = new Error("Duplicate entry found") as any;
      mockError.type = "duplicate";
      mockError.existingEntry = {
        name: "John Doe",
        email: "john@example.com",
      };

      vi.mocked(api.addAccommodation).mockRejectedValue(mockError);

      render(<App />);

      await fillAccommodationForm();

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/duplicate entry warning/i),
        ).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/duplicate entry warning/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should confirm duplicate and add entry with force flag", async () => {
      const mockError = new Error("Duplicate entry found") as any;
      mockError.type = "duplicate";
      mockError.existingEntry = {
        name: "John Doe",
        email: "john@example.com",
      };

      const mockSuccessResponse = {
        success: true,
        message: "Accommodation entry created successfully",
      };

      vi.mocked(api.addAccommodation)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(mockSuccessResponse);

      render(<App />);

      await fillAccommodationForm();

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/duplicate entry warning/i),
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /confirm & add anyway/i,
      });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(
          screen.getByText(/accommodation entry created successfully/i),
        ).toBeInTheDocument();
      });

      // Verify force flag was used
      expect(api.addAccommodation).toHaveBeenCalledWith(
        expect.objectContaining({ force: true }),
      );
    });
  });

  describe("Error Dismissal", () => {
    it("should dismiss error when dismiss button is clicked", async () => {
      const mockError = new Error("Test error") as any;
      mockError.type = "validation";

      vi.mocked(api.searchParticipant).mockRejectedValue(mockError);

      render(<App />);

      const emailInput = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(emailInput, "test@example.com");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText(/test error/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText(/dismiss error/i);
      await userEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/test error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Success Message", () => {
    it("should display and dismiss success message", async () => {
      const mockResponse = {
        success: true,
        message: "Entry created successfully",
      };

      vi.mocked(api.addAccommodation).mockResolvedValue(mockResponse);

      render(<App />);

      await userEvent.type(screen.getByLabelText(/^name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/college/i), "NIT Trichy");
      await userEvent.selectOptions(
        screen.getByLabelText(/from date/i),
        "2026-03-06",
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/to date/i),
        "2026-03-08",
      );

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/entry created successfully/i),
        ).toBeInTheDocument();
      });

      const dismissButton = screen.getByLabelText(/dismiss success message/i);
      await userEvent.click(dismissButton);

      await waitFor(() => {
        expect(
          screen.queryByText(/entry created successfully/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Complete User Journey", () => {
    it("should complete full workflow: search -> view results -> add accommodation", async () => {
      const mockSearchResponse = {
        found: true,
        participant: {
          name: "Jane Smith",
          email: "jane@example.com",
          college: "IIT Madras",
          events: ["Hackathon"],
          workshops: [],
          accommodation: null,
        },
      };

      const mockAddResponse = {
        success: true,
        message: "Accommodation added successfully",
      };

      const mockRefreshResponse = {
        found: true,
        participant: {
          ...mockSearchResponse.participant,
          accommodation: {
            hasAccommodation: true,
            fromDate: "2026-03-06",
            toDate: "2026-03-08",
            type: "Girls" as const,
          },
        },
      };

      vi.mocked(api.searchParticipant)
        .mockResolvedValueOnce(mockSearchResponse)
        .mockResolvedValueOnce(mockRefreshResponse);

      vi.mocked(api.addAccommodation).mockResolvedValue(mockAddResponse);

      render(<App />);

      // Step 1: Search for participant
      const searchInput = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(searchInput, "jane@example.com");

      const searchButton = screen.getByRole("button", { name: /search/i });
      await userEvent.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
        expect(screen.getByText(/no accommodation/i)).toBeInTheDocument();
      });

      // Step 2: Fill accommodation form (email should be pre-filled)
      await userEvent.type(screen.getByLabelText(/^name/i), "Jane Smith");
      await userEvent.type(screen.getByLabelText(/college/i), "IIT Madras");
      await userEvent.selectOptions(
        screen.getByLabelText(/from date/i),
        "2026-03-06",
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/to date/i),
        "2026-03-08",
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/accommodation type/i),
        "Girls",
      );

      // Step 3: Submit accommodation
      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      // Step 4: Verify success and updated results
      await waitFor(() => {
        expect(
          screen.getByText(/accommodation added successfully/i),
        ).toBeInTheDocument();
        expect(
          screen.getByText(/accommodation confirmed/i),
        ).toBeInTheDocument();
      });
    });
  });
});
