import { useStateContext } from "@/context/contextProvider";
import { gradients } from "@/Constants/themes";

import { TbFavicon } from "react-icons/tb";

export const Card = ({ data, Icon, name }) => {
  const { theme, themePreference } = useStateContext();
  return (
    <div className='flex rounded-xl py-3 px-4 items-center justify-between w-fit border' style={{ background: theme.secondary, borderColor: theme.border }}>
      <span className='flex justify-center items-center rounded-md p-2 aspect-square w-fit h-fit' style={{ background: theme.accent, color: theme.background }}>
        <Icon size={32} title={name} />
      </span>
      <span className='ml-4'>
        <p className='font-semibold text-2xl text-right' style={{ color: theme.accent }}>{data ? data : '-'}</p>
        <p className={`text-sm ${themePreference === 'light' ? 'text-black/50' : 'text-white/50'}`}>{name}</p>
      </span>
    </div>
  )
}

export const Card2 = ({ data, Icon = TbFavicon, name = 'Name', className = '' }) => {
  const { theme } = useStateContext();
  return (
    <div className={'rounded-xl pl-4 py-4 pr-20 min-w-60 w-fit' + className}
      style={{ background: gradients.blue_raspberry, borderColor: theme.border }}
    >
      <div className="mb-4 w-fit p-2 rounded-xl" style={{ background: gradients.blue_raspberry }}>
        <Icon color={'white'} size={32} />
      </div>
      <p className='text-sm font-medium text-white/80'>{name}</p>
      <p className='font-medium text-3xl text-white'>{data ? data : '-'}</p>
    </div>
  )
}