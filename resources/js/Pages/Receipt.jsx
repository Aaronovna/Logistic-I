import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DefaultLayout from '@/Layouts/DefaultLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';

import ReceiptCard from '@/Components/cards/ReceiptCard';

import { useStateContext } from '@/context/contextProvider';
import { gradients } from "@/Constants/themes";
import { Link } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import { UpcomingShipmentCard } from '@/Components/cards/ReceiptCard';

import { TbSearch } from "react-icons/tb";

const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

export default function Receipt({ auth }) {
  const { theme, ordersDummyData } = useStateContext();
  const [OFD, setOFD] = useState([]);
  const [RD, setRD] = useState([]);

  const [openUpcomingShipmentModal, setOpenUpcomingShipmentModal] = useState(false);

  const [receivedShipment, setReceivedShipment] = useState();
  const fetchReceivedShipment = async () => {
    try {
      const response = await axios.get('/receipt/get');
      setReceivedShipment(response.data.sort((a, b) => {
        const dateA = a.order_date;
        const dateB = b.order_date;

        if (dateA < dateB) return -1; // a comes before b
        if (dateA > dateB) return 1;  // a comes after b
        return 0; // a and b are equal
      }));
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    fetchReceivedShipment();
  }, [])

  useEffect(() => {
    setOFD(filterOrdersByStatuses(ordersDummyData, ['Upcoming']));
    if (receivedShipment) {
      setRD(filterOrdersByStatuses(receivedShipment, [
        'Upcoming',
        'Delivered',
        'Checking',
        'Checked',
        //'Success', 'Return'
      ]));
    }
  }, [ordersDummyData, receivedShipment])

  const [openShipmentDataModal, setOpenShipmentDataModal] = useState(false);
  const [shipmentData, setShipmentData] = useState();

  const handleShipmentClick = (data) => {
    try {
      const parsedProducts = data?.products ? JSON.parse(data.products) : [];

      setShipmentData({
        ...data,
        products: parsedProducts, // Update the products property with the parsed array
      });
      setOpenShipmentDataModal(true);
    } catch (parseError) {
      console.error("Error parsing products JSON:", parseError);
      // Optionally set an error state or display an error message to the user
      setModalData({
        ...data,
        products: []
      });
      setOpenShipmentDataModal(true);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Receipt" />
      <DefaultLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Receipt</h2>}>
        <div className="content">
          <div
            className='relative rounded-xl p-4 flex h-44 overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl duration-200'
            style={{ background: gradients.evening_night }}
            onClick={() => setOpenUpcomingShipmentModal(true)}
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
                : <p className='font-medium text-2xl text-white mt-auto'>Order No. {OFD[0]?.id}</p>
              }
            </div>
          </div>

          <div className='mt-8 flex'>
            <p className='font-medium text-3xl' style={{ color: theme.text }}>Shipments</p>
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
                  <div key={index} onClick={() => { handleShipmentClick(data) }}>
                    <ReceiptCard data={data} />
                  </div>
                )
              })}
            </div>

          </div>

          <Modal show={openShipmentDataModal} onClose={() => setOpenShipmentDataModal(false)}>
            <div className="p-4">
              <p className='font-semibold text-xl mt-2 mb-4'>Shipment Details</p>
              <p className='font-semibold text-gray-500'>Order ID: <span className='font-semibold' style={{ color: theme.text }}>{shipmentData?.order_id}</span></p>

              <p className='font-semibold text-lg mt-4'>Product List</p>
              <div className='p-2 mb-4'>
                {shipmentData?.products?.length > 0 && (
                  shipmentData?.products?.map((order, index) => (
                    <p key={index}>{`${order.name} x${order.quantity}`}</p>
                  ))
                )}
              </div>

              {shipmentData?.status === 'Checked' &&
                <div className='p-2'>
                  <p>Checked By: --</p>
                  <p>Comment: Approved</p>
                </div>
              }

              {shipmentData?.status === 'Upcoming' && <button className='border-card'>Shipment Received</button>}
              {shipmentData?.status === 'Delivered' && <p className='border-card w-fit cursor-not-allowed'>Waiting to be checked</p>}
              {shipmentData?.status === 'Checking' && <p className='border-card w-fit cursor-not-allowed'>Waiting to be checked</p>}

              {shipmentData?.status === 'Checked' &&
                <div>
                  <button className='border-card mr-2'>Return</button>
                  <button className='border-card'>Accept</button>
                </div>
              }

            </div>
          </Modal>

          <Modal show={openUpcomingShipmentModal} onClose={() => setOpenUpcomingShipmentModal(false)} maxWidth='4xl'>
            <div className='md:h-[38rem] h-[32rem] overflow-hidden'>
              <p className='font-semibold text-xl mt-2 mb-4'>Upcoming Shipment</p>
              <div className='h-[90%] overflow-y-auto pr-1'>
                {
                  ordersDummyData?.map((data, index) => {
                    return (
                      <UpcomingShipmentCard data={data} key={index} />
                    )
                  })
                }
              </div>
            </div>
          </Modal>
        </div>
      </DefaultLayout>
    </AuthenticatedLayout>
  );
}