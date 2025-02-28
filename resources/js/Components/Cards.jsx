import { useStateContext } from "@/context/contextProvider";

import { TbFavicon } from "react-icons/tb";
import { feedback } from "@/Constants/themes";

export const Card = ({ data, Icon = TbFavicon, iconColor = feedback.info, name = 'Name', className = '' }) => {
  const { theme, themePreference } = useStateContext();
  return (
    <div className={`flex rounded-xl py-3 px-4 items-end justify-between w-fit border shadow-md ` + className} style={{ borderColor: theme.border }}>
      <span className='flex justify-center items-center rounded-md aspect-square w-fit h-fit' style={{ color: theme.background }}>
        <Icon size={38} title={name} color={iconColor}/>
      </span>
      <span className='ml-4'>
        <p className={`text-sm ${themePreference === 'light' ? 'text-black/50' : 'text-white/50'}`}>{name}</p>
        <p className='font-semibold text-xl text-right' style={{ color: theme.text }}>{data ? data : '-'}</p>
      </span>
    </div>
  )
}

export const Card2 = ({ data, Icon, iconColor = 'black', name = 'Name', className = '' }) => {
  const { theme } = useStateContext();
  return (
    <div className={'rounded-xl pl-4 py-4 border-card shadow-md ' + className}
      style={{ borderColor: theme.border, color:theme.text }}
    >
      <div className="flex flex-col relative min-w-48 h-full">
        <p className='text-sm font-medium text-gray-600 mb-2'>{name}</p>
        <p className='font-medium text-3xl mt-auto mb-10'>{data ? data : '-'}</p>
        {Icon && <Icon color={iconColor} size={48} className="right-2 bottom-2 absolute"/>}
      </div>
    </div>
  )
}