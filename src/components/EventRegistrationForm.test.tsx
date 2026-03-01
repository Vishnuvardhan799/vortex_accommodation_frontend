import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventRegistrationForm } from "./EventRegistrationForm";

describe("EventRegistrationForm", () => {
  it("renders all form fields", () => {
    const mockOnSubmit = vi.fn();
    render(<EventRegistrationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/College/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Registration Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Notes/i)).toBeInTheDocument();
  });

  it("validates required fields on submit", async () => {
    const mockOnSubmit = vi.fn();
    render(<EventRegistrationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole("button", { name: /Register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getAllByText(/This field is required/i).length,
      ).toBeGreaterThan(0);
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("validates email format", async () => {
    const mockOnSubmit = vi.fn();
    render(<EventRegistrationForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Invalid email format/i)).toBeInTheDocument();
    });
  });

  it("submits form with valid data", async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EventRegistrationForm onSubmit={mockOnSubmit} />);

    fireEvent.change(screen.getByLabelText(/Name/i), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: "+91 9876543210" },
    });
    fireEvent.change(screen.getByLabelText(/College/i), {
      target: { value: "NIT Trichy" },
    });
    fireEvent.change(screen.getByLabelText(/Event Name/i), {
      target: { value: "Hackathon" },
    });

    const submitButton = screen.getByRole("button", { name: /Register/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
        phone: "+91 9876543210",
        college: "NIT Trichy",
        eventType: "event",
        eventName: "Hackathon",
        notes: "",
      });
    });
  });

  it("changes label based on event type selection", () => {
    const mockOnSubmit = vi.fn();
    render(<EventRegistrationForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/Event Name/i)).toBeInTheDocument();

    const eventTypeSelect = screen.getByLabelText(/Registration Type/i);
    fireEvent.change(eventTypeSelect, { target: { value: "workshop" } });

    expect(screen.getByLabelText(/Workshop Name/i)).toBeInTheDocument();
  });

  it("disables form when loading", () => {
    const mockOnSubmit = vi.fn();
    render(<EventRegistrationForm onSubmit={mockOnSubmit} isLoading={true} />);

    expect(screen.getByLabelText(/Name/i)).toBeDisabled();
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
    expect(screen.getByRole("button", { name: /Submitting/i })).toBeDisabled();
  });
});
