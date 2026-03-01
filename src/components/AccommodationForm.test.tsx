import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccommodationForm } from "./AccommodationForm";

describe("AccommodationForm", () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined);
  });

  describe("Rendering", () => {
    it("should render all form fields", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/college/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/from date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/to date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/accommodation type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    });

    it("should render submit button", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);
      expect(
        screen.getByRole("button", { name: /add accommodation/i }),
      ).toBeInTheDocument();
    });

    it("should mark required fields with asterisk", () => {
      const { container } = render(
        <AccommodationForm onSubmit={mockOnSubmit} />,
      );
      const asterisks = container.querySelectorAll(".text-error-500");
      expect(asterisks.length).toBeGreaterThan(0);
    });
  });

  describe("Initial Email Pre-fill", () => {
    it("should pre-fill email when initialEmail is provided", () => {
      render(
        <AccommodationForm
          onSubmit={mockOnSubmit}
          initialEmail="test@example.com"
        />,
      );

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.value).toBe("test@example.com");
    });

    it("should have empty email when initialEmail is not provided", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.value).toBe("");
    });

    it("should update email when initialEmail changes", () => {
      const { rerender } = render(
        <AccommodationForm
          onSubmit={mockOnSubmit}
          initialEmail="first@example.com"
        />,
      );

      let emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.value).toBe("first@example.com");

      rerender(
        <AccommodationForm
          onSubmit={mockOnSubmit}
          initialEmail="second@example.com"
        />,
      );

      emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      expect(emailInput.value).toBe("second@example.com");
    });
  });

  describe("Form Validation - Required Fields", () => {
    it("should show error for empty name on blur", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
      });
    });

    it("should show error for empty email on blur", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      fireEvent.focus(emailInput);
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it("should show error for invalid email format", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, "invalid-email");
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it("should show error for empty college on blur", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const collegeInput = screen.getByLabelText(/college/i);
      fireEvent.focus(collegeInput);
      fireEvent.blur(collegeInput);

      await waitFor(() => {
        expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
      });
    });
  });

  describe("Date Validation", () => {
    it("should show error when from date is after to date", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const fromDateSelect = screen.getByLabelText(/from date/i);
      const toDateSelect = screen.getByLabelText(/to date/i);

      await userEvent.selectOptions(fromDateSelect, "2026-03-08");
      fireEvent.blur(fromDateSelect);
      await userEvent.selectOptions(toDateSelect, "2026-03-06");
      fireEvent.blur(toDateSelect);

      await waitFor(() => {
        expect(
          screen.getByText(/from date must be before or equal to to date/i),
        ).toBeInTheDocument();
      });
    });

    it("should not show error when from date equals to date", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const fromDateSelect = screen.getByLabelText(/from date/i);
      const toDateSelect = screen.getByLabelText(/to date/i);

      await userEvent.selectOptions(fromDateSelect, "2026-03-07");
      fireEvent.blur(fromDateSelect);
      await userEvent.selectOptions(toDateSelect, "2026-03-07");
      fireEvent.blur(toDateSelect);

      await waitFor(() => {
        expect(
          screen.queryByText(/from date must be before or equal to to date/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should not show error when from date is before to date", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const fromDateSelect = screen.getByLabelText(/from date/i);
      const toDateSelect = screen.getByLabelText(/to date/i);

      await userEvent.selectOptions(fromDateSelect, "2026-03-06");
      fireEvent.blur(fromDateSelect);
      await userEvent.selectOptions(toDateSelect, "2026-03-08");
      fireEvent.blur(toDateSelect);

      await waitFor(() => {
        expect(
          screen.queryByText(/from date must be before or equal to to date/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should display all valid dates in dropdowns", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const fromDateSelect = screen.getByLabelText(/from date/i);
      const options = Array.from(fromDateSelect.querySelectorAll("option"));

      // Should have 4 options: placeholder + 3 dates
      expect(options).toHaveLength(4);
      expect(options[0].textContent).toContain("Select date");
      expect(options[1].value).toBe("2026-03-06");
      expect(options[2].value).toBe("2026-03-07");
      expect(options[3].value).toBe("2026-03-08");
    });
  });

  describe("Accommodation Type", () => {
    it("should have Boys as default accommodation type", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(
        /accommodation type/i,
      ) as HTMLSelectElement;
      expect(typeSelect.value).toBe("Boys");
    });

    it("should display all accommodation types", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(/accommodation type/i);
      const options = Array.from(typeSelect.querySelectorAll("option"));

      expect(options).toHaveLength(3);
      expect(options[0].value).toBe("Boys");
      expect(options[1].value).toBe("Girls");
      expect(options[2].value).toBe("Other");
    });

    it("should allow changing accommodation type", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const typeSelect = screen.getByLabelText(
        /accommodation type/i,
      ) as HTMLSelectElement;
      await userEvent.selectOptions(typeSelect, "Girls");

      expect(typeSelect.value).toBe("Girls");
    });
  });

  describe("Form Submission", () => {
    const fillValidForm = async () => {
      await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
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
      await userEvent.selectOptions(
        screen.getByLabelText(/accommodation type/i),
        "Boys",
      );
    };

    it("should call onSubmit with form data when valid", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      await fillValidForm();

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: "John Doe",
          email: "john@example.com",
          college: "NIT Trichy",
          fromDate: "2026-03-06",
          toDate: "2026-03-08",
          accommodationType: "Boys",
          notes: "",
        });
      });
    });

    it("should include notes when provided", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      await fillValidForm();
      await userEvent.type(screen.getByLabelText(/notes/i), "Late arrival");

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            notes: "Late arrival",
          }),
        );
      });
    });

    it("should not call onSubmit when form is invalid", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      // Submit without filling form
      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it("should show all validation errors on submit with empty form", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole("alert")).toHaveLength(5); // name, email, college, fromDate, toDate
      });
    });

    it("should not call onSubmit when date range is invalid", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      await userEvent.type(screen.getByLabelText(/name/i), "John Doe");
      await userEvent.type(screen.getByLabelText(/email/i), "john@example.com");
      await userEvent.type(screen.getByLabelText(/college/i), "NIT Trichy");
      await userEvent.selectOptions(
        screen.getByLabelText(/from date/i),
        "2026-03-08",
      );
      await userEvent.selectOptions(
        screen.getByLabelText(/to date/i),
        "2026-03-06",
      );

      const submitButton = screen.getByRole("button", {
        name: /add accommodation/i,
      });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
        expect(
          screen.getByText(/from date must be before or equal to to date/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should disable all inputs when loading", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByLabelText(/name/i)).toBeDisabled();
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/college/i)).toBeDisabled();
      expect(screen.getByLabelText(/from date/i)).toBeDisabled();
      expect(screen.getByLabelText(/to date/i)).toBeDisabled();
      expect(screen.getByLabelText(/accommodation type/i)).toBeDisabled();
      expect(screen.getByLabelText(/notes/i)).toBeDisabled();
    });

    it("should disable submit button when loading", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /submitting/i });
      expect(submitButton).toBeDisabled();
    });

    it("should show loading text on submit button", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} isLoading={true} />);

      expect(screen.getByText(/submitting/i)).toBeInTheDocument();
    });
  });

  describe("Field Validation on Change", () => {
    it("should clear error when valid value is entered", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const emailInput = screen.getByLabelText(/email/i);

      // Enter invalid email
      await userEvent.type(emailInput, "invalid");
      fireEvent.blur(emailInput);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });

      // Clear and enter valid email
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, "valid@example.com");

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid email format/i),
        ).not.toBeInTheDocument();
      });
    });

    it("should update date range error when dates change", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const fromDateSelect = screen.getByLabelText(/from date/i);
      const toDateSelect = screen.getByLabelText(/to date/i);

      // Set invalid range
      await userEvent.selectOptions(fromDateSelect, "2026-03-08");
      fireEvent.blur(fromDateSelect);
      await userEvent.selectOptions(toDateSelect, "2026-03-06");
      fireEvent.blur(toDateSelect);

      await waitFor(() => {
        expect(
          screen.getByText(/from date must be before or equal to to date/i),
        ).toBeInTheDocument();
      });

      // Fix the range
      await userEvent.selectOptions(fromDateSelect, "2026-03-06");

      await waitFor(() => {
        expect(
          screen.queryByText(/from date must be before or equal to to date/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes on inputs", () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/name/i);
      expect(nameInput).toHaveAttribute("aria-invalid", "false");
    });

    it("should set ARIA attributes when error is shown", async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        expect(nameInput).toHaveAttribute("aria-invalid", "true");
        expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
      });
    });

    it('should have role="alert" on error messages', async () => {
      render(<AccommodationForm onSubmit={mockOnSubmit} />);

      const nameInput = screen.getByLabelText(/name/i);
      fireEvent.focus(nameInput);
      fireEvent.blur(nameInput);

      await waitFor(() => {
        const errorMessage = screen.getByText(/this field is required/i);
        expect(errorMessage).toHaveAttribute("role", "alert");
      });
    });
  });
});
