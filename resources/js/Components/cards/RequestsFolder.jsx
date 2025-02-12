import React, { useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { useStateContext } from "@/context/contextProvider";
import { dateTimeFormatShort } from "@/Constants/options";

const RequestsFolder = ({ total = 0, children, name = "Folder Name" }) => {
  const [isExpand, setIsExpand] = useState(false);
  const { theme, themePreference } = useStateContext();

  return (
    <div className="relative w-full">
      {/* Folder Header */}
      <div
        className="border rounded-lg p-4 flex items-center cursor-pointer select-none hover:shadow-md transition"
        style={{ borderColor: theme.border, color: theme.text }}
        onClick={() => setIsExpand(!isExpand)}
      >
        {/* Folder Icon */}
        <img
          src={isExpand ? "../../assets/svgs/folder-open.svg" : "../../assets/svgs/folder.svg"}
          className="w-10 h-10 flex-shrink-0"
          alt="Folder Icon"
        />

        {/* Folder Info */}
        <div className="flex-1 px-4">
          <p className="text-lg font-medium">{name}</p>
          <p
            className={`text-sm ${themePreference === "light" ? "text-gray-500" : "text-gray-400"}`}
          >
            {total} {total === 1 ? "Request" : "Requests"}
          </p>
        </div>

        {/* Toggle Icon */}
        {isExpand ? (
          <TbChevronUp size={24} className="text-gray-600" />
        ) : (
          <TbChevronDown size={24} className="text-gray-600" />
        )}
      </div>

      {/* Folder Content */}
      {isExpand && (
        <div className="absolute bg-white border rounded-lg shadow-lg p-4 mt-2 w-full max-h-60 overflow-y-auto z-10">
          {total ? (
            children
          ) : (
            <p className="text-sm text-gray-500 text-center">No Requests</p>
          )}
        </div>
      )}
    </div>
  );
};

const Request = ({ request, onClick = () => {} }) => {
  const { theme } = useStateContext();

  // Get the first letter of the request type
  const initial = request?.infrastructure_name?.charAt(0)?.toUpperCase() || "N"; // Default to "N" for no type

  return (
    <div
      className="flex items-center px-2 py-1 hover:bg-gray-50 rounded-lg transition cursor-pointer"
      onClick={onClick}
    >
      {/* Request Type Initial Icon */}
      <div
        className="w-5 h-5 text-sm flex items-center justify-center rounded-full bg-gray-500 text-white font-light mr-2"
        style={{ backgroundColor: theme.accent }}
      >
        {initial}
      </div>

      {/* Request Info */}
      <p className="flex-1 text-sm text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap">
        {`${new Date(request.created_at).toLocaleDateString(undefined, dateTimeFormatShort)}`}{" "}
        | <span className="font-medium">{request.infrastructure_name}</span>
      </p>
    </div>
  );
};

RequestsFolder.Request = Request;

export default RequestsFolder;
