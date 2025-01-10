import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import ReceiptCard from '@/Components/cards/ReceiptCard';

import { useStateContext } from '@/context/contextProvider';
import { gradients } from "@/Constants/themes";
import { Link } from '@inertiajs/react';

import { TbSearch } from "react-icons/tb";

const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

export default function Receipt({ auth }) {
  const { theme, ordersDummyData } = useStateContext();
  const [OFD, setOFD] = useState([]);
  const [RD, setRD] = useState([]);

  useEffect(() => {
    setOFD(filterOrdersByStatuses(ordersDummyData, ['Out for Delivery']));
    setRD(filterOrdersByStatuses(ordersDummyData, ['Delivered', 'Checking','Checked',]));
  }, [ordersDummyData])

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Receipt</h2>}
    >
      <Head title="Receipt" />

      <div className="content">
        <div
          className='relative rounded-xl p-4 flex h-44 overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl duration-200'
          style={{ background: gradients.evening_night }}
        >
          <div className='absolute log w-44 scale-150 top-1 right-10 h-full bg-no-repeat'></div>
          <div className='absolute w-full h-full top-0 left-0 hover-r-grd duration-150 hover:opacity-100 opacity-0 flex'>
            <p className='font-medium text-2xl text-white tracking-wide z-10 ml-auto mt-auto p-2 bg-black/50 rounded-tl-lg'>View Details</p>
          </div>
          <div className='flex flex-col'>
            <p className='font-semibold text-3xl text-white tracking-wider'>
              {`${OFD.length === 0 ? `No Upcoming Shipment` : `Upcoming Shipment`}`}
              <sup className='text-lg font-semibold'>{`${OFD.length <= 1 ? `` : ` +${OFD.length - 1}`}`}</sup>
            </p>
            {OFD.length === 0
              ? null
              : <p className='font-medium text-2xl text-white mt-auto'>Batch No. {OFD[0]?.id}</p>
            }
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
            {RD?.map((data, index) => {
              return (
                <ReceiptCard data={data} key={index} />
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
