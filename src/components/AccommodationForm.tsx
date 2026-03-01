import React, { useState, useEffect } from "react";
import type { AccommodationFormData } from "../types";
import { VALID_DATES, VALID_TO_DATES, ACCOMMODATION_TYPES } from "../types";
import {
  validateEmail,
  validateDateRange,
  validateRequired,
} from "../utils/validation";

interface AccommodationFormProps {
  onSubmit: (data: AccommodationFormData) => Promise<void>;
  initialEmail?: string;
  isLoading?: boolean;
  onReset?: () => void;
  showResetButton?: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  fromDate?: string;
  toDate?: string;
  accommodationType?: string;
  dateRange?: string;
}

export const AccommodationForm: React.FC<AccommodationFormProps> = ({
  onSubmit,
  initialEmail,
  isLoading = false,
  onReset,
  showResetButton = false,
}) => {
  const [formData, setFormData] = useState<AccommodationFormData>({
    name: "",
    email: initialEmail || "",
    phone: "",
    college: "",
    fromDate: "",
    toDate: "",
    accommodationType: "Boys",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Update email when initialEmail changes
  useEffect(() => {
    if (initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const validateField = (
    name: keyof AccommodationFormData,
    value: string,
  ): string | undefined => {
    switch (name) {
      case "name":
      case "college":
        return !validateRequired(value) ? "This field is required" : undefined;

      case "email":
        if (!validateRequired(value)) return "Email is required";
        if (!validateEmail(value)) return "Invalid email format";
        return undefined;

      case "phone":
        if (!validateRequired(value)) return "Phone number is required";
        if (!/^\+?[0-9\s\-\(\)]{10,15}$/.test(value))
          return "Invalid phone number format";
        return undefined;

      case "fromDate":
      case "toDate":
        return !validateRequired(value) ? "Date is required" : undefined;

      case "accommodationType":
        return !validateRequired(value)
          ? "Accommodation type is required"
          : undefined;

      default:
        return undefined;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate all required fields
    newErrors.name = validateField("name", formData.name);
    newErrors.email = validateField("email", formData.email);
    newErrors.phone = validateField("phone", formData.phone);
    newErrors.college = validateField("college", formData.college);
    newErrors.fromDate = validateField("fromDate", formData.fromDate);
    newErrors.toDate = validateField("toDate", formData.toDate);
    newErrors.accommodationType = validateField(
      "accommodationType",
      formData.accommodationType,
    );

    // Validate date range
    if (formData.fromDate && formData.toDate) {
      if (!validateDateRange(formData.fromDate, formData.toDate)) {
        newErrors.dateRange = "From date must be before or equal to To date";
      }
    }

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field on change if already touched
    if (touched[name]) {
      const error = validateField(name as keyof AccommodationFormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));

      // Re-validate date range if dates change
      if (
        (name === "fromDate" || name === "toDate") &&
        formData.fromDate &&
        formData.toDate
      ) {
        const newFromDate = name === "fromDate" ? value : formData.fromDate;
        const newToDate = name === "toDate" ? value : formData.toDate;
        const dateRangeError = !validateDateRange(newFromDate, newToDate)
          ? "From date must be before or equal to To date"
          : undefined;
        setErrors((prev) => ({ ...prev, dateRange: dateRangeError }));
      }
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    const error = validateField(name as keyof AccommodationFormData, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      college: true,
      fromDate: true,
      toDate: true,
      accommodationType: true,
    });

    // Validate form
    if (validateForm()) {
      await onSubmit(formData);
    }
  };

  const handleReset = () => {
    // Reset form data
    setFormData({
      name: "",
      email: "",
      phone: "",
      college: "",
      fromDate: "",
      toDate: "",
      accommodationType: "Boys",
      notes: "",
    });

    // Reset touched fields
    setTouched({});

    // Reset errors
    setErrors({});

    // Call parent reset handler if provided
    if (onReset) {
      onReset();
    }
  };

  const getFieldError = (fieldName: keyof FormErrors): string | undefined => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Add Accommodation Entry
          </h2>
          {showResetButton && (
            <button
              onClick={handleReset}
              type="button"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset Form
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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
              aria-invalid={getFieldError("name") ? "true" : "false"}
              aria-describedby={
                getFieldError("name") ? "name-error" : undefined
              }
            />
            {getFieldError("name") && (
              <p
                id="name-error"
                className="mt-1 text-sm text-error-600"
                role="alert"
              >
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
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
              aria-invalid={getFieldError("email") ? "true" : "false"}
              aria-describedby={
                getFieldError("email") ? "email-error" : undefined
              }
            />
            {getFieldError("email") && (
              <p
                id="email-error"
                className="mt-1 text-sm text-error-600"
                role="alert"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
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
              aria-invalid={getFieldError("phone") ? "true" : "false"}
              aria-describedby={
                getFieldError("phone") ? "phone-error" : undefined
              }
            />
            {getFieldError("phone") && (
              <p
                id="phone-error"
                className="mt-1 text-sm text-error-600"
                role="alert"
              >
                {errors.phone}
              </p>
            )}
          </div>

          {/* College */}
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
              aria-invalid={getFieldError("college") ? "true" : "false"}
              aria-describedby={
                getFieldError("college") ? "college-error" : undefined
              }
            />
            {getFieldError("college") && (
              <p
                id="college-error"
                className="mt-1 text-sm text-error-600"
                role="alert"
              >
                {errors.college}
              </p>
            )}
          </div>

          {/* Date Range Error */}
          {errors.dateRange && touched.fromDate && touched.toDate && (
            <div className="p-3 bg-error-50 border border-error-500 rounded-lg">
              <p className="text-sm text-error-700" role="alert">
                {errors.dateRange}
              </p>
            </div>
          )}

          {/* Dates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* From Date */}
            <div>
              <label
                htmlFor="fromDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                From Date <span className="text-error-500">*</span>
              </label>
              <select
                id="fromDate"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  getFieldError("fromDate")
                    ? "border-error-500 focus:ring-error-500"
                    : "border-gray-300 focus:ring-primary-500"
                } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                aria-invalid={getFieldError("fromDate") ? "true" : "false"}
                aria-describedby={
                  getFieldError("fromDate") ? "fromDate-error" : undefined
                }
              >
                <option value="">Select date</option>
                {VALID_DATES.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
              {getFieldError("fromDate") && (
                <p
                  id="fromDate-error"
                  className="mt-1 text-sm text-error-600"
                  role="alert"
                >
                  {errors.fromDate}
                </p>
              )}
            </div>

            {/* To Date */}
            <div>
              <label
                htmlFor="toDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                To Date <span className="text-error-500">*</span>
              </label>
              <select
                id="toDate"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                  getFieldError("toDate")
                    ? "border-error-500 focus:ring-error-500"
                    : "border-gray-300 focus:ring-primary-500"
                } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
                aria-invalid={getFieldError("toDate") ? "true" : "false"}
                aria-describedby={
                  getFieldError("toDate") ? "toDate-error" : undefined
                }
              >
                <option value="">Select date</option>
                {VALID_TO_DATES.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </option>
                ))}
              </select>
              {getFieldError("toDate") && (
                <p
                  id="toDate-error"
                  className="mt-1 text-sm text-error-600"
                  role="alert"
                >
                  {errors.toDate}
                </p>
              )}
            </div>
          </div>

          {/* Accommodation Type */}
          <div>
            <label
              htmlFor="accommodationType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Accommodation Type <span className="text-error-500">*</span>
            </label>
            <select
              id="accommodationType"
              name="accommodationType"
              value={formData.accommodationType}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isLoading}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                getFieldError("accommodationType")
                  ? "border-error-500 focus:ring-error-500"
                  : "border-gray-300 focus:ring-primary-500"
              } ${isLoading ? "bg-gray-100 cursor-not-allowed" : "bg-white"}`}
              aria-invalid={
                getFieldError("accommodationType") ? "true" : "false"
              }
              aria-describedby={
                getFieldError("accommodationType")
                  ? "accommodationType-error"
                  : undefined
              }
            >
              {ACCOMMODATION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {getFieldError("accommodationType") && (
              <p
                id="accommodationType-error"
                className="mt-1 text-sm text-error-600"
                role="alert"
              >
                {errors.accommodationType}
              </p>
            )}
          </div>

          {/* Notes */}
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

          {/* Submit Button */}
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
                "Add Accommodation"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
