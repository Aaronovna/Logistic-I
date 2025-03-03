import { dateTimeFormatLong } from "@/Constants/options";
import { TbMapPin } from 'react-icons/tb';
import { TbTruckDelivery } from "react-icons/tb";
import useRole from "@/hooks/useRole";

import Status from "../Status";
import { shipmentStatus } from "@/Constants/status";

const ReceiptCard = ({ data = {}, onClick = () => { } }) => {

  return (
    <div
      className="relative min-w-60 border-card p-4 cursor-pointer hover:shadow-lg shadow-md duration-200 overflow-hidden h-fit hover:bg-hbg"
      onClick={onClick}
    >
      <div className="relative z-10 text-text">
        <div className="flex justify-between">
          <p>{new Date(data.order_date + 'Z').toLocaleString(undefined, dateTimeFormatLong)}</p>
          <Status statusArray={shipmentStatus} status={data.status} />
        </div>

        <p className="flex items-center text-lg">
          <TbMapPin className="mr-1" />
          <span className="font-medium">{data.order_warehouse}</span>
        </p>
        <p className="flex items-center text-neutral">
          <TbTruckDelivery className="mr-1 text-lg" />
          <span>{`${JSON.parse(data.fleet).name} | ${JSON.parse(data.fleet).plate}`}</span>
        </p>
      </div>
    </div>
  )
}

export default ReceiptCard;

export const UpcomingShipmentCard = ({ data = {}, callback = () => { } }) => {
  const { hasPermissions } = useRole();

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
    callback();
  };

  return (
    <div className='border-card flex p-2 md:flex-row flex-col mb-2 hover:shadow-lg shadow-md hover:cursor-pointer duration-200 text-text'>

      <div>
        <p className="font-medium text-lg">{new Date(data.date).toLocaleString(undefined, dateTimeFormatLong)}</p>

        <p className="text font-medium mt-2">{data.supplier.name}<span className="ml-2 text-neutral">{data.id}</span></p>

        <p className="flex items-center text-neutral mt-4">
          <TbTruckDelivery className="mr-1 text-lg" />
          <span>{`${data.fleet.name} | ${data.fleet.plate}`}</span>
        </p>
        <p className="flex items-center text-lg text-neutral">
          <TbMapPin className="mr-1" />
          <span className="font-medium">{data.destination.name}</span>
        </p>


      </div>
      <div className='md:w-fit md:h-fit md:mt-auto md:ml-auto w-full mt-2 flex gap-2'>
        <button
          className='btn bg-red-200 text-[#050315] hover:bg-red-400 disable'
          onClick={handleReject}
          disabled={!hasPermissions([302])}
        >
          Reject
        </button>
        <button
          className='btn bg-accent text-background hover:bg-primary disable'
          onClick={handleAccept}
          disabled={!hasPermissions([302])}
        >
          Accept
        </button>
      </div>
    </div>
  );
};