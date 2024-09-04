import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <div className='flex relative'>
            <Link
                {...props}
                className={
                    'ml-10 flex p-2 w-3/5 my-1 rounded-xl ' +
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
