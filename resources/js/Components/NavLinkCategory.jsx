import { useStateContext } from "@/context/contextProvider"
import { Link } from '@inertiajs/react';

export default function ({routes = [], Icon, label = 'Label', href = '/', className}) {
    const {theme} = useStateContext();

    const flatRoutes = routes.flatMap(link => 
        Array.isArray(link.name) ? link.name : [link.name]
    );

    return (
        <Link className={'flex relative my-1 w-full ' + className} href={route(href)}>
            <span className={'w-4 rounded-xl absolute -left-2 h-full'}
            style={
                flatRoutes.some(r => route().current(r)) 
                ? { backgroundColor: theme.accent, color: theme.background } 
                : { color: theme.accent }
            }
        >
            </span>
            <p className={'ml-8 flex w-full p-1 rounded-xl font-semibold outline outline-1'}
            style={{
                color: theme.text,
                backgroundColor: flatRoutes.some(r => route().current(r))
                  ? theme.accent
                  : theme.background,
                outlineColor: theme.border,
                ...(flatRoutes.some(r => route().current(r)) && { color: theme.background })
              }}
            >
                <span className="flex items-center gap-1 text-lg px-1 font-medium">
                    <Icon className='mr-1' />
                    {label}
                </span>
            </p>
        </Link>
    )
}   