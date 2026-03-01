import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar, NavSection } from "./Navbar";

describe("Navbar", () => {
  it("renders all navigation items", () => {
    const mockOnSectionChange = vi.fn();
    render(
      <Navbar activeSection="search" onSectionChange={mockOnSectionChange} />,
    );

    expect(screen.getByText(/Search Participant/i)).toBeInTheDocument();
    expect(screen.getByText(/Accommodation/i)).toBeInTheDocument();
    expect(screen.getByText(/Events & Workshops/i)).toBeInTheDocument();
  });

  it("highlights the active section", () => {
    const mockOnSectionChange = vi.fn();
    render(
      <Navbar
        activeSection="accommodation"
        onSectionChange={mockOnSectionChange}
      />,
    );

    const accommodationButton = screen.getByRole("button", {
      name: /Accommodation/i,
    });
    expect(accommodationButton).toHaveClass("bg-primary-600");
  });

  it("calls onSectionChange when a nav item is clicked", () => {
    const mockOnSectionChange = vi.fn();
    render(
      <Navbar activeSection="search" onSectionChange={mockOnSectionChange} />,
    );

    const eventsButton = screen.getByRole("button", {
      name: /Events & Workshops/i,
    });
    fireEvent.click(eventsButton);

    expect(mockOnSectionChange).toHaveBeenCalledWith("events");
  });

  it("applies correct aria-current attribute to active section", () => {
    const mockOnSectionChange = vi.fn();
    render(
      <Navbar activeSection="search" onSectionChange={mockOnSectionChange} />,
    );

    const searchButton = screen.getByRole("button", {
      name: /Search Participant/i,
    });
    expect(searchButton).toHaveAttribute("aria-current", "page");
  });
});
