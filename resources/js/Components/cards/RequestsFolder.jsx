import React, { useState } from "react";

import { TbChevronDown } from "react-icons/tb";
import { TbChevronUp } from "react-icons/tb";
import { TbFileFilled } from "react-icons/tb";

import { useStateContext } from "@/context/contextProvider";

export default function RequestsFolder({ data = [], name = 'Name' }) {
  const [isExpand, setIsExpand] = useState(false);
  const { theme, themePreference } = useStateContext();

  return (
    <div style={{color: theme.text}}>
      <div className='border-card p-4 flex w-full items-center select-none cursor-pointer' style={{borderColor: theme.border}} onClick={() => setIsExpand(!isExpand)}>
        {isExpand
          ? <img src="../../assets/svgs/folder-open.svg" className='w-12' />
          : <img src="../../assets/svgs/folder.svg" className='w-12' />
        }

        <span className='px-4 mr-auto'>
          <p className='font-medium text-lg'>{name}</p>
          <p className={`${themePreference === 'light' ? 'text-black/50' : 'text-white/50' }`}>{`${data.length} Requests`}</p>
        </span>
        {isExpand
          ? <TbChevronDown size={24} />
          : <TbChevronUp size={24} />
        }
      </div>

      {isExpand ?
        <div className="p-2 duration-300 overflow-hidden ease-in-out transition-all">
          <div className="grid grid-cols-2">
            {data.length > 0
              ? data.map((request, index) => {
                return (
                  <span className="w-full flex items-center">
                    <TbFileFilled color={theme.accent}/>
                    <p key={index} className="ml-1 w-11/12 cursor-pointer text-ellipsis overflow-hidden font-light hover:underline">{request.name}</p>
                  </span>
                )
              })
              : <p>No Request</p>
            }
          </div>
        </div>
        : null
      }
    </div>
  )
}