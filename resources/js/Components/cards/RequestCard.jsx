import React from "react";
import { dateTimeFormatLong } from "@/Constants/options";
import Status from "../Status";
import { requestStatus } from "@/Constants/status";

export default function RequestCard({ data = {} }) {
  // Basic statuses for requesting materials
  const statusSteps = [
    "Request Created", /* "Request Canceled",  */
    "Request Approved", /* "Request Rejected", */
    "Materials Fulfilled",
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
      className="border rounded-lg shadow-sm p-4 bg-background text-text hover:shadow-md transition cursor-pointer"
    >
      {/* Date */}
      <p className="text-sm text-neutral mb-1">
        {new Date(data.created_at).toLocaleString(undefined, dateTimeFormatLong)}
      </p>

      {/* Infrastructure Name */}
      <h3 className="text-lg font-semibold">
        {data.infrastructure_name || "No Infrastructure Name"}
      </h3>

      {/* Request Type */}
      <p className="text-sm text-neutral mt-2">
        Purpose: <span className="font-medium">{data.type || "N/A"}</span>
      </p>

      {/* User Name */}
      <p className="text-sm text-neutral mb-4">
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
                      ? "bg-accent"
                      : "bg-neutral"
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
