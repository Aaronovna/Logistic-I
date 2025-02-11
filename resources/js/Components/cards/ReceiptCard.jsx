import { useStateContext } from "@/context/contextProvider";

import { dateTimeFormatLong } from "@/Constants/options";
import { TbMapPin } from 'react-icons/tb';
import { TbTruckDelivery } from "react-icons/tb";

import Status from "../Status";
import { shipmentStatus } from "@/Constants/status";

const ReceiptCard = ({ data = {}, onClick = () => { } }) => {
  const { theme } = useStateContext();

  return (
    <div
      className="relative min-w-60 border-card p-4 cursor-pointer hover:shadow-md shadow-sm shadow-gray-300 duration-200 overflow-hidden"
      style={{ borderColor: theme.border, color: theme.text }}
      onClick={onClick}
    >
      <div className="relative z-10">

        <div className="flex justify-between">
          <p>{new Date(data.order_date + 'Z').toLocaleString(undefined, dateTimeFormatLong)}</p>
          <Status statusArray={shipmentStatus} status={data.status}/>
        </div>

        <p className="flex items-center text-lg"><TbMapPin  className="mr-1"/><span className="font-medium">{data.order_warehouse}</span></p>
        <span className="flex items-center text-gray-600"><TbTruckDelivery  className="mr-1 text-lg"/><p>{`${JSON.parse(data.fleet).name} | ${JSON.parse(data.fleet).plate}`}</p></span>
      </div>

    </div>
  )
}

export default ReceiptCard;

export const UpcomingShipmentCard = ({ data = {}, callback = () => {} }) => {
  const { theme } = useStateContext();

  let payload = {
    order_id: data.id || '',
    status: data.status || '',
    products: data.orders ? JSON.stringify(data.orders) : '[]',
    supplier: JSON.stringify(data.supplier) || '',
    fleet: data.fleet ? JSON.stringify(data.fleet) : {},
    order_date: data.date,
    warehouse_id: data.destination.id || '',
    accepted: false,
  };

  const handleAccept = async () => {
    payload.accepted = true;

    try {
      const response = await axios.post('/receipt/create', payload);
      toast.success('Receipt successfully created');
    } catch (error) {
      toast.error('Failed to create receipt', error);
    }

    callback();
  };

  const handleReject = async () => {
    payload.accepted = false;

    try {
      const response = await axios.post('/receipt/create', payload);
      toast.success('Receipt successfully created');
    } catch (error) {
      toast.error('Failed to create receipt', response.error);
    }
  };

  return (
    <div className='border-card flex p-2 md:flex-row flex-col mb-2 hover:shadow-lg shadow-md hover:cursor-pointer duration-200'>
      
      <div>
        <p className="text-xl font-medium">{data.supplier.name}</p>
        <p className="font-medium text-lg text-gray-600">{new Date(data.date).toLocaleString(undefined, dateTimeFormatLong)}</p>

        <div className="flex gap-2 mt-4">

          <p>{data.id}</p>
          <p>{`${data.fleet.name} ${data.fleet.plate}`}</p>

        </div>
        <p>To: {data.destination.name}</p>


      </div>
      <div className='md:w-fit md:h-fit md:mt-auto md:ml-auto w-full mt-2 flex gap-2'>
        <button
          className='border-card font-semibold w-1/2'
          style={{ background: theme.danger, color: theme.text }}
          onClick={handleReject}
        >
          Reject
        </button>
        <button
          className='border-card font-semibold w-1/2'
          style={{ background: theme.accent, color: theme.background }}
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
};