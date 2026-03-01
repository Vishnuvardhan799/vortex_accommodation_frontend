import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorDisplay } from "./ErrorDisplay";
import type { ErrorState } from "../types";

describe("ErrorDisplay", () => {
  let mockOnDismiss: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnDismiss = vi.fn();
  });

  describe("Rendering", () => {
    it("should not render when error is null", () => {
      const { container } = render(
        <ErrorDisplay error={null} onDismiss={mockOnDismiss} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("should render when error is provided", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Test error message",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should have proper ARIA attributes", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Test error",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });
  });

  describe("Validation Errors", () => {
    it("should display validation error with yellow styling", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Validation failed",
      };

      const { container } = render(
        <ErrorDisplay error={error} onDismiss={mockOnDismiss} />,
      );

      const alert = screen.getByRole("alert");
      expect(alert.className).toContain("bg-yellow-50");
      expect(alert.className).toContain("border-yellow-500");
    });

    it("should display validation error title", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Validation failed",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByText("Validation Error")).toBeInTheDocument();
    });

    it("should display validation error message", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Please fix the following errors",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(
        screen.getByText("Please fix the following errors"),
      ).toBeInTheDocument();
    });

    it("should display field-specific validation errors", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Validation failed",
        details: [
          { field: "email", message: "Invalid email format" },
          { field: "name", message: "Name is required" },
        ],
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText(/email:/i)).toBeInTheDocument();
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      expect(screen.getByText(/name:/i)).toBeInTheDocument();
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    it("should render field errors as a list", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Validation failed",
        details: [
          { field: "email", message: "Invalid" },
          { field: "name", message: "Required" },
        ],
      };

      const { container } = render(
        <ErrorDisplay error={error} onDismiss={mockOnDismiss} />,
      );

      const list = container.querySelector("ul");
      expect(list).toBeInTheDocument();
      expect(list?.querySelectorAll("li")).toHaveLength(2);
    });
  });

  describe("Duplicate Errors", () => {
    it("should display duplicate error with blue styling", () => {
      const error: ErrorState = {
        type: "duplicate",
        message: "Duplicate entry found",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      const alert = screen.getByRole("alert");
      expect(alert.className).toContain("bg-blue-50");
      expect(alert.className).toContain("border-blue-500");
    });

    it("should display duplicate error title", () => {
      const error: ErrorState = {
        type: "duplicate",
        message: "Duplicate entry found",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByText("Duplicate Entry")).toBeInTheDocument();
    });

    it("should display existing entry information", () => {
      const error: ErrorState = {
        type: "duplicate",
        message: "Duplicate entry found",
        existingEntry: {
          name: "John Doe",
          email: "john@example.com",
          fromDate: "2026-03-06",
          toDate: "2026-03-08",
        },
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText(/existing entry:/i)).toBeInTheDocument();
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/john@example\.com/i)).toBeInTheDocument();
    });

    it("should format dates in existing entry", () => {
      const error: ErrorState = {
        type: "duplicate",
        message: "Duplicate entry found",
        existingEntry: {
          fromDate: "2026-03-06",
          toDate: "2026-03-08",
        },
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      const datesText = screen.getByText(/dates:/i).parentElement?.textContent;
      expect(datesText).toContain("3/6/2026");
      expect(datesText).toContain("3/8/2026");
    });

    it("should not display existing entry section when not provided", () => {
      const error: ErrorState = {
        type: "duplicate",
        message: "Duplicate entry found",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.queryByText(/existing entry:/i)).not.toBeInTheDocument();
    });
  });

  describe("Other Error Types", () => {
    it("should display authentication error", () => {
      const error: ErrorState = {
        type: "auth",
        message: "Authentication failed",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByText("Authentication Error")).toBeInTheDocument();
      expect(screen.getByText("Authentication failed")).toBeInTheDocument();
    });

    it("should display rate limit error with orange styling", () => {
      const error: ErrorState = {
        type: "rate_limit",
        message: "Too many requests",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText("Rate Limit Exceeded")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(alert.className).toContain("bg-orange-50");
      expect(alert.className).toContain("border-orange-500");
    });

    it("should display service unavailable error with red styling", () => {
      const error: ErrorState = {
        type: "service_unavailable",
        message: "Service is down",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText("Service Unavailable")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(alert.className).toContain("bg-red-50");
      expect(alert.className).toContain("border-red-500");
    });

    it("should display network error with red styling", () => {
      const error: ErrorState = {
        type: "network",
        message: "Network connection failed",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText("Network Error")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(alert.className).toContain("bg-red-50");
      expect(alert.className).toContain("border-red-500");
    });

    it("should display unknown error with red styling", () => {
      const error: ErrorState = {
        type: "unknown",
        message: "Something went wrong",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText("Error")).toBeInTheDocument();
      const alert = screen.getByRole("alert");
      expect(alert.className).toContain("bg-red-50");
      expect(alert.className).toContain("border-red-500");
    });

    it("should display client error", () => {
      const error: ErrorState = {
        type: "client",
        message: "Client error occurred",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Client error occurred")).toBeInTheDocument();
    });
  });

  describe("Dismiss Functionality", () => {
    it("should render dismiss button", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Test error",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByLabelText(/dismiss error/i)).toBeInTheDocument();
    });

    it("should call onDismiss when dismiss button is clicked", async () => {
      const error: ErrorState = {
        type: "validation",
        message: "Test error",
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      const dismissButton = screen.getByLabelText(/dismiss error/i);
      await userEvent.click(dismissButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe("Icons", () => {
    it("should render appropriate icon for each error type", () => {
      const errorTypes: Array<ErrorState["type"]> = [
        "validation",
        "duplicate",
        "auth",
        "rate_limit",
        "service_unavailable",
        "network",
        "client",
        "unknown",
      ];

      errorTypes.forEach((type) => {
        const error: ErrorState = {
          type,
          message: "Test error",
        };

        const { container, unmount } = render(
          <ErrorDisplay error={error} onDismiss={mockOnDismiss} />,
        );

        // Check that an SVG icon is rendered
        const icon = container.querySelector("svg");
        expect(icon).toBeInTheDocument();

        unmount();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty details array", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Validation failed",
        details: [],
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      // Should not render the list if details is empty
      const { container } = render(
        <ErrorDisplay error={error} onDismiss={mockOnDismiss} />,
      );
      const list = container.querySelector("ul");
      expect(list).not.toBeInTheDocument();
    });

    it("should handle long error messages", () => {
      const longMessage =
        "This is a very long error message that contains a lot of information about what went wrong and how to fix it. It should still be displayed properly without breaking the layout.";

      const error: ErrorState = {
        type: "validation",
        message: longMessage,
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle multiple field errors", () => {
      const error: ErrorState = {
        type: "validation",
        message: "Multiple validation errors",
        details: [
          { field: "field1", message: "Error 1" },
          { field: "field2", message: "Error 2" },
          { field: "field3", message: "Error 3" },
          { field: "field4", message: "Error 4" },
          { field: "field5", message: "Error 5" },
        ],
      };

      const { container } = render(
        <ErrorDisplay error={error} onDismiss={mockOnDismiss} />,
      );

      const list = container.querySelector("ul");
      expect(list?.querySelectorAll("li")).toHaveLength(5);
    });

    it("should handle partial existing entry data", () => {
      const error: ErrorState = {
        type: "duplicate",
        message: "Duplicate found",
        existingEntry: {
          name: "John Doe",
          // Missing email and dates
        },
      };

      render(<ErrorDisplay error={error} onDismiss={mockOnDismiss} />);

      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.queryByText(/email:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/dates:/i)).not.toBeInTheDocument();
    });
  });
});
