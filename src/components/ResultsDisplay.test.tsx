import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultsDisplay } from "./ResultsDisplay";
import type { ParticipantData } from "../types";

describe("ResultsDisplay", () => {
  const mockParticipantWithAccommodation: ParticipantData = {
    name: "John Doe",
    email: "john@example.com",
    college: "NIT Trichy",
    events: ["Tech Talk", "Hackathon"],
    workshops: ["AI Workshop", "Web Dev Workshop"],
    accommodation: {
      hasAccommodation: true,
      fromDate: "2026-03-06",
      toDate: "2026-03-08",
      type: "Boys",
      notes: "Late arrival",
    },
  };

  const mockParticipantWithoutAccommodation: ParticipantData = {
    name: "Jane Smith",
    email: "jane@example.com",
    college: "IIT Madras",
    events: ["Workshop Series"],
    workshops: [],
    accommodation: null,
  };

  describe("Rendering Basic Information", () => {
    it("should render participant name", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should render participant email", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("should render participant college", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);
      expect(screen.getByText("NIT Trichy")).toBeInTheDocument();
    });
  });

  describe("Accommodation Status - With Accommodation", () => {
    it("should display green badge when accommodation exists", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);

      const badge = screen.getByText(/accommodation confirmed/i);
      expect(badge).toBeInTheDocument();

      const badgeContainer = badge.closest("div");
      expect(badgeContainer?.className).toContain("bg-success-50");
      expect(badgeContainer?.className).toContain("border-success-500");
    });

    it("should display accommodation dates", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);

      // Dates should be formatted as "Mar 6 - Mar 8"
      expect(screen.getByText(/mar 6.*mar 8/i)).toBeInTheDocument();
    });

    it("should display accommodation type", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);
      expect(screen.getByText(/type:.*boys/i)).toBeInTheDocument();
    });

    it("should display accommodation notes when present", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);
      expect(screen.getByText(/notes:.*late arrival/i)).toBeInTheDocument();
    });

    it("should not display notes section when notes are absent", () => {
      const participantWithoutNotes: ParticipantData = {
        ...mockParticipantWithAccommodation,
        accommodation: {
          ...mockParticipantWithAccommodation.accommodation!,
          notes: undefined,
        },
      };

      render(<ResultsDisplay participant={participantWithoutNotes} />);
      expect(screen.queryByText(/notes:/i)).not.toBeInTheDocument();
    });
  });

  describe("Accommodation Status - Without Accommodation", () => {
    it("should display red badge when accommodation is null", () => {
      render(
        <ResultsDisplay participant={mockParticipantWithoutAccommodation} />,
      );

      const badge = screen.getByText(/no accommodation/i);
      expect(badge).toBeInTheDocument();

      const badgeContainer = badge.closest("div");
      expect(badgeContainer?.className).toContain("bg-error-50");
      expect(badgeContainer?.className).toContain("border-error-500");
    });

    it("should not display dates when accommodation is null", () => {
      render(
        <ResultsDisplay participant={mockParticipantWithoutAccommodation} />,
      );
      expect(screen.queryByText(/mar/i)).not.toBeInTheDocument();
    });

    it("should display red badge when hasAccommodation is false", () => {
      const participantWithFalseAccommodation: ParticipantData = {
        ...mockParticipantWithAccommodation,
        accommodation: {
          hasAccommodation: false,
          fromDate: "2026-03-06",
          toDate: "2026-03-08",
          type: "Boys",
        },
      };

      render(
        <ResultsDisplay participant={participantWithFalseAccommodation} />,
      );
      expect(screen.getByText(/no accommodation/i)).toBeInTheDocument();
    });
  });

  describe("Events List", () => {
    it("should render all events", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);

      expect(screen.getByText("Tech Talk")).toBeInTheDocument();
      expect(screen.getByText("Hackathon")).toBeInTheDocument();
    });

    it("should display empty state when no events", () => {
      const participantWithoutEvents: ParticipantData = {
        ...mockParticipantWithAccommodation,
        events: [],
      };

      render(<ResultsDisplay participant={participantWithoutEvents} />);
      expect(screen.getByText(/no events registered/i)).toBeInTheDocument();
    });

    it("should render events with icons", () => {
      const { container } = render(
        <ResultsDisplay participant={mockParticipantWithAccommodation} />,
      );

      // Check for SVG icons in events section
      const eventsList = container.querySelectorAll("ul")[0];
      const icons = eventsList?.querySelectorAll("svg");
      expect(icons?.length).toBe(2); // One icon per event
    });
  });

  describe("Workshops List", () => {
    it("should render all workshops", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);

      expect(screen.getByText("AI Workshop")).toBeInTheDocument();
      expect(screen.getByText("Web Dev Workshop")).toBeInTheDocument();
    });

    it("should display empty state when no workshops", () => {
      render(
        <ResultsDisplay participant={mockParticipantWithoutAccommodation} />,
      );
      expect(screen.getByText(/no workshops registered/i)).toBeInTheDocument();
    });

    it("should render workshops with icons", () => {
      const { container } = render(
        <ResultsDisplay participant={mockParticipantWithAccommodation} />,
      );

      // Check for SVG icons in workshops section
      const workshopsList = container.querySelectorAll("ul")[1];
      const icons = workshopsList?.querySelectorAll("svg");
      expect(icons?.length).toBe(2); // One icon per workshop
    });
  });

  describe("Layout and Styling", () => {
    it("should render with card layout", () => {
      const { container } = render(
        <ResultsDisplay participant={mockParticipantWithAccommodation} />,
      );

      const card = container.querySelector(".bg-white.rounded-lg.shadow-md");
      expect(card).toBeInTheDocument();
    });

    it("should have primary colored header", () => {
      const { container } = render(
        <ResultsDisplay participant={mockParticipantWithAccommodation} />,
      );

      const header = container.querySelector(".bg-primary-600");
      expect(header).toBeInTheDocument();
      expect(header?.textContent).toContain("John Doe");
    });

    it("should have proper section headings", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);

      expect(screen.getByText(/college/i)).toBeInTheDocument();
      expect(screen.getByText(/accommodation status/i)).toBeInTheDocument();
      expect(screen.getByText(/registered events/i)).toBeInTheDocument();
      expect(screen.getByText(/registered workshops/i)).toBeInTheDocument();
    });
  });

  describe("Date Formatting", () => {
    it("should format dates correctly", () => {
      render(<ResultsDisplay participant={mockParticipantWithAccommodation} />);

      // Should display "Mar 6" and "Mar 8"
      const dateText = screen.getByText(/mar 6.*mar 8/i);
      expect(dateText).toBeInTheDocument();
    });

    it("should handle same day accommodation", () => {
      const sameDayParticipant: ParticipantData = {
        ...mockParticipantWithAccommodation,
        accommodation: {
          hasAccommodation: true,
          fromDate: "2026-03-07",
          toDate: "2026-03-07",
          type: "Girls",
        },
      };

      render(<ResultsDisplay participant={sameDayParticipant} />);
      expect(screen.getByText(/mar 7.*mar 7/i)).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle participant with single event", () => {
      const singleEventParticipant: ParticipantData = {
        ...mockParticipantWithAccommodation,
        events: ["Single Event"],
      };

      render(<ResultsDisplay participant={singleEventParticipant} />);
      expect(screen.getByText("Single Event")).toBeInTheDocument();
      expect(
        screen.queryByText(/no events registered/i),
      ).not.toBeInTheDocument();
    });

    it("should handle participant with single workshop", () => {
      const singleWorkshopParticipant: ParticipantData = {
        ...mockParticipantWithAccommodation,
        workshops: ["Single Workshop"],
      };

      render(<ResultsDisplay participant={singleWorkshopParticipant} />);
      expect(screen.getByText("Single Workshop")).toBeInTheDocument();
      expect(
        screen.queryByText(/no workshops registered/i),
      ).not.toBeInTheDocument();
    });

    it("should handle long event names", () => {
      const longEventParticipant: ParticipantData = {
        ...mockParticipantWithAccommodation,
        events: [
          "This is a very long event name that should still be displayed properly",
        ],
      };

      render(<ResultsDisplay participant={longEventParticipant} />);
      expect(
        screen.getByText(/this is a very long event name/i),
      ).toBeInTheDocument();
    });

    it("should handle all accommodation types", () => {
      const types: Array<"Boys" | "Girls" | "Other"> = [
        "Boys",
        "Girls",
        "Other",
      ];

      types.forEach((type) => {
        const participant: ParticipantData = {
          ...mockParticipantWithAccommodation,
          accommodation: {
            ...mockParticipantWithAccommodation.accommodation!,
            type,
          },
        };

        const { unmount } = render(
          <ResultsDisplay participant={participant} />,
        );
        expect(
          screen.getByText(new RegExp(`type:.*${type}`, "i")),
        ).toBeInTheDocument();
        unmount();
      });
    });
  });
});
