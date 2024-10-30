import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { useCurrentLocation } from '@/hooks/useCurrentLocation';
import { Card2 } from '@/Components/Cards';
import BusCard from '@/Components/cards/BusCard';

import { TbBus } from "react-icons/tb";
import { TbMapPin } from "react-icons/tb";
import { TbCircleOff } from "react-icons/tb";
import { feedbackVibrant } from '@/Constants/themes';

export default function Terminal({ auth }) {
  const { theme } = useStateContext();
  const { currentLocation, loading } = useCurrentLocation();

  const [query, setQuery] = useState('');

  const searchInMyLocation = async () => {
    if (!currentLocation) {
      console.warn('Current location is not available.');
      return;
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
      header={<h2 className="header" style={{ color: theme.text }}>Terminal</h2>}
    >
      <Head title="Terminal" />

      <div className="content">
        <div className='border-card p-4 shadow-sm mb-4 flex md:flex-row flex-col-reverse min-h-28'>
          <div className='flex flex-col w-full'>
            <p className='text-2xl font-semibold tracking-wider'>Terminal Name</p>
            <p className='mt-auto text-ellipsis overflow-hidden whitespace-nowrap'>{query}</p>
          </div>
          <div className='md:ml-auto'>
            <select className='p-2 w-full md:w-auto' name="select_warehouse" id="select_warehouse">
              <option value="0">All Terminal</option>
              <option value="1">Terminal 1</option>
            </select>
          </div>
        </div>

        <div className='w-full flex md:flex-row flex-col-reverse gap-4'>

          <div className='md:w-4/5 w-full'>
            <div className='flex justify-between items-end mb-4'>
              <p className='font-semibold text-xl'>Terminal's Buses</p>
              <Link
                className='ml-auto p-2 font-medium border-card'
                style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
                href={route('terminal-request')}
              >
                Request
              </Link>
            </div>
            <div className='w-full grid gap-4 grid-cols-2'>
              <BusCard x={query} />
              <BusCard x={query} />
              <BusCard x={query} />
              <BusCard x={query} />
              <BusCard x={query} />
              <BusCard x={query} />
            </div>
          </div>

          <div className='px-0 md:w-1/5 w-full'>
            <div className='flex md:flex-col flex-row overflow-auto gap-4'>
              <Card2 name='Available' data={5} Icon={TbBus} iconColor={feedbackVibrant.success} />
              <Card2 name='On trip' data={7} Icon={TbMapPin} iconColor={feedbackVibrant.info} />
              <Card2 name='Unavailable' data={3} Icon={TbCircleOff} iconColor={feedbackVibrant.danger} />
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
