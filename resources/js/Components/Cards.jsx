export const Card = ({data, Icon, name}) => {
    return (
        <div className='flex rounded-xl py-3 px-4 items-center justify-between bg-[#EEF9FF] w-fit border-gray-300 border '>
            <span className='flex justify-center items-center rounded-md p-2 aspect-square w-fit h-fit bg-[#004369] text-white'>
                <Icon size={32} title={name} />
            </span>
            <span className='ml-4'>
                <p className='font-semibold text-2xl text-right text-[#004369]'>{data ? data : '-'}</p>
                <p className='text-sm text-gray-400'>{name}</p>
            </span>
        </div>
    )
}

export const Card2 = ({data, Icon, name}) => {
    return (
        <div className='flex rounded-xl py-3 px-4 items-center justify-between bg-[#EEF9FF] w-fit border-gray-300 border '>
            <span className='flex justify-center items-center rounded-md p-2 aspect-square w-fit h-fit bg-[#004369] text-white'>
                <Icon size={32} title={name} />
            </span>
            <span className='ml-4'>
                <p className='font-semibold text-2xl text-right text-[#004369]'>{data ? data : '-'}</p>
                <p className='text-sm text-gray-400'>{name}</p>
            </span>
        </div>
    )
}