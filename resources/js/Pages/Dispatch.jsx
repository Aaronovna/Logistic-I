import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import useRole from '@/hooks/useRole';
import RequestsFolder from '@/Components/cards/RequestsFolder';
import RequestCard from '@/Components/cards/RequestCard';
import { Card2 } from '@/Components/Cards';
import { filterArray } from '@/functions/filterArray';
import useUpdateStatus from '@/api/useUpdateStatus';
import { dateTimeFormatLong } from '@/Constants/options';
import Status from '@/Components/Status';
import { getStatusStep, requestStatus } from '@/Constants/status';
import { TbMail } from 'react-icons/tb';
import { TbTruckDelivery } from 'react-icons/tb';

const Dispatch = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const { theme, debugMode } = useStateContext();
  const { updateStatus } = useUpdateStatus();
  const [depotRequests, setDepotRequests] = useState();
  const [terminalRequests, setTerminalRequests] = useState();
  const [requests, setRequests] = useState();
  const [filteredRequests, setFilteredRequests] = useState();

  const fetchRequests = async () => {
    try {
      const response = await axios.get('/request/get');
      setRequests(filterArray(response.data.data, 'status', ['Completed', 'Request Rejected', 'Request Cancelled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const fetchDepotRequests = async () => {
    try {
      const response = await axios.get('/request/get/infrastructure/depot');
      setDepotRequests(filterArray(response.data.data, 'status', ['Completed', 'Request Rejected', 'Request Cancelled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const fetchTerminalRequests = async () => {
    try {
      const response = await axios.get('/request/get/infrastructure/terminal');
      setTerminalRequests(filterArray(response.data.data, 'status', ['Completed', 'Request Rejected', 'Request Cancelled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const fetchAllRequests = () => {
    fetchRequests();
    fetchDepotRequests();
    fetchTerminalRequests();
  };

  useEffect(() => {
    fetchAllRequests();
  }, [])

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [requestData, setRequestData] = useState();

  const handleOpenRequestModal = (data) => {
    setRequestData(data);
    setOpenRequestModal(true);
  }

  const fetchItemAvailability = async () => {
    if (requestData?.items) {
      const items = JSON.parse(requestData.items);
      const availabilityPromises = items.map(async (item) => {
        try {
          const response = await axios.get(`/product/get/${item.product_id}`);
          const stockCount = response.data.data?.total_stock || 0;
          return {
            ...item,
            available: stockCount >= item.quantity,
            stockCount,
          };
        } catch (error) {
          toast.error(`${error.status} ${error.response.data.message}`);
          return { ...item, available: false, stockCount: 0 };
        }
      });

      const availabilityResults = await Promise.all(availabilityPromises);
      setItemAvailability(availabilityResults);
    }
  };

  const [itemAvailability, setItemAvailability] = useState([]);
  useEffect(() => {

    if (openRequestModal) {
      fetchItemAvailability();
    }
  }, [requestData, openRequestModal]);

  const handleAccept = async (id) => {
    const payload = {
      status: 'Request Approved'
    }
    try {
      const response = await axios.patch(`/request/update/${id}`, payload)
      fetchAllRequests();
      setOpenRequestModal(false);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const handleReject = async (id) => {
    const payload = {
      status: 'Request Rejected'
    }
    try {
      const response = await axios.patch(`/request/update/${id}`, payload);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    } finally {
      fetchAllRequests();
      setOpenRequestModal(false);
    }
  }

  const createDispatch = async (data) => {
    const payload = {
      request_id: data.id,
      type: data.type,
    }

    try {
      const response = await axios.post('/dispatch/create', payload);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const handleCancelFill = async (productId, quantity, index) => {
    try {
      const payload = { quantity: quantity, operation: 'subtract' };
      await axios.patch(`/inventory/stock/update/${productId}`, payload);

      // Update the local state to mark the item as not filled
      const updatedItems = [...itemAvailability];
      updatedItems[index].filled = false;

      // Prepare the payload to update the status and items in the database
      const updatePayload = {
        status: requestData.status,
        items: JSON.stringify(updatedItems), // Stringify the updated items array
      };

      // Update the request material with the reverted stock
      await axios.patch(`/request/update/${requestData.id}`, updatePayload);

      // Update the local state
      setItemAvailability(updatedItems);

      toast.success(`Stock successfully reverted for Product ID: ${productId}`);
    } catch (error) {
      console.error(`Error reverting stock for Product ID: ${productId}`, error);
      toast.error(`Failed to revert stock for Product ID: ${productId}`);
    }
  };

  const handleFillStock = async (productId, quantity, index) => {
    try {
      const payload = { quantity, operation: 'add' }; // Only pass the quantity to be deducted
      await axios.patch(`/inventory/stock/update/${productId}`, payload);

      // Update the local state to mark the item as filled
      const updatedItems = [...itemAvailability];
      updatedItems[index].filled = true;

      // Prepare the payload to update the status and items in the database
      const updatePayload = {
        status: requestData.status,
        items: JSON.stringify(updatedItems), // Stringify the updated items array
      };

      // Update the request material with the filled items
      await axios.patch(`/request/update/${requestData.id}`, updatePayload);

      // Update the local state
      setItemAvailability(updatedItems);

      toast.success(`Stock successfully updated for Product ID: ${productId}`);
    } catch (error) {
      console.error(`Error updating stock for Product ID: ${productId}`, error);
      toast.error(`Failed to update stock for Product ID: ${productId}`);
    }
  };

  const handleRejectAllFill = async () => {
    try {
      // Loop through all items and revert stock for each one
      for (let i = 0; i < itemAvailability.length; i++) {
        const item = itemAvailability[i];
        if (item.filled) {
          const payload = { quantity: item.quantity, operation: 'subtract' }; // Revert stock
          await axios.patch(`/inventory/stock/update/${item.product_id}`, payload);

          // Update the local state to mark the item as not filled
          const updatedItems = [...itemAvailability];
          updatedItems[i].filled = false;
          setItemAvailability(updatedItems);
        }
      }

      toast.success("All fills have been rejected and stock reverted.");
    } catch (error) {
      console.error("Error rejecting all fills:", error);
      toast.error("Failed to reject fills and revert stock.");
    }
  };

  const handlePrepareForDelivery = async () => {
    const allFilled = itemAvailability.every(item => item.filled);

    if (!allFilled) {
      toast.error("All items must be filled before preparing for delivery.");
      return;
    }

    try {
      const requestStatusPayload = { status: 'Materials Fulfilled' };
      await axios.patch(`/request/update/${requestData.id}`, requestStatusPayload);
      toast.success("Materials marked as fulfilled and ready for delivery.");
    } catch (error) {
      console.error("Error preparing for delivery:", error);
      toast.error("Failed to mark materials as fulfilled.");
    }

    fetchAllRequests();
    setOpenRequestModal(false);
  };

  const CompleteDeliver = async (id) => {
    const url = `/request/update/${id}`;
    const updateResponse = await updateStatus(url, { status: 'Delivered' });

    if (updateResponse.status === 200) {
      try {
        const response = await axios.post(`/dispatch/trail/create/${id}`);
      } catch (error) {
        toast.error(`${error.status} ${error.response.data.message}`);
      }
    }


    fetchAllRequests();
    setOpenRequestModal(false);
  }

  const [activeFilter, setActiveFilter] = useState('No Filter');
  const filterRequests = (status) => {
    if (status === 'No Filter') {
      setFilteredRequests(requests);
    } else {
      const filteredRequests = filterArray(requests, 'status', [status]);
      setFilteredRequests(filteredRequests);
    }
    setActiveFilter(status);
  };

  useEffect(() => {
    filterRequests(activeFilter);
  }, [requests]);

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Dispatch" />

      <Layout user={auth.user} header={<NavHeader headerName="Dispatch" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content flex flex-col h-screen">
            <div className='flex gap-4'>
              <Card2 name='Active Requests' data={requests && filterArray(requests, 'status', ["In Transit", "Delivered", "Request Rejected", "Request Canceled"], true).length} className='w-1/2' Icon={TbMail} />
              <Card2 name='Deliveries' className='w-1/2' Icon={TbTruckDelivery} data={requests && filterArray(requests, 'status', ["In Transit", "Delivered"]).length} />
            </div>

            <div className='flex flex-col w-full justify-between mt-8'>
              <div className='flex gap-4 mb-4 flex-wrap gap-y-4'>
                {requestStatus.map((status, index) => {
                  return (
                    <span key={index} className={`cursor-pointer shadow-sm ${activeFilter === status.name ? 'scale-110 mx-1 shadow-xl' : null}`}>
                      <Status statusArray={requestStatus} status={status.name} onClick={() => filterRequests(status.name)} />
                    </span>
                  )
                })}
                <span>
                  <span onClick={() => filterRequests('No Filter')}
                    className={`leading-normal whitespace-nowrap p-1 px-3 rounded-lg w-fit h-fit bg-gray-100 text-gray-600 cursor-pointer shadow-sm ${activeFilter === 'No Filter' ? 'scale-x-150 mx-1 shadow-xl' : null}`}>
                    No Filter
                  </span>
                </span>
              </div>

              <div className='w-full flex mb-2 mt-2 items-end'>
                <div className='flex items-baseline ml-2'>
                  <p className='font-semibold text-2xl text-text'>Requests</p>
                  <Link className='ml-2 text-sm hover:underline text-neutral' href={route('dispatch-history')}>History</Link>
                </div>
              </div>
            </div>

            <div className='grid gap-4 grid-cols-3'>
              <RequestsFolder total={depotRequests?.length} name='Depot'>
                {
                  depotRequests && depotRequests.map((request, index) => {
                    return (
                      <RequestsFolder.Request request={request} key={index} onClick={() => handleOpenRequestModal(request)} />
                    )
                  })
                }
              </RequestsFolder>
              <RequestsFolder total={terminalRequests?.length} name='Terminal'>
                {
                  terminalRequests && terminalRequests.map((request, index) => {
                    return (
                      <RequestsFolder.Request request={request} key={index} onClick={() => handleOpenRequestModal(request)} />
                    )
                  })
                }
              </RequestsFolder>
              <RequestsFolder data={undefined} name='Other' />
            </div>

            {!requests?.length ?
              <div className='flex-1 flex justify-center items-center'>
                <p className='text-xl text-neutral'>No Material Requests Available</p>
              </div> : null
            }

            <div className='mt-8 grid gap-4 grid-cols-3'>
              {filteredRequests?.map((request, index) => {
                return (
                  <div key={index} onClick={() => handleOpenRequestModal(request)}>
                    <RequestCard data={request} />
                  </div>
                )
              })}
            </div>
            <Modal
              show={openRequestModal}
              name={`Request from ${requestData?.infrastructure_name || "Unknown Infrastructure"}`}
              onClose={() => {
                setOpenRequestModal(false);
                setItemAvailability([]);
              }}
            >

              <div className="mt-4">
                <div className='flex justify-between mb-2'>
                  <p>{new Date(requestData?.created_at).toLocaleString(undefined, dateTimeFormatLong)}</p>
                  <Status statusArray={requestStatus} status={requestData?.status} />
                </div>

                <div className='mb-2'>
                  <p><span className="font-medium">{`Request from: `}</span>{requestData?.infrastructure_name || "Unknown"}</p>
                  <p><span className="font-medium">{`Purpose: `}</span>{requestData?.type || "N/A"}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="font-medium mb-2">Requested Products</p>
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                  {itemAvailability.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md border border-gray-200"
                    >
                      <span>
                        <span className="text-sm text-gray-600 mr-2">{item.product_id}</span>
                        <span className="font-medium">{item.product_name}</span>
                      </span>

                      {requestData && (getStatusStep(requestStatus, requestData?.status) === 1 ||
                        getStatusStep(requestStatus, requestData?.status) === 2 ||
                        getStatusStep(requestStatus, requestData?.status) === 3 ||
                        getStatusStep(requestStatus, requestData?.status) === 6 ||
                        getStatusStep(requestStatus, requestData?.status) === 7) &&
                        <span className="text-sm text-gray-700 flex items-center">
                          Qty: {item.quantity}
                        </span>
                      }

                      {requestData && getStatusStep(requestStatus, requestData?.status) === 1 || requestData && getStatusStep(requestStatus, requestData?.status) === 2 &&
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded ${item.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.available
                            ? `${item.stockCount}`
                            : `Stock: ${item.stockCount}`}
                        </span>
                      }

                      {requestData && getStatusStep(requestStatus, requestData?.status) === 2 && (
                        item.filled ? (
                          <button
                            disabled={!hasPermissions([312])}
                            className="btn disable text-[#050315] bg-red-200 text-sm p-1 px-2"
                            onClick={() => handleCancelFill(item.product_id, item.quantity, index)}
                          >
                            Cancel Fill
                          </button>
                        ) : (
                          <button
                            disabled={!hasPermissions([312])}
                            className="btn disable text-background bg-accent text-sm p-1 px-2"
                            onClick={() => handleFillStock(item.product_id, item.quantity, index)}
                          >
                            Fill Stock
                          </button>
                        ))}
                    </li>
                  ))}
                </ul>
              </div>

              {requestData && getStatusStep(requestStatus, requestData?.status) === 1 &&
                <div className={`w-fit ml-auto mt-4`}>
                  <button
                    disabled={!(requestData?.status === 'Request Created') || !hasPermissions([312])}
                    className="btn disable mr-2 bg-red-200 hover:bg-red-400 text-[#050315]"
                    onClick={() => {
                      handleReject(requestData?.id);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    disabled={!(requestData?.status === 'Request Created') || !hasPermissions([312])}
                    className="btn disable bg-accent hover:bg-primary text-background"
                    onClick={() => {
                      handleAccept(requestData?.id);
                      createDispatch(requestData);
                    }}
                  >
                    Accept
                  </button>
                </div>
              }

              {requestData && getStatusStep(requestStatus, requestData?.status) === 2 &&
                <div className={`w-fit ml-auto mt-4`}>
                  <button
                    disabled={!hasPermissions([312])}
                    className="btn disable mr-2 bg-red-200 hover:bg-red-400 text-[#050315]"
                    onClick={handleRejectAllFill}
                  >
                    Cancel Fills
                  </button>
                  <button
                    disabled={!hasPermissions([312])}
                    className="btn disable bg-accent hover:bg-primary text-background"
                    onClick={handlePrepareForDelivery}
                  >
                    Request for Delivery
                  </button>
                </div>
              }

              {requestData && getStatusStep(requestStatus, requestData?.status) === 3 &&
                <div className={`justify-between items-end mt-4 ${requestData?.status === 'Materials Fulfilled' ? 'flex' : 'hidden'}`}>
                  {
                    debugMode ? <button className='border-card italic' onClick={() => CompleteDeliver(requestData?.id)}>Make Delivered</button> : null
                  }
                  <p className='italic'>Ready for Dispatch</p>
                </div>
              }

            </Modal>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Dispatch;