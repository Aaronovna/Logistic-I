import { useStateContext } from "@/context/contextProvider"

export default function ({routes = [], Icon, label = 'Label', href = '/', className}) {
    const {theme} = useStateContext();

    return (
        <a className={'flex relative my-1 w-full ' + className} href={route(href)}>
            <span className={'w-4 rounded-xl absolute -left-2 h-full'}
            style={
                routes.some(r => route().current(r)) 
                ? { backgroundColor: theme.accent, color: theme.background } 
                : { color: theme.accent }
            }
        >
            </span>
            <p className={'ml-8 flex w-full p-1 rounded-xl font-semibold'}
            style={{
                color: theme.accent,
                backgroundColor: routes.some(r => route().current(r))
                  ? theme.accent
                  : theme.secondary,
                ...(routes.some(r => route().current(r)) && { color: theme.background })
              }}
            >
                <span className="flex items-center gap-1 text-lg px-1">
                    <Icon className='mr-1' />
                    {label}
                </span>
            </p>
        </a>
    )
}   