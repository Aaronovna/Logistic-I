import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import InventoryLayout from '@/Layouts/InventoryLayout';
import RequestsFolder from '@/Components/cards/RequestsFolder';
import RequestCard from '@/Components/cards/RequestCard';
import { Card2 } from '@/Components/Cards';
import { filterArray } from '@/functions/filterArray';
import updateStatus from '@/api/updateStatus';
import { dateTimeFormatLong } from '@/Constants/options';

const Dispatch = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2052])) {
    return (
      <Unauthorized />
    )
  }

  const { theme, debugMode } = useStateContext();

  const [depotRequests, setDepotRequests] = useState();
  const [terminalRequests, setTerminalRequests] = useState();
  const [requests, setRequests] = useState();

  const fetchRequests = async () => {
    try {
      const response = await axios.get('request/get');
      setRequests(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const fetchDepotRequests = async () => {
    try {
      const response = await axios.get('request/get/infrastructure/depot');
      setDepotRequests(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const fetchTerminalRequests = async () => {
    try {
      const response = await axios.get('request/get/infrastructure/terminal');
      setTerminalRequests(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchDepotRequests();
    fetchTerminalRequests();
  }, [])

  const [openRequestModal, setOpenRequestModal] = useState(false);
  const [requestData, setRequestData] = useState();

  const handleOpenRequestModal = (data) => {
    setRequestData(data);
    setOpenRequestModal(true);
  }

  const [itemAvailability, setItemAvailability] = useState([]);
  useEffect(() => {
    const fetchItemAvailability = async () => {
      if (requestData?.items) {
        const items = JSON.parse(requestData.items);
        const availabilityPromises = items.map(async (item) => {
          try {
            const response = await axios.get(`/product/get/${item.product_id}`);
            const stockCount = response.data?.total_stock || 0; // Adjust based on your API response
            return {
              ...item,
              available: stockCount >= item.quantity,
              stockCount,
            };
          } catch (error) {
            console.error(`Error fetching availability for product ${item.product_id}:`, error);
            return { ...item, available: false, stockCount: 0 };
          }
        });

        const availabilityResults = await Promise.all(availabilityPromises);
        setItemAvailability(availabilityResults);
      }
    };

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
    } catch (error) {

    }
  }

  const handleReject = async (id) => {
    const payload = {
      status: 'Request Rejected'
    }
    try {
      const response = await axios.patch(`/request/update/${id}`, payload)
    } catch (error) {

    }
  }

  const createDispatch = async (data) => {
    const payload = {
      request_id: data.id,
      type: data.type,
    }

    try {
      const response = await axios.post('/dispatch/create', payload)
    } catch (error) {

    }
  }

  const handleCancelFill = async (productId, quantity, index) => {
    try {
      const payload = { quantity: -quantity }; // Pass negative quantity to add back to stock
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
      const payload = { quantity }; // Only pass the quantity to be deducted
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
          const payload = { quantity: -item.quantity }; // Revert stock
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
      const requestStatusPayload = { status: 'Materials Procured' };
      await axios.patch(`/request/update/${requestData.id}`, requestStatusPayload);
      toast.success("Materials marked as procured and ready for delivery.");
    } catch (error) {
      console.error("Error preparing for delivery:", error);
      toast.error("Failed to mark materials as procured.");
    }
  };

  const CompleteDeliver = (id) => {
    const url = `/request/update/${id}`;
    updateStatus(url, { status: 'Delivered' })
  }

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Dispatch" />

      <InventoryLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Dispatch</h2>}>
        <div className="content">
          <div className='flex gap-4 mb-8'>
            <Card2 name='Total Requests' data={requests?.length} />
            <Card2 name='Total Deliveries' data={requests && filterArray(requests, 'status', ["In Transit", "Delivered"]).length} />
          </div>

          <div className='flex mt-8 mb-4 items-baseline justify-between'>
            <p className='font-medium text-xl' style={{ color: theme.text }}>Requests</p>
            <Link href={route('dispatch-history')}>
              View History
            </Link>
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

          <div className='mt-8 grid gap-4 grid-cols-3'>
            {requests?.map((request, index) => {
              return (
                <div key={index} onClick={() => handleOpenRequestModal(request)}>
                  <RequestCard data={request} />
                </div>
              )
            })}
          </div>
        </div>

        <Modal
          show={openRequestModal}
          onClose={() => {
            setOpenRequestModal(false);
            setItemAvailability([]);
          }}
        >
          <div className="p-4">
            {/* Modal Header */}
            <h2 className="text-lg font-semibold border-b pb-2">
              Request from {requestData?.infrastructure_name || "Unknown Infrastructure"}
            </h2>

            {/* Request Info */}
            <div className="mt-4">
              <p className="mb-2">
                <span className="font-medium">Date:</span>{" "}
                {new Date(requestData?.created_at).toLocaleString(
                  undefined,
                  dateTimeFormatLong
                )}
              </p>
              <p className="mb-2">
                <span className="font-medium">Requested By:</span>{" "}
                {requestData?.user_name || "Unknown"}
              </p>
              <p className="mb-2">
                <span className="font-medium">Purpose:</span>{" "}
                {requestData?.type || "N/A"}
              </p>
              <p className="mb-2">
                <span className="font-medium">Status:</span>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${requestData?.status === "Completed"
                    ? "bg-green-100 text-green-700"
                    : requestData?.status === "Rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {requestData?.status || "Pending"}
                </span>
              </p>
            </div>

            {/* Items List */}
            <div className="mt-4">
              <p className="font-medium mb-2">Request Items:</p>
              <ul className="space-y-2 max-h-96 overflow-y-auto">
                {itemAvailability.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md border border-gray-200"
                  >
                    <span>
                      <span className="text-sm text-gray-500 mr-2">{item.product_id}</span>
                      <span className="font-medium text-gray-700">{item.product_name}</span>
                    </span>
                    {requestData?.status === "Request Approved" ? (
                      item.filled ? (
                        // Show "Cancel Fill" button if the item is already filled
                        <button
                          className="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                          onClick={() => handleCancelFill(item.product_id, item.quantity, index)}
                        >
                          Cancel Fill
                        </button>
                      ) : (
                        // Show "Fill Stock" button if the item is not yet filled
                        <button
                          className="ml-4 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                          onClick={() => handleFillStock(item.product_id, item.quantity, index)}
                        >
                          Fill Stock
                        </button>
                      )
                    ) : (
                      // Show stock status if not "Request Created"
                      <span className="text-sm text-gray-700 flex items-center">
                        Qty: {item.quantity}
                        <span
                          className={`ml-3 px-2 py-1 text-xs rounded ${item.available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.available
                            ? `Available (Stock: ${item.stockCount})`
                            : `Out of Stock (Stock: ${item.stockCount})`}
                        </span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className={`justify-end gap-2 mt-4 ${requestData?.status === 'Request Created' ? 'flex' : 'hidden'}`}>
              <button
                disabled={requestData?.status === 'Request Created' ? false : true}
                className="border border-red-300 bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition"
                onClick={() => {
                  handleReject(requestData?.id); // Define `handleReject` function
                }}
              >
                Reject
              </button>
              <button
                disabled={requestData?.status === 'Request Created' ? false : true}
                className="border border-green-300 bg-green-50 text-green-600 px-4 py-2 rounded-md hover:bg-green-100 transition"
                onClick={() => {
                  handleAccept(requestData?.id); // Define `handleAccept` function
                  createDispatch(requestData);
                }}
              >
                Accept
              </button>
            </div>
            <div className={`justify-end gap-2 mt-4 ${requestData?.status === 'Request Approved' ? 'flex' : 'hidden'}`}>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={handleRejectAllFill}
              >
                Reject All Fills
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handlePrepareForDelivery}
              >
                Prepare for Delivery
              </button>
            </div>

            <div className={`justify-end gap-2 mt-4 ${requestData?.status === 'Materials Procured' ? 'flex' : 'hidden'}`}>
              <p>Waiting for Transport</p>
            </div>
            {
              debugMode ? <button className='border-card italic' onClick={() => CompleteDeliver(requestData?.id)}>Make Delivered</button> : null
            }
          </div>
        </Modal>


      </InventoryLayout>
    </AuthenticatedLayout>
  );
}

export default Dispatch;