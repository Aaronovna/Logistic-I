import { useEffect, useState } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { auditTaskStatus, getStatusStep, receiptStatus } from '@/Constants/status';
import useUpdateStatus from '@/api/useUpdateStatus';

import ReceiptCard from '@/Components/cards/ReceiptCard';
import { UpcomingShipmentCard } from '@/Components/cards/ReceiptCard';
import { gradients } from "@/Constants/themes";

import { filterArray } from '@/functions/filterArray';
import { TbUserFilled } from 'react-icons/tb';
import { TbHash } from 'react-icons/tb';
import { dateTimeFormatLong } from '@/Constants/options';
import Status from '@/Components/Status';
import { shipmentStatus } from '@/Constants/status';
import { TbMapPin } from 'react-icons/tb';
import useRole from '@/hooks/useRole';

const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

const Receipt = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const { updateStatus } = useUpdateStatus();
  const { theme, ordersDummyData } = useStateContext();
  const [OFD, setOFD] = useState([]);

  const [openUpcomingShipmentModal, setOpenUpcomingShipmentModal] = useState(false);

  const [receivedShipment, setReceivedShipment] = useState();
  const [filteredReceivedShipments, setFilteredReceivedShipments] = useState([]);
  const fetchReceivedShipment = async () => {
    try {
      const response = await axios.get('/receipt/get');

      const data = response.data.data.sort((a, b) => {
        const dateA = a.order_date;
        const dateB = b.order_date;

        if (dateA < dateB) return -1;
        if (dateA > dateB) return 1;
        return 0;
      })

      setReceivedShipment(filterOrdersByStatuses(data, [
        'Upcoming',
        'Delivered',
        'Auditing on progress',
        'Checked',
      ]));

    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    fetchReceivedShipment();
  }, [])

  useEffect(() => {
    setOFD(filterOrdersByStatuses(ordersDummyData, ['Upcoming']));

  }, [ordersDummyData])

  const [openShipmentDataModal, setOpenShipmentDataModal] = useState(false);
  const [shipmentData, setShipmentData] = useState();

  const handleShipmentClick = (data) => {
    try {
      const parsedProducts = data?.products ? JSON.parse(data.products) : [];

      setShipmentData({
        ...data,
        products: parsedProducts,
      });
      setOpenShipmentDataModal(true);
    } catch (parseError) {

      setOpenShipmentDataModal(true);
    }
  };

  const onReceived = (id) => {
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Delivered' });
    fetchReceivedShipment();
    setOpenShipmentDataModal(false);
  }

  const onDelivered = (id) => {
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Checked' });
    fetchReceivedShipment();
    setOpenShipmentDataModal(false);
  }

  const onAccept = async (id, data) => {
    console.log(data);
    try {
      const response = await axios.post('/inventory/create/bulk', {
        warehouse_id: data.warehouse_id,
        products: data.products,
      });

      if (response.status == 200) {
        const url = `/receipt/update/${id}`;
        updateStatus(url, { status: 'Success' });
        fetchReceivedShipment();
        setOpenShipmentDataModal(false);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const onReturn = (id) => {
    const url = `/receipt/update/${id}`;
    updateStatus(url, { status: 'Return' })
    fetchReceivedShipment();
    setOpenShipmentDataModal(false);
  }

  const onCreateTaskSubmit = async (e, data) => {
    e.preventDefault();
    const formatDateTime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');

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
      startdate: formatDateTime(new Date()),
      deadline: formatDateTime(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
      assigned_by: auth.user.id,
    };

    try {
      const response = await axios.post('audit/task/create', payload)
      if (response.status === 201) {
        const url = `/receipt/update/${data.id}`;
        updateStatus(url, { task_id: response.data.data.id, status: 'Auditing on progress' })
      }
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    } finally {
      fetchReceivedShipment();
      setOpenShipmentDataModal(false);
    }
  }

  const [activeFilter, setActiveFilter] = useState('No Filter');
    const filterShipments = (status) => {
      if (status === 'No Filter') {
        setFilteredReceivedShipments(receivedShipment);
      } else {
        const filteredShipments = filterArray(receivedShipment, 'status', [status]);
        setFilteredReceivedShipments(filteredShipments);
      }
      setActiveFilter(status);
    };
  
    useEffect(() => {
      filterShipments(activeFilter);
    }, [receivedShipment]);

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Receipt" />
      <Layout user={auth.user} header={<NavHeader headerName="Receipt" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content">
            <div
              className='relative rounded-xl p-4 flex h-44 overflow-hidden shadow-xl cursor-pointer hover:shadow-2xl duration-200'
              style={{ background: gradients.evening_night }}
              onClick={() => setOpenUpcomingShipmentModal(true)}
            >
              <div className='md:block hidden absolute log w-44 scale-150 top-1 right-10 h-full bg-no-repeat'></div>
              <div className='absolute w-full h-full top-0 left-0 hover-r-grd duration-150 hover:opacity-100 opacity-0 flex'>
                <p className='font-medium text-xl text-white tracking-wide z-10 ml-auto mt-auto p-2 bg-black/50 rounded-tl-lg'>View Upcoming Shipments</p>
              </div>

              <div className='flex flex-col'>
                <p className='font-semibold text-3xl text-white tracking-wider'>
                  {`${OFD.length === 0 ? `No Upcoming Shipments` : `Upcoming Shipments`}`}
                  <sup className='text-lg font-semibold'>{`${OFD.length <= 1 ? `` : ` +${OFD.length - 1}`}`}</sup>
                </p>
                {OFD.length === 0
                  ? null
                  : <p className='font-medium text-2xl text-white mt-auto'>Order No. {OFD[0]?.id}</p>
                }
              </div>
            </div>

            <div className='mt-4'>
              <div className='flex flex-col w-full justify-between mt-8'>
                <div className='flex gap-2 mb-4'>
                  {receiptStatus.map((status, index) => {
                    return (
                      <span key={index} className={`cursor-pointer shadow-sm ${activeFilter === status.name ? 'scale-110 mx-1 shadow-xl' : null}`}>
                        <Status statusArray={receiptStatus} status={status.name} onClick={() => filterShipments(status.name)} />
                      </span>
                    )
                  })}
                  <span>
                    <span onClick={() => filterShipments('No Filter')}
                      className={`leading-normal whitespace-nowrap p-1 px-3 rounded-lg w-fit h-fit bg-gray-100 text-gray-600 cursor-pointer shadow-sm ${activeFilter === 'No Filter' ? 'scale-x-150 mx-1 shadow-xl' : null}`}>
                      No Filter
                    </span>
                  </span>
                </div>

                <div className='w-full flex mb-2 mt-2 items-end'>
                  <div className='flex items-baseline ml-2'>
                    <p className='font-semibold text-2xl'>Shipments</p>
                    <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('receipt-history')}>History</Link>
                  </div>
                </div>
              </div>
              <div className='grid md:grid-cols-2 grid-cols-1 gap-2 overflow-y-scroll pr-2'>
                {filteredReceivedShipments?.map((data, index) => {
                  return (
                    <ReceiptCard data={data} key={index} onClick={() => handleShipmentClick(data)} />
                  )
                })}
              </div>
            </div>
            
            <Modal name="Shipment Details" show={openShipmentDataModal} onClose={() => setOpenShipmentDataModal(false)}>
              <div>
                <div className='flex justify-between mb-2'>
                  <p>{new Date(shipmentData?.created_at).toLocaleString(undefined, dateTimeFormatLong)}</p>
                  <Status statusArray={shipmentStatus} status={shipmentData?.status} />
                </div>

                <div className='flex justify-between'>
                  <p className='flex items-center text-lg'><TbUserFilled className='mr-' /><span className='font-semibold'>{shipmentData && JSON.parse(shipmentData?.supplier).name}</span></p>
                  <p className='flex items-center text-gray-500 mr-1'><TbHash className='ml-2' /><span>{shipmentData?.order_id}</span></p>
                </div>

                <p className='flex items-baseline'><TbMapPin className='mr-1' />{shipmentData?.order_warehouse}</p>

                {shipmentData && getStatusStep(auditTaskStatus, shipmentData?.task_status) <= 3 &&
                  <div className='p-2 mt-2 bg-gray-100 rounded-md'>
                    <p>Assigned To: {shipmentData.task_assigned_to_name}</p>
                  </div>
                }

                {shipmentData && getStatusStep(auditTaskStatus, shipmentData?.task_status) === 4 &&
                  <div className='p-2 mt-2 bg-gray-100 rounded-md'>
                    <p>Assigned To: {shipmentData.task_assigned_to_name}</p>
                    <p>Final Comment: {shipmentData.task_report_final_comment}</p>
                    <p>Status: {shipmentData.task_status}</p>
                  </div>
                }

                <p className='font-semibold text-lg mt-4'>Product List</p>
                <div className='mt-2 mb-4 h-72 overflow-y-auto pr-1 '>
                  {shipmentData?.products?.length && (
                    shipmentData?.products?.map((order, index) => (
                      <p className='flex p-2 bg-gray-100 rounded-md mb-2' key={index}>
                        <span className='text-gray-600 mr-2 w-14'>{order.id}</span>
                        <span className='font-semibold'>{order.name}</span>
                        <span className='ml-auto text-gray-600'>Qty: {order.quantity}</span>
                      </p>
                    ))
                  )}
                </div>

                <div className='flex'>
                  {
                    shipmentData && getStatusStep(shipmentStatus, shipmentData?.status) === 1 &&
                    <button className='border-card ml-auto' onClick={() => onReceived(shipmentData.id)}>Shipment Received</button>
                  }

                  {
                    shipmentData && getStatusStep(shipmentStatus, shipmentData?.status) === 2 && !shipmentData?.task_id &&
                    <button className='border-card w-fit ml-auto' onClick={(e) => onCreateTaskSubmit(e, shipmentData)}>Generate Audit Task</button>
                  }

                  {
                    shipmentData && getStatusStep(shipmentStatus, shipmentData?.status) !== 4 &&
                    getStatusStep(auditTaskStatus, shipmentData?.task_status) === 4 &&
                    <button className='border-card w-fit ml-auto' onClick={() => onDelivered(shipmentData.id)}>Product Checked</button>
                  }

                  {
                    shipmentData && getStatusStep(shipmentStatus, shipmentData?.status) === 4 &&
                    <div className='ml-auto'>
                      <button className='border-card mr-2' onClick={() => onReturn(shipmentData.id)}>Return</button>
                      <button className='border-card' onClick={() => onAccept(shipmentData.id, shipmentData)}>Accept</button>
                    </div>
                  }
                </div>

              </div>
            </Modal>

            <Modal name='Upcoming Shipments' show={openUpcomingShipmentModal} onClose={() => setOpenUpcomingShipmentModal(false)} maxWidth='4xl'>
              <div className='h-[32rem]'>
                {
                  !ordersDummyData?.length ?
                    <div className='w-full h-full flex justify-center items-center'>
                      <p className='text-2xl font-medium text-gray-400'>No upcoming shipments</p>
                    </div>
                    :
                    <div className='h-full overflow-y-auto pr-1'>
                      {
                        ordersDummyData?.map((data, index) => {
                          return (
                            <UpcomingShipmentCard data={data} key={index} callback={() => { setOpenUpcomingShipmentModal(false); fetchReceivedShipment(); }} />
                          )
                        })
                      }
                    </div>
                }
              </div>
            </Modal>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Receipt;