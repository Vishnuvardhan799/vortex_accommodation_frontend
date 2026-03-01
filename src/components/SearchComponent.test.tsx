import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchComponent } from "./SearchComponent";

describe("SearchComponent", () => {
  let mockOnSearch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSearch = vi.fn().mockResolvedValue(undefined);
  });

  describe("Rendering", () => {
    it("should render search input and button", () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      expect(
        screen.getByLabelText(/search participant by email/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/enter email address/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /search/i }),
      ).toBeInTheDocument();
    });

    it("should render with loading state", () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={true} />);

      const input = screen.getByPlaceholderText(/enter email address/i);
      const button = screen.getByRole("button", { name: /searching/i });

      expect(input).toBeDisabled();
      expect(button).toBeDisabled();
      expect(screen.getByText(/searching/i)).toBeInTheDocument();
    });
  });

  describe("Email Validation", () => {
    it("should show error for invalid email format on blur", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      await userEvent.type(input, "invalid-email");
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it("should show error for empty email on blur", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      fireEvent.focus(input);
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("should not show error for valid email", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      await userEvent.type(input, "valid@example.com");
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });

    it("should clear error when valid email is entered", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      // Enter invalid email
      await userEvent.type(input, "invalid");
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      // Clear and enter valid email
      await userEvent.clear(input);
      await userEvent.type(input, "valid@example.com");

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });
    });
  });

  describe("Search Functionality", () => {
    it("should call onSearch with valid email on submit", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);
      const form = input.closest("form")!;

      await userEvent.type(input, "test@example.com");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSearch).toHaveBeenCalledWith("test@example.com");
      });
    });

    it("should not call onSearch with invalid email", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);
      const form = input.closest("form")!;

      await userEvent.type(input, "invalid-email");
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSearch).not.toHaveBeenCalled();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it("should not call onSearch with empty email", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const form = screen
        .getByPlaceholderText(/enter email address/i)
        .closest("form")!;

      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockOnSearch).not.toHaveBeenCalled();
      });
    });

    it("should disable submit button when loading", () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={true} />);

      const button = screen.getByRole("button", { name: /searching/i });
      expect(button).toBeDisabled();
    });

    it("should disable submit button when email is empty", () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const button = screen.getByRole("button", { name: /search/i });
      expect(button).toBeDisabled();
    });

    it("should disable submit button when email is invalid", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(input, "invalid");

      const button = screen.getByRole("button", { name: /search/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Clear Functionality", () => {
    it("should show clear button when email is entered", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(input, "test@example.com");

      const clearButton = screen.getByLabelText(/clear search/i);
      expect(clearButton).toBeInTheDocument();
    });

    it("should not show clear button when email is empty", () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
    });

    it("should clear email and error when clear button is clicked", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      // Enter invalid email
      await userEvent.type(input, "invalid");
      fireEvent.blur(input);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      // Click clear button
      const clearButton = screen.getByLabelText(/clear search/i);
      await userEvent.click(clearButton);

      expect(input).toHaveValue("");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should not show clear button when loading", async () => {
      const { rerender } = render(
        <SearchComponent onSearch={mockOnSearch} isLoading={false} />,
      );

      const input = screen.getByPlaceholderText(/enter email address/i);
      await userEvent.type(input, "test@example.com");

      expect(screen.getByLabelText(/clear search/i)).toBeInTheDocument();

      // Rerender with loading state
      rerender(<SearchComponent onSearch={mockOnSearch} isLoading={true} />);

      expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument();
    });
  });

  describe("Debounced Validation", () => {
    it("should debounce validation while typing", async () => {
      vi.useFakeTimers();

      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      // Type invalid email
      await userEvent.type(input, "invalid");

      // Error should not appear immediately
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();

      // Blur to trigger validation
      fireEvent.blur(input);

      // Error should appear after blur
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      expect(input).toHaveAttribute("aria-invalid", "false");
      expect(input).not.toHaveAttribute("aria-describedby");
    });

    it("should set ARIA attributes when error is shown", async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      await userEvent.type(input, "invalid");
      fireEvent.blur(input);

      await waitFor(() => {
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(input).toHaveAttribute("aria-describedby", "email-error");
      });
    });

    it('should have role="alert" on error message', async () => {
      render(<SearchComponent onSearch={mockOnSearch} isLoading={false} />);

      const input = screen.getByPlaceholderText(/enter email address/i);

      await userEvent.type(input, "invalid");
      fireEvent.blur(input);

      await waitFor(() => {
        const errorMessage = screen.getByText(/invalid email format/i);
        expect(errorMessage).toHaveAttribute("role", "alert");
      });
    });
  });
});
