import React from "react";
import { dateTimeFormatLong } from "@/Constants/options";
import Status from "../Status";
import { requestStatus } from "@/Constants/status";

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
      <p className="text-sm text-gray-600 mb-4">
        Request From: <span className="font-medium">{data.infrastructure_name || "Unknown"}</span>
      </p>

      <Status statusArray={requestStatus} status={data.status} className={`leading-normal text-sm whitespace-nowrap p-1 px-2 rounded-lg w-fit h-fit`}/>

      {/* Status Steps Visualization */}
      <div className="mt-4">
        <div className="flex items-center justify-center w-full gap-1">
          {statusSteps.map((status, index) => (
            <div key={status} className="flex-1">
              {index < statusSteps.length && (
                <div
                  className={`w-full h-1 ${
                    index  <= currentStatusIndex
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
