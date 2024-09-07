import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <div className='flex relative'>
            <Link
                {...props}
                className={
                    'ml-12 flex p-1 w-4/6 mb-1 rounded-xl ' +
                    (active
                        ? 'bg-[#BCE6FE] text-[#007ABE]  '
                        : 'bg-[#E7F6FF] text-[#004369] ') +
                    className
                }
            >
                {children}
            </Link>
        </div>
    );
}
