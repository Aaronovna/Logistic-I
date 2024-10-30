import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { Card2 } from '@/Components/Cards';
import { BusCard2 } from '@/Components/cards/BusCard';

import { TbSteeringWheel } from "react-icons/tb";
import { TbParking } from "react-icons/tb";
import { TbTool } from "react-icons/tb";
import { feedbackVibrant } from '@/Constants/themes';

export default function Depot({ auth }) {
  const { theme } = useStateContext();
  const { currentLocation, loading } = useCurrentLocation();

  const [query, setQuery] = useState('');

  const searchInMyLocation = async () => {
    if (!currentLocation) {
      console.warn('Current location is not available.');
      return; // Stop if location is not available
    }

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}`);
      setQuery(response.data.display_name);
    } catch (error) {
      console.error("Error getting address: ", error);
    }
  }

  useEffect(() => {
    if (!loading) {
      searchInMyLocation();
    }
  }, [loading, currentLocation]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Depot</h2>}
    >
      <Head title="Depot" />

      <div className="content">
        <div className='border-card p-4 shadow-sm mb-4 flex md:flex-row flex-col-reverse min-h-28'>
          <div className='flex flex-col w-full'>
            <p className='text-2xl font-semibold tracking-wider'>Depot Name</p>
            <p className='mt-auto text-ellipsis overflow-hidden whitespace-nowrap'>{query}</p>
          </div>
          <div className='md:ml-auto'>
            <select className='p-2 w-full md:w-auto' name="select_warehouse" id="select_warehouse">
              <option value="0">All Depot</option>
              <option value="1">Depot 1</option>
            </select>
          </div>
        </div>

        <div className='w-full flex md:flex-row flex-col-reverse gap-4'>

          <div className='md:w-4/5 w-full'>
            <div className='flex justify-between items-end mb-4'>
              <p className='font-semibold text-xl'>Buses</p>
              <span className='flex gap-2'>
                {/* <Link
                  className='ml-auto p-2 font-medium border-card'
                  style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
                  href={route('depot-maintenance')}
                >
                  Manage Maintenance
                </Link> */}
                <Link
                  className='ml-auto p-2 font-medium border-card'
                  style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
                  href={route('depot-inventory')}
                >
                  Manage Inventory
                </Link>
              </span>
            </div>

            <div className='w-full flex flex-wrap justify-start gap-x-5 gap-y-4 pb-4'>
              {Array.from({ length: 18 }, (_, index) => (
                <BusCard2 key={index} />
              ))}
            </div>
          </div>

          <div className='px-0 md:w-1/5 w-full'>
            <div className='flex md:flex-col flex-row overflow-auto gap-4'>
              <Card2 name='Dispatched' data={87} Icon={TbSteeringWheel} iconColor={feedbackVibrant.success} />
              <Card2 name='Standby' data={10} Icon={TbParking} iconColor={feedbackVibrant.info} />
              <Card2 name='Under Maintenance' data={3} Icon={TbTool} iconColor={feedbackVibrant.warning} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
