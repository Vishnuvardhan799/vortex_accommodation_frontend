import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DuplicateWarningModal } from "./DuplicateWarningModal";
import type { AccommodationEntry, AccommodationFormData } from "../types";

describe("DuplicateWarningModal", () => {
  let mockOnConfirm: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;

  const existingEntry: Partial<AccommodationEntry> = {
    name: "John Doe",
    email: "john@example.com",
    college: "NIT Trichy",
    fromDate: "2026-03-06",
    toDate: "2026-03-07",
    accommodationType: "Boys",
    notes: "Existing notes",
  };

  const newEntry: AccommodationFormData = {
    name: "John Doe",
    email: "john@example.com",
    college: "NIT Trichy",
    fromDate: "2026-03-07",
    toDate: "2026-03-08",
    accommodationType: "Boys",
    notes: "New notes",
  };

  beforeEach(() => {
    mockOnConfirm = vi.fn();
    mockOnCancel = vi.fn();
  });

  describe("Rendering", () => {
    it("should not render when isOpen is false", () => {
      render(
        <DuplicateWarningModal
          isOpen={false}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.queryByText(/duplicate entry warning/i),
      ).not.toBeInTheDocument();
    });

    it("should render when isOpen is true", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/duplicate entry warning/i)).toBeInTheDocument();
    });

    it("should render modal title and description", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/duplicate entry warning/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /an accommodation entry already exists for this email/i,
        ),
      ).toBeInTheDocument();
    });

    it("should render warning icon", () => {
      const { container } = render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const icon = container.querySelector(".bg-warning-100 svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Existing Entry Display", () => {
    it("should display existing entry section", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/existing entry/i)).toBeInTheDocument();
    });

    it("should display existing entry details", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      // Check for all existing entry fields
      const existingSection = screen
        .getByText(/existing entry/i)
        .closest("div");
      expect(existingSection?.textContent).toContain("John Doe");
      expect(existingSection?.textContent).toContain("john@example.com");
      expect(existingSection?.textContent).toContain("NIT Trichy");
      expect(existingSection?.textContent).toContain("Boys");
      expect(existingSection?.textContent).toContain("Existing notes");
    });

    it("should format existing entry dates", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const existingSection = screen
        .getByText(/existing entry/i)
        .closest("div");
      expect(existingSection?.textContent).toMatch(/mar.*6.*mar.*7/i);
    });

    it("should handle missing notes in existing entry", () => {
      const entryWithoutNotes = { ...existingEntry, notes: undefined };

      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={entryWithoutNotes}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const existingSection = screen
        .getByText(/existing entry/i)
        .closest("div");
      expect(existingSection?.textContent).not.toContain("Notes:");
    });

    it("should display N/A for missing fields", () => {
      const incompleteEntry: Partial<AccommodationEntry> = {
        email: "test@example.com",
      };

      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={incompleteEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const existingSection = screen
        .getByText(/existing entry/i)
        .closest("div");
      expect(existingSection?.textContent).toContain("N/A");
    });
  });

  describe("New Entry Display", () => {
    it("should display new entry section", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.getByText(/new entry \(to be added\)/i),
      ).toBeInTheDocument();
    });

    it("should display new entry details", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const newSection = screen
        .getByText(/new entry \(to be added\)/i)
        .closest("div");
      expect(newSection?.textContent).toContain("John Doe");
      expect(newSection?.textContent).toContain("john@example.com");
      expect(newSection?.textContent).toContain("NIT Trichy");
      expect(newSection?.textContent).toContain("Boys");
      expect(newSection?.textContent).toContain("New notes");
    });

    it("should format new entry dates", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const newSection = screen
        .getByText(/new entry \(to be added\)/i)
        .closest("div");
      expect(newSection?.textContent).toMatch(/mar.*7.*mar.*8/i);
    });

    it("should handle missing notes in new entry", () => {
      const entryWithoutNotes = { ...newEntry, notes: "" };

      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={entryWithoutNotes}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const newSection = screen
        .getByText(/new entry \(to be added\)/i)
        .closest("div");
      // Notes section should not be rendered if notes is empty
      const notesCount = (newSection?.textContent?.match(/Notes:/g) || [])
        .length;
      expect(notesCount).toBe(0);
    });
  });

  describe("Warning Message", () => {
    it("should display warning message", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(/warning:/i)).toBeInTheDocument();
      expect(
        screen.getByText(/confirming will create a duplicate entry/i),
      ).toBeInTheDocument();
    });
  });

  describe("Action Buttons", () => {
    it("should render cancel and confirm buttons", () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm & add anyway/i }),
      ).toBeInTheDocument();
    });

    it("should call onCancel when cancel button is clicked", async () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await userEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it("should call onConfirm when confirm button is clicked", async () => {
      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const confirmButton = screen.getByRole("button", {
        name: /confirm & add anyway/i,
      });
      await userEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnCancel).not.toHaveBeenCalled();
    });
  });

  describe("Modal Behavior", () => {
    it("should have proper styling for existing entry section", () => {
      const { container } = render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const existingSection = screen
        .getByText(/existing entry/i)
        .closest("div");
      expect(existingSection?.className).toContain("bg-blue-50");
      expect(existingSection?.className).toContain("border-blue-200");
    });

    it("should have proper styling for new entry section", () => {
      const { container } = render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const newSection = screen
        .getByText(/new entry \(to be added\)/i)
        .closest("div");
      expect(newSection?.className).toContain("bg-green-50");
      expect(newSection?.className).toContain("border-green-200");
    });

    it("should have proper styling for warning message", () => {
      const { container } = render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={newEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const warningSection = screen.getByText(/warning:/i).closest("div");
      expect(warningSection?.className).toContain("bg-warning-50");
      expect(warningSection?.className).toContain("border-warning-500");
    });
  });

  describe("Edge Cases", () => {
    it("should handle all accommodation types", () => {
      const types: Array<"Boys" | "Girls" | "Other"> = [
        "Boys",
        "Girls",
        "Other",
      ];

      types.forEach((type) => {
        const entry = { ...newEntry, accommodationType: type };

        const { unmount } = render(
          <DuplicateWarningModal
            isOpen={true}
            existingEntry={existingEntry}
            newEntry={entry}
            onConfirm={mockOnConfirm}
            onCancel={mockOnCancel}
          />,
        );

        const newSection = screen
          .getByText(/new entry \(to be added\)/i)
          .closest("div");
        expect(newSection?.textContent).toContain(type);

        unmount();
      });
    });

    it("should handle same-day accommodation", () => {
      const sameDayEntry = {
        ...newEntry,
        fromDate: "2026-03-07",
        toDate: "2026-03-07",
      };

      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={sameDayEntry}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      const newSection = screen
        .getByText(/new entry \(to be added\)/i)
        .closest("div");
      expect(newSection?.textContent).toMatch(/mar.*7.*mar.*7/i);
    });

    it("should handle long notes", () => {
      const longNotes =
        "This is a very long note that contains a lot of information about the accommodation request and special requirements.";
      const entryWithLongNotes = { ...newEntry, notes: longNotes };

      render(
        <DuplicateWarningModal
          isOpen={true}
          existingEntry={existingEntry}
          newEntry={entryWithLongNotes}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByText(longNotes)).toBeInTheDocument();
    });
  });
});
