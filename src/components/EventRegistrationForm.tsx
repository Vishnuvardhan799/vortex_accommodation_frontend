import React, { useState } from "react";

interface EventRegistrationFormData {
  name: string;
  email: string;
  phone: string;
  college: string;
  eventType: "event" | "workshop";
  eventName: string;
  notes?: string;
}

interface EventRegistrationFormProps {
  onSubmit: (data: EventRegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

export const EventRegistrationForm: React.FC<EventRegistrationFormProps> = ({
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<EventRegistrationFormData>({
    name: "",
    email: "",
    phone: "",
    college: "",
    eventType: "event",
    eventName: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
      case "college":
      case "eventName":
        return !value.trim() ? "This field is required" : undefined;

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

    const newTouched: Record<string, boolean> = {
      name: true,
      email: true,
      phone: true,
      college: true,
      eventName: true,
    };
    setTouched(newTouched);

    const newErrors: Record<string, string> = {};
    Object.keys(newTouched).forEach((key) => {
      const error = validateField(
        key,
        formData[key as keyof EventRegistrationFormData] as string,
      );
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await onSubmit(formData);
    }
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Register for Event or Workshop
        </h2>

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
            <label
              htmlFor="college"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              College <span className="text-error-500">*</span>
            </label>
            <input
              id="college"
              name="college"
              type="text"
              value={formData.college}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("college")
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            />
            {getFieldError("college") && (
              <p className="mt-1 text-sm text-error-600">{errors.college}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="eventType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Registration Type <span className="text-error-500">*</span>
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors border-gray-300 focus:ring-primary-500 ${
                isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"
              }`}
            >
              <option value="event">Event</option>
              <option value="workshop">Workshop</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="eventName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {formData.eventType === "event" ? "Event" : "Workshop"} Name{" "}
              <span className="text-error-500">*</span>
            </label>
            <input
              id="eventName"
              name="eventName"
              type="text"
              value={formData.eventName}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              placeholder={`Enter ${formData.eventType} name`}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("eventName")
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
            />
            {getFieldError("eventName") && (
              <p className="mt-1 text-sm text-error-600">{errors.eventName}</p>
            )}
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
