import { Link } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';

export default function NavLink({ active = false, className = '', children, ...props }) {
    const { theme } = useStateContext();
    return (
        <div className='flex relative'>
            <Link
                {...props}
                className={'ml-10 flex p-1 w-full rounded-xl font- ' + (active ? null : null) + className }
                style={active ? { color: theme.primary } : { color: theme.text }}
            >
                {children}
            </Link>
        </div>
    );
}
