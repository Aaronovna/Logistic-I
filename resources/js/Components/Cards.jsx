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

export const Card2 = ({ data, Icon = TbFavicon, iconColor = 'black', name = 'Name', className = '' }) => {
  const { theme } = useStateContext();
  return (
    <div className={'rounded-xl pl-4 py-4 pr-20 border-card shadow-md ' + className}
      style={{ borderColor: theme.border, color:theme.text }}
    >
      <div className="mb-4 w-fit p-2 rounded-xl">
        <Icon color={iconColor} size={32} />
      </div>
      <p className='text-sm font-medium'>{name}</p>
      <p className='font-medium text-3xl'>{data ? data : '-'}</p>
    </div>
  )
}