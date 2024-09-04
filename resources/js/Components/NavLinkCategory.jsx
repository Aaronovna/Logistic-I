export default function ({routes = [], Icon, label = 'Label', href = '/', className}) {
    return (
        <a className={'flex relative mb-2 ' + className} href={route(href)}>
            <span className={'w-4 rounded-xl absolute -left-2 h-full ' + (routes.some(r => route().current(r))
                ? 'bg-[#004369] rounded-xl text-white '
                : 'text-[#004369] ')}>
            </span>
            <p className={
                ' ml-10 flex p-2 w-full rounded-xl font-semibold text-[#004369] ' +
                (routes.some(r => route().current(r)) ? 'bg-[#004369] text-white' : 'bg-[#E7F6FF]')}
            >
                <Icon className='mr-1' />
                {label}
            </p>
        </a>
    )
}