import React from "react";
import { useStateContext } from "@/context/contextProvider";
import { feedbackLight } from "@/Constants/themes";

import { TbTruckLoading } from "react-icons/tb";
import { TbTruckDelivery } from "react-icons/tb";
import { TbClipboardList } from "react-icons/tb";
import { TbCircleCheck } from "react-icons/tb";
import { TbCircleX } from "react-icons/tb";
import { TbClipboardCheck } from "react-icons/tb";

const ReceiptCard = ({ data = {} }) => {
  const { theme } = useStateContext();
  return (
    <div
      className="relative w-full border-card p-4 cursor-pointer hover:shadow-lg shadow-none shadow-gray-300 duration-200 overflow-hidden h-32"
      style={{ borderColor: theme.border, color: theme.text }}
    >
      <div className="relative z-10">
        <p className="font-semibold text-lg">{data.id}</p>
        <p className="text-lg">{data.supplier}</p>
        <p>{data.fleet}</p>
        <p className="font-semibold text-lg">{data.status}</p>
      </div>


      {
        data.status === "Delivered" ?
          <div className="absolute -bottom-10 -right-12 z-0 opacity-65 rounded-full border-[8px] p-4" style={{ borderColor: feedbackLight.info }}>
            <TbTruckLoading size={96} color={feedbackLight.info} />
          </div>
          : null
      }
      {
        data.status === "Checking" ?
          <div className="absolute -bottom-10 -right-12 z-0 opacity-65 rounded-full border-[8px] p-4" style={{ borderColor: '#c8b3f4' }}>
            <TbClipboardList size={96} color='#c8b3f4' />
          </div>
          : null
      }
      {
        data.status === "Checked" ?
          <div className="absolute -bottom-10 -right-12 z-0 opacity-65 rounded-full border-[8px] p-4" style={{ borderColor: feedbackLight.success }}>
            <TbClipboardCheck size={96} color={feedbackLight.success} />
          </div>
          : null
      }
    </div>

  )
}

export default ReceiptCard;