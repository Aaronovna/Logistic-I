import React, { useState } from "react";

import { useStateContext } from "@/context/contextProvider";

export default function Request({ data = {}, name = 'Name' }) {
  const { theme } = useStateContext();
  const [isExpand, setIsExpand] = useState(false);

  const [isHovered, setIsHovered] = useState(false);
  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return (
    <div>
      <div
        className='border-card p-2'
        style={{ background: isHovered ? theme.secondary : null, color: theme.text, borderColor: theme.border }}
        onClick={() => setIsExpand(!isExpand)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <p>{data.name}</p>
        <p>{data.date}</p>


        {/* {isExpand
          ? data.requested.map((item, index) => {
            return (
              <p key={index}>{item.name}</p>
            )
          })
          : null
        } */}
      </div>
    </div>
  )
}