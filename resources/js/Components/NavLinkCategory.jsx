export default function ({routes = [], Icon, label = 'Label', href = '/', className}) {
    return (
        <a className={'flex relative my-1 w-full ' + className} href={route(href)}>
            <span className={'w-4 rounded-xl absolute -left-2 h-full ' + (routes.some(r => route().current(r))
                ? 'bg-[#004369] rounded-xl text-white '
                : 'text-[#004369] ')}>
            </span>
            <p className={
                ' ml-8 flex w-full p-1 rounded-xl font-semibold text-[#004369] ' +
                (routes.some(r => route().current(r)) ? 'bg-[#004369] text-white' : 'bg-[#d6ebf8]')}
            >
                <span className="flex items-center gap-1 text-lg px-1">
                    <Icon className='mr-1' />
                    {label}
                </span>
            </p>
        </a>
    )
}   