import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { AccommodationEntry, AccommodationFormData } from "../types";

interface DuplicateWarningModalProps {
  isOpen: boolean;
  existingEntry: Partial<AccommodationEntry>;
  newEntry: AccommodationFormData;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DuplicateWarningModal: React.FC<DuplicateWarningModalProps> = ({
  isOpen,
  existingEntry,
  newEntry,
  onConfirm,
  onCancel,
}) => {
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-warning-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-warning-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold text-gray-900"
                    >
                      Duplicate Entry Warning
                    </Dialog.Title>
                    <p className="text-sm text-gray-600 mt-1">
                      An accommodation entry already exists for this email
                    </p>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-6 space-y-6">
                  {/* Existing Entry */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-blue-900 uppercase tracking-wide mb-3">
                      Existing Entry
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-blue-700">
                          Name:
                        </dt>
                        <dd className="text-sm text-blue-900">
                          {existingEntry.name || "N/A"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-blue-700">
                          Email:
                        </dt>
                        <dd className="text-sm text-blue-900">
                          {existingEntry.email || "N/A"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-blue-700">
                          College:
                        </dt>
                        <dd className="text-sm text-blue-900">
                          {existingEntry.college || "N/A"}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-blue-700">
                          Dates:
                        </dt>
                        <dd className="text-sm text-blue-900">
                          {formatDate(existingEntry.fromDate)} -{" "}
                          {formatDate(existingEntry.toDate)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-blue-700">
                          Type:
                        </dt>
                        <dd className="text-sm text-blue-900">
                          {existingEntry.accommodationType || "N/A"}
                        </dd>
                      </div>
                      {existingEntry.notes && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-blue-700">
                            Notes:
                          </dt>
                          <dd className="text-sm text-blue-900">
                            {existingEntry.notes}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* New Entry */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-green-900 uppercase tracking-wide mb-3">
                      New Entry (To Be Added)
                    </h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-green-700">
                          Name:
                        </dt>
                        <dd className="text-sm text-green-900">
                          {newEntry.name}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-green-700">
                          Email:
                        </dt>
                        <dd className="text-sm text-green-900">
                          {newEntry.email}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-green-700">
                          College:
                        </dt>
                        <dd className="text-sm text-green-900">
                          {newEntry.college}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-green-700">
                          Dates:
                        </dt>
                        <dd className="text-sm text-green-900">
                          {formatDate(newEntry.fromDate)} -{" "}
                          {formatDate(newEntry.toDate)}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-green-700">
                          Type:
                        </dt>
                        <dd className="text-sm text-green-900">
                          {newEntry.accommodationType}
                        </dd>
                      </div>
                      {newEntry.notes && (
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-green-700">
                            Notes:
                          </dt>
                          <dd className="text-sm text-green-900">
                            {newEntry.notes}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Warning Message */}
                  <div className="bg-warning-50 border-l-4 border-warning-500 p-4">
                    <p className="text-sm text-warning-800">
                      <strong>Warning:</strong> Confirming will create a
                      duplicate entry for the same email address. This may cause
                      confusion. Are you sure you want to proceed?
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onConfirm}
                    className="px-4 py-2 text-sm font-medium text-white bg-warning-600 rounded-lg hover:bg-warning-700 focus:outline-none focus:ring-2 focus:ring-warning-500 focus:ring-offset-2 transition-colors"
                  >
                    Confirm & Add Anyway
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
