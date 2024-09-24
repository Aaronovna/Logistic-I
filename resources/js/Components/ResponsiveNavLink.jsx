import { Link } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    const { theme } = useStateContext();
    return (
        <Link
            {...props}
            style={{color: active ? theme.background : theme.text , background: active ? theme.accent : null}}
            className={`w-full flex items-start p-2 text-base font-medium focus:outline-none transition duration-150 ease-in-out ${className}`}
        >
            {children}
        </Link>
    );
}
