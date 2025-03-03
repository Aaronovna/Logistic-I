import React, { useState } from "react";
import { TbChevronDown, TbChevronUp } from "react-icons/tb";
import { useStateContext } from "@/context/contextProvider";
import { dateTimeFormatShort } from "@/Constants/options";

const RequestsFolder = ({ total = 0, children, name = "Folder Name" }) => {
  const [isExpand, setIsExpand] = useState(false);

  return (
    <div className="relative w-full text-text">
      {/* Folder Header */}
      <div
        className="border rounded-lg p-4 flex items-center cursor-pointer select-none hover:shadow-md transition"
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
            className="text-sm text-neutral"
          >
            {total} {total === 1 ? "Request" : "Requests"}
          </p>
        </div>

        {/* Toggle Icon */}
        {isExpand ? (
          <TbChevronUp size={24} className="text-neutral" />
        ) : (
          <TbChevronDown size={24} className="text-neutral" />
        )}
      </div>

      {/* Folder Content */}
      {isExpand && (
        <div className="absolute bg-background border rounded-lg shadow-lg p-4 mt-2 w-full max-h-60 overflow-y-auto z-10">
          {total ? (
            children
          ) : (
            <p className="text-sm text-neutral text-center">No Requests</p>
          )}
        </div>
      )}
    </div>
  );
};

const Request = ({ request, onClick = () => {} }) => {

  const initial = request?.infrastructure_name?.charAt(0)?.toUpperCase() || "N";

  return (
    <div
      className="flex items-center px-2 py-1 hover:bg-hbg rounded-lg transition cursor-pointer text-text"
      onClick={onClick}
    >
      {/* Request Type Initial Icon */}
      <div
        className="w-5 h-5 text-sm flex items-center justify-center rounded-full bg-neutral font-light mr-2"
      >
        {initial}
      </div>

      {/* Request Info */}
      <p className="flex-1 text-sm text-neutral overflow-hidden text-ellipsis whitespace-nowrap">
        {`${new Date(request.created_at).toLocaleDateString(undefined, dateTimeFormatShort)}`}{" "}
        | <span className="font-medium">{request.infrastructure_name}</span>
      </p>
    </div>
  );
};

RequestsFolder.Request = Request;

export default RequestsFolder;
