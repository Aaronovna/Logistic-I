import React from "react";
import { dateTimeFormatLong } from "@/Constants/options";

export default function RequestCard({ data = {} }) {
  // Basic statuses for requesting materials
  const statusSteps = [
    "Request Created", /* "Request Canceled",  */
    "Request Approved", /* "Request Rejected", */
    "Materials Procured",
    "Preparing for Delivery",
    "In Transit",
    "Delivered",
    "Completed",
  ];

  // Get the current status and its index
  const currentStatus = data.status || "Unknown";
  const currentStatusIndex = statusSteps.indexOf(currentStatus);

  return (
    <div
      className="border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition cursor-pointer"
    >
      {/* Date */}
      <p className="text-sm text-gray-500 mb-1">
        {new Date(data.created_at).toLocaleString(undefined, dateTimeFormatLong)}
      </p>

      {/* Infrastructure Name */}
      <h3 className="text-lg font-semibold text-gray-800">
        {data.infrastructure_name || "No Infrastructure Name"}
      </h3>

      {/* Request Type */}
      <p className="text-sm text-gray-600 mt-2">
        Purpose: <span className="font-medium">{data.type || "N/A"}</span>
      </p>

      {/* User Name */}
      <p className="text-sm text-gray-600">
        Requested By: <span className="font-medium">{data.user_name || "Unknown"}</span>
      </p>

      {/* Status */}
      <p className="text-sm text-gray-600 mt-2">
        Status: <span className="font-medium">{currentStatus}</span>
      </p>

      {/* Status Steps Visualization */}
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Progress:</p>
        <div className="flex items-center justify-center">
          {statusSteps.map((status, index) => (
            <div key={status} className="flex items-center">
              <div
                className={`w-6 h-6 rounded-full text-xs flex items-center justify-center ${
                  index <= currentStatusIndex
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {index + 1}
              </div>
              {index < statusSteps.length - 1 && (
                <div
                  className={`w-6 h-1 ${
                    index < currentStatusIndex
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
