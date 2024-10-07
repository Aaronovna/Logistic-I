import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Guest({ children }) {
  const { theme } = useStateContext();

  return (
    <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 bus-bg bg-cover" style={{ color: theme.accent }}>
      <div className="flex flex-col backdrop-blur-md bg-gray-200/65 rounded-3xl shad w-1/3 mt-10 pb-10">
        <Link href="/">
          <p className='font-semibold text-xl my-4 text-center'>NexFleet Dynamics</p>
        </Link>
        <hr className='border w-full' style={{ borderColor: theme.accent }} />
        <div className='self-center p-4 px-8 w-full'>
          {children}
        </div>
      </div>
    </div>
  );
}
