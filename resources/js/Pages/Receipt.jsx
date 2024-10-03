import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { gradients } from "@/Constants/themes";
import { Link } from '@inertiajs/react';

import { TbSearch } from "react-icons/tb";

const received = [1, 2, 3, 4, 5, 6];

export default function Receipt({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Receipt</h2>}
    >
      <Head title="Receipt" />

      <div className="content">
        <div className='relative rounded-xl p-4 flex h-44 overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl duration-200' style={{ background: gradients.evening_night }}>
          <div className='absolute log w-44 scale-150 top-1 right-10 h-full bg-no-repeat'></div>
          <div className='absolute w-full h-full top-0 left-0 hover-r-grd duration-150 hover:opacity-100 opacity-0 flex'>
            <p className='font-medium text-2xl text-white tracking-wide z-10 ml-auto mt-auto p-2 bg-black/50 rounded-tl-lg'>View Details</p>
          </div>
          <div className='flex flex-col'>
            <p className='font-semibold text-3xl text-white tracking-wider'>Upcoming Shipment</p>
            <p className='font-medium text-2xl text-white mt-auto'>Batch No. {`1232092724`}</p>
          </div>
        </div>

        <div className='mt-8 flex'>
          <p className='font-medium text-3xl' style={{ color: theme.text }}>Received Delivery</p>
          <Link
            className='ml-auto p-2 font-medium border-card'
            style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
            href={route('receipt-history')}
          >
            View History
          </Link>
        </div>

        <div className='mt-4'>
          <div className='w-full h-10 z-10 flex items-center mb-4' style={{ borderColor: theme.text }}>
            <span className='absolute'>
              <TbSearch size={24} color={theme.text} />
            </span>
            <input type="text" name="search_received" id="search_received" placeholder='Search ...'
              className='pl-8 bg-transparent border-none tracking-wide w-full' style={{ color: theme.text }}
            />
          </div>
          <div className='grid grid-cols-2 gap-4 overflow-y-scroll pr-2' style={{ height: '528px' }}>
            {received.map((item, index) => {
              return (
                <div key={index}
                  className='w-full border-card p-4 cursor-pointer hover:shadow-lg shadow-none shadow-gray-300 duration-200'
                  style={{ height: '256px', borderColor: theme.border, color: theme.text }}
                >
                  <p>Batch No. {item + 100000}</p>
                  <p>Supplier:xyc{item}</p>
                  <p>Fleet: fltvan{item}</p>
                  <p>Status: xxxxxxx</p>
                </div>
              )
            })}
          </div>

        </div>
        <div>

        </div>
      </div>
    </AuthenticatedLayout>
  );
}
