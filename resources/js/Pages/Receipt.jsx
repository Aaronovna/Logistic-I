import { useEffect, useState } from 'react';
import { useStateContext } from '@/context/contextProvider';

import updateStatus from '@/api/updateStatus';

import InventoryLayout from '@/Layouts/InventoryLayout';;
import ReceiptCard from '@/Components/cards/ReceiptCard';
import { UpcomingShipmentCard } from '@/Components/cards/ReceiptCard';
import { gradients } from "@/Constants/themes";

import { TbSearch } from "react-icons/tb";
import toast from 'react-hot-toast';

const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

const Receipt = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2052])) {
    return (
      <Unauthorized />
    )
  }

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

  const onReceived = (id) => {
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Delivered' })
  }

  const onDelivered = (id) => {
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Checked' })
  }

  const onAccept = async (id, data) => {
    const inventoryPromises = data.products.map(async (product) => {
      const payload = {
        quantity: product.quantity,
        product_id: product.id,
        warehouse_id: data.warehouse_id,
      }
      try {
        const response = await axios.post(`/inventory/create`,payload)
        toast.success('success');
      } catch (error) {
        toast.error('error');
      }
    })

    const results = await Promise.all(inventoryPromises);
    
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Success' })
  }

  const onReturn = (id) => {
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Return' })
  }

  const onCreateTaskSubmit = async (e, data) => {
    e.preventDefault();

    const payload = {
      type: 'Goods Receipt Note (GRN) Review and Quantity Check',
      title: `Auto GRN Review and Check: (${data.order_id} | ${data.order_warehouse})`,
      description:
        `
        Auto Generated Task by Receipt module
        Compare the Goods Receipt Notes with the corresponding POs and verify that all received items are accurately recorded.
        `,
      scope: `Order: ${data.order_id} Fleet: ${JSON.parse(data.fleet).name} | ${JSON.parse(data.fleet).plate}`,
      auto_gen: true,
      assigned_by: auth.user.id,
    };

    try {
      const response = await axios.post('audit/task/create', payload)
      if (response.status === 201) {
        const url = `/receipt/update/${data.id}`;
        updateStatus(url, { task_id: response.data.data.id })
      }
    } catch (error) {

    }
  }

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Receipt" />
      <InventoryLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Receipt</h2>}>
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
            <div className='grid grid-cols-2 gap-4 overflow-y-scroll pr-2'>
              {RD?.map((data, index) => {
                return (
                  <ReceiptCard data={data} key={index} onClick={() => handleShipmentClick(data)} />
                )
              })}
            </div>

          </div>

          <Modal show={openShipmentDataModal} onClose={() => setOpenShipmentDataModal(false)}>
            <div className="p-4">
              <p className='modal-header'>Shipment Details</p>
              <p className='font-semibold text-gray-500'>Order ID: <span className='font-semibold' style={{ color: theme.text }}>{shipmentData?.order_id}</span></p>

              <p className='font-semibold text-lg mt-4'>Product List</p>
              <div className='p-2 mb-4'>
                {shipmentData?.products?.length > 0 && (
                  shipmentData?.products?.map((order, index) => (
                    <p key={index}>{`${order.name} x${order.quantity}`}</p>
                  ))
                )}
              </div>

              {shipmentData?.task_status === "Completed" &&
                <div className='p-2'>
                  <p>Checked By: {shipmentData.task_assigned_to_name}</p>
                  <p>Final Comment: {shipmentData.task_report_final_comment}</p>
                  <p>Status: {shipmentData.task_status}</p>
                </div>
              }

              {shipmentData?.status === 'Upcoming' && <button className='border-card' onClick={() => onReceived(shipmentData.id)}>Shipment Received</button>}
              {shipmentData?.status === 'Delivered' && !shipmentData?.task_id && <button className='border-card w-fit' onClick={(e) => onCreateTaskSubmit(e, shipmentData)}>Create Task</button>}
              {shipmentData?.status !== 'Checked'  && shipmentData?.task_status === "Completed" && <button className='border-card w-fit' onClick={() => onDelivered(shipmentData.id)}>Product Checked</button>}

              {shipmentData?.status === 'Checked' &&
                <div>
                  <button className='border-card mr-2' onClick={() => onReturn(shipmentData.id)}>Return</button>
                  <button className='border-card' onClick={() => onAccept(shipmentData.id, shipmentData)}>Accept</button>
                </div>
              }

            </div>
          </Modal>

          <Modal show={openUpcomingShipmentModal} onClose={() => setOpenUpcomingShipmentModal(false)} maxWidth='4xl'>
            <div className='p-4 md:h-[38rem] h-[32rem] overflow-hidden'>
              <p className='modal-header'>Upcoming Shipment</p>
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
      </InventoryLayout>
    </AuthenticatedLayout>
  );
}

export default Receipt;