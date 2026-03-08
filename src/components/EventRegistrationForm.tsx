import React, { useState } from "react";
import { registerEvent, registerWorkshop } from "../services/api";

// Available workshops and events
const WORKSHOPS = [
  "UI/UX",
  "Quantum Computing",
  "Building AI with MongoDB",
  "Cybersecurity & Ethical Hacking",
  "Data Structures & Algorithms",
  "Agentic & Generative AI",
  "Software Development",
  "Web Development",
  "Security of Agentic AI",
];

const EVENTS = [
  "Linked",
  "Numpy",
  "Webbed",
  "Summer Internship",
  "Vortex Quizbits",
  "What the figma",
  "Poster Presentation",
  "Code Combat",
  "Debug the code",
  "BIS",
];

interface EventRegistrationFormData {
  name: string;
  email: string;
  phone: string;
  eventType: "event" | "workshop";
  selectedItems: string[];
  teamName?: string;
  paymentStatus: "Paid" | "Pending" | "Waived";
  notes?: string;
}

interface EventRegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  registrationType?: "event" | "workshop";
  initialEmail?: string;
  initialName?: string;
  initialPhone?: string;
  initialCollege?: string;
}

export const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  onSuccess,
  onError,
  registrationType = "event",
  initialEmail = "",
  initialName = "",
  initialPhone = "",
  initialCollege = "",
}) => {
  const [formData, setFormData] = useState<EventRegistrationFormData>({
    name: initialName,
    email: initialEmail,
    phone: initialPhone,
    eventType: registrationType, // Keep for backward compatibility but use registrationType prop
    selectedItems: [],
    teamName: "",
    paymentStatus: "Pending",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateField = (name: string, value: any): string | undefined => {
    switch (name) {
      case "name":
        return !value.trim() ? "This field is required" : undefined;

      case "selectedItems":
        return !value || value.length === 0
          ? "Please select at least one item"
          : undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return undefined;

      case "phone":
        if (!value.trim()) return "Phone number is required";
        if (!/^\+?[0-9\s\-\(\)]{10,15}$/.test(value))
          return "Invalid phone number format";
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error || "" }));
    }
  };

  const handleItemToggle = (item: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedItems.includes(item);
      const newSelectedItems = isSelected
        ? prev.selectedItems.filter((i) => i !== item)
        : [...prev.selectedItems, item];

      return { ...prev, selectedItems: newSelectedItems };
    });

    if (touched.selectedItems) {
      const newSelectedItems = formData.selectedItems.includes(item)
        ? formData.selectedItems.filter((i) => i !== item)
        : [...formData.selectedItems, item];
      const error = validateField("selectedItems", newSelectedItems);
      setErrors((prev) => ({ ...prev, selectedItems: error || "" }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error || "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);

    const newTouched: Record<string, boolean> = {
      name: true,
      email: true,
      phone: true,
      selectedItems: true,
    };
    setTouched(newTouched);

    const newErrors: Record<string, string> = {};
    newErrors.name = validateField("name", formData.name) || "";
    newErrors.email = validateField("email", formData.email) || "";
    newErrors.phone = validateField("phone", formData.phone) || "";
    newErrors.selectedItems =
      validateField("selectedItems", formData.selectedItems) || "";

    // Remove empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        // Register all selected items in a single request
        if (registrationType === "event") {
          const eventData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            eventNames: formData.selectedItems,
            teamName: formData.teamName || undefined,
            paymentStatus: formData.paymentStatus,
            notes: formData.notes || undefined,
            force: false,
          };
          await registerEvent(eventData);
        } else {
          const workshopData = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            workshopNames: formData.selectedItems,
            paymentStatus: formData.paymentStatus,
            notes: formData.notes || undefined,
            force: false,
          };
          await registerWorkshop(workshopData);
        }

        setSuccessMessage("Successfully registered!");

        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          eventType: registrationType,
          selectedItems: [],
          teamName: "",
          paymentStatus: "Pending",
          notes: "",
        });
        setTouched({});
        setErrors({});

        if (onSuccess) onSuccess();
      } catch (error: any) {
        console.error("Registration error:", error);
        if (onError) onError(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Register for {registrationType === "event" ? "Events" : "Workshops"}
        </h2>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-error-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("name")
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            />
            {getFieldError("name") && (
              <p className="mt-1 text-sm text-error-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email <span className="text-error-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("email")
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            />
            {getFieldError("email") && (
              <p className="mt-1 text-sm text-error-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number <span className="text-error-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder="+91 9876543210"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("phone")
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            />
            {getFieldError("phone") && (
              <p className="mt-1 text-sm text-error-600">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select {registrationType === "event" ? "Events" : "Workshops"}{" "}
              <span className="text-error-500">*</span>
            </label>
            <div
              className={`border rounded-lg p-4 max-h-64 overflow-y-auto ${
                getFieldError("selectedItems")
                  ? "border-error-500"
                  : "border-gray-300"
              } ${isLoading ? "bg-gray-100" : "bg-white"}`}
            >
              <div className="space-y-2">
                {(registrationType === "event" ? EVENTS : WORKSHOPS).map(
                  (item) => (
                    <label
                      key={item}
                      className={`flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer ${
                        isLoading ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedItems.includes(item)}
                        onChange={() => handleItemToggle(item)}
                        disabled={isLoading}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="ml-3 text-sm text-gray-700">{item}</span>
                    </label>
                  ),
                )}
              </div>
            </div>
            {formData.selectedItems.length > 0 && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {formData.selectedItems.length} In Total
                {/* {formData.selectedItems.length > 1 ? "s" : ""} */}
              </p>
            )}
            {getFieldError("selectedItems") && (
              <p className="mt-1 text-sm text-error-600">
                {errors.selectedItems}
              </p>
            )}
          </div>

          {registrationType === "event" && (
            <div>
              <label
                htmlFor="teamName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Team Name (Optional)
              </label>
              <input
                id="teamName"
                name="teamName"
                type="text"
                value={formData.teamName}
                onChange={handleChange}
                disabled={isLoading}
                placeholder="Enter team name if applicable"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 focus:ring-primary-500 ${
                  isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                }`}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="paymentStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Payment Status <span className="text-error-500">*</span>
            </label>
            <select
              id="paymentStatus"
              name="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 focus:ring-primary-500 ${
                isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Waived">Waived</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              disabled={isLoading}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 focus:ring-primary-500 ${
                isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
              placeholder="Additional information..."
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Register"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
