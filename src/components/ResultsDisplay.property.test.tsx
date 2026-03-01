import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import fc from "fast-check";
import { ResultsDisplay } from "./ResultsDisplay";
import type { ParticipantData } from "../types";

/**
 * Property-based tests for ResultsDisplay component
 */

describe("ResultsDisplay - Property Tests", () => {
  /**
   * Property 4: Complete Participant Rendering
   * **Validates: Requirements 2.1, 2.4, 2.5**
   *
   * For any participant data object, rendering it in the UI should produce
   * output that contains the participant name, college name, and all items
   * from both the events list and workshops list.
   */
  it("Property 4: should render all participant fields for any valid participant data", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          college: fc.string({ minLength: 1, maxLength: 100 }),
          events: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
            maxLength: 10,
          }),
          workshops: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
            maxLength: 10,
          }),
          accommodation: fc.constantFrom(null),
        }),
        (participantData) => {
          const participant: ParticipantData = {
            ...participantData,
            accommodation: null,
          };

          const { container } = render(
            <ResultsDisplay participant={participant} />,
          );

          // Assert: Name should be rendered
          expect(screen.getByText(participant.name)).toBeInTheDocument();

          // Assert: Email should be rendered
          expect(screen.getByText(participant.email)).toBeInTheDocument();

          // Assert: College should be rendered
          expect(screen.getByText(participant.college)).toBeInTheDocument();

          // Assert: All events should be rendered
          participant.events.forEach((event) => {
            expect(screen.getByText(event)).toBeInTheDocument();
          });

          // Assert: All workshops should be rendered
          participant.workshops.forEach((workshop) => {
            expect(screen.getByText(workshop)).toBeInTheDocument();
          });

          // Cleanup
          container.remove();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("Property 4: should render empty state messages when events/workshops are empty", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          college: fc.string({ minLength: 1, maxLength: 100 }),
          accommodation: fc.constantFrom(null),
        }),
        (participantData) => {
          const participant: ParticipantData = {
            ...participantData,
            events: [],
            workshops: [],
            accommodation: null,
          };

          const { container } = render(
            <ResultsDisplay participant={participant} />,
          );

          // Assert: Empty state messages should be shown
          expect(screen.getByText(/no events registered/i)).toBeInTheDocument();
          expect(
            screen.getByText(/no workshops registered/i),
          ).toBeInTheDocument();

          // Cleanup
          container.remove();
        },
      ),
      { numRuns: 20 },
    );
  });

  it("Property 4: should render all events and workshops regardless of count", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          college: fc.string({ minLength: 1, maxLength: 100 }),
          events: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
            minLength: 1,
            maxLength: 15,
          }),
          workshops: fc.array(fc.string({ minLength: 1, maxLength: 50 }), {
            minLength: 1,
            maxLength: 15,
          }),
          accommodation: fc.constantFrom(null),
        }),
        (participantData) => {
          const participant: ParticipantData = {
            ...participantData,
            accommodation: null,
          };

          const { container } = render(
            <ResultsDisplay participant={participant} />,
          );

          // Assert: Count of rendered events matches input
          const eventElements = container
            .querySelectorAll("ul")[0]
            ?.querySelectorAll("li");
          if (eventElements) {
            expect(eventElements.length).toBe(participant.events.length);
          }

          // Assert: Count of rendered workshops matches input
          const workshopElements = container
            .querySelectorAll("ul")[1]
            ?.querySelectorAll("li");
          if (workshopElements) {
            expect(workshopElements.length).toBe(participant.workshops.length);
          }

          // Cleanup
          container.remove();
        },
      ),
      { numRuns: 30 },
    );
  });

  /**
   * Property 5: Accommodation Badge Rendering
   * **Validates: Requirements 2.2, 2.3**
   *
   * For any participant data object, the rendered UI should display a green badge
   * when accommodation data exists and a red badge when accommodation data is null or absent.
   */
  it("Property 5: should display green badge when accommodation exists", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          college: fc.string({ minLength: 1, maxLength: 100 }),
          events: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
          workshops: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
          accommodation: fc.record({
            hasAccommodation: fc.constant(true),
            fromDate: fc.constantFrom("2026-03-06", "2026-03-07", "2026-03-08"),
            toDate: fc.constantFrom("2026-03-06", "2026-03-07", "2026-03-08"),
            type: fc.constantFrom("Boys", "Girls", "Other") as fc.Arbitrary<
              "Boys" | "Girls" | "Other"
            >,
            notes: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
          }),
        }),
        (participantData) => {
          const participant: ParticipantData =
            participantData as ParticipantData;

          const { container } = render(
            <ResultsDisplay participant={participant} />,
          );

          // Assert: Green badge (success) should be displayed
          expect(
            screen.getByText(/accommodation confirmed/i),
          ).toBeInTheDocument();

          // Assert: Green badge styling should be present
          const badge = screen
            .getByText(/accommodation confirmed/i)
            .closest("div");
          expect(badge?.className).toContain("bg-success-50");
          expect(badge?.className).toContain("border-success-500");

          // Assert: Dates should be displayed
          const fromDate = new Date(
            participant.accommodation!.fromDate,
          ).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          const toDate = new Date(
            participant.accommodation!.toDate,
          ).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          expect(
            screen.getByText(new RegExp(`${fromDate}.*${toDate}`, "i")),
          ).toBeInTheDocument();

          // Assert: Type should be displayed
          expect(
            screen.getByText(
              new RegExp(`Type:.*${participant.accommodation!.type}`, "i"),
            ),
          ).toBeInTheDocument();

          // Cleanup
          container.remove();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("Property 5: should display red badge when accommodation is null", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          college: fc.string({ minLength: 1, maxLength: 100 }),
          events: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
          workshops: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
        }),
        (participantData) => {
          const participant: ParticipantData = {
            ...participantData,
            accommodation: null,
          };

          const { container } = render(
            <ResultsDisplay participant={participant} />,
          );

          // Assert: Red badge (error) should be displayed
          expect(screen.getByText(/no accommodation/i)).toBeInTheDocument();

          // Assert: Red badge styling should be present
          const badge = screen.getByText(/no accommodation/i).closest("div");
          expect(badge?.className).toContain("bg-error-50");
          expect(badge?.className).toContain("border-error-500");

          // Assert: No dates should be displayed
          expect(screen.queryByText(/mar|march/i)).not.toBeInTheDocument();

          // Cleanup
          container.remove();
        },
      ),
      { numRuns: 50 },
    );
  });

  it("Property 5: should display red badge when accommodation.hasAccommodation is false", () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 100 }),
          email: fc.emailAddress(),
          college: fc.string({ minLength: 1, maxLength: 100 }),
          events: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
          workshops: fc.array(fc.string({ minLength: 1 }), { maxLength: 5 }),
          accommodation: fc.record({
            hasAccommodation: fc.constant(false),
            fromDate: fc.constantFrom("2026-03-06", "2026-03-07", "2026-03-08"),
            toDate: fc.constantFrom("2026-03-06", "2026-03-07", "2026-03-08"),
            type: fc.constantFrom("Boys", "Girls", "Other") as fc.Arbitrary<
              "Boys" | "Girls" | "Other"
            >,
          }),
        }),
        (participantData) => {
          const participant: ParticipantData =
            participantData as ParticipantData;

          const { container } = render(
            <ResultsDisplay participant={participant} />,
          );

          // Assert: Red badge should be displayed even if accommodation object exists
          expect(screen.getByText(/no accommodation/i)).toBeInTheDocument();

          // Assert: Red badge styling should be present
          const badge = screen.getByText(/no accommodation/i).closest("div");
          expect(badge?.className).toContain("bg-error-50");
          expect(badge?.className).toContain("border-error-500");

          // Cleanup
          container.remove();
        },
      ),
      { numRuns: 30 },
    );
  });
});
