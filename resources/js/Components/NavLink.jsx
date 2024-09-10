import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <div className='flex relative'>
            <Link
                {...props}
                className={
                    'ml-8 flex p-1 w-full rounded-xl ' +
                    (active
                        ? ' text-[#007ABE] outline-card'
                        : ' text-[#004369] ') +
                    className
                }
            >
                {children}
            </Link>
        </div>
    );
}
