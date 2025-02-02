import { useStateContext } from "@/context/contextProvider";
import { feedbackLight } from "@/Constants/themes";

import { TbTruckLoading } from "react-icons/tb";
import { TbTruckDelivery } from "react-icons/tb";
import { TbClipboardList } from "react-icons/tb";
import { TbCircleCheck } from "react-icons/tb";
import { TbCircleX } from "react-icons/tb";
import { TbClipboardCheck } from "react-icons/tb";

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true, // Use 12-hour format
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // User's local timezone
};

const I = ({ Icon, color }) => {
  return (
    <div className="absolute -bottom-10 -right-12 z-0 rounded-full border-[8px] p-4" style={{ borderColor: color }}>
      <Icon size={96} color={color} />
    </div>
  )
}

const ReceiptCard = ({ data = {}, onClick = () => {} }) => {
  const { theme } = useStateContext();

  return (
    <div
      className="relative min-w-60 border-card p-4 cursor-pointer hover:shadow-lg shadow-none shadow-gray-300 duration-200 overflow-hidden"
      style={{ borderColor: theme.border, color: theme.text }}
      onClick={onClick}
    >
      <div className="relative z-10">
        <p className="font-semibold">{new Date(data.order_date + 'Z').toLocaleString('en-PH', options)}</p>
        <p className="font-semibold">{data.status}</p>
        <p className="font-semibold">{data.id}</p>
        <p className="text-lg">{data.supplier_id}</p>
        <p>{`${JSON.parse(data.fleet).name} ${JSON.parse(data.fleet).plate}`}</p>
        <p>{data.destination}</p>
      </div>

      {data.status === "Upcoming" && <I Icon={TbTruckDelivery} color={feedbackLight.warning} />}
      {data.status === "Delivered" && <I Icon={TbTruckLoading} color={feedbackLight.info} />}
      {data.status === "Checking" && <I Icon={TbClipboardList} color='#c8b3f4' />}
      {data.status === "Checked" && <I Icon={TbClipboardCheck} color={feedbackLight.info} />}
      {data.status === "Success" && <I Icon={TbCircleCheck} color={feedbackLight.success} />}
      {data.status === "Return" && <I Icon={TbCircleX} color={feedbackLight.danger} />}

    </div>
  )
}

export default ReceiptCard;

export const UpcomingShipmentCard = ({ data }) => {
  const { theme } = useStateContext();

  let payload = {
    order_id: data.id || '',
    status: data.status || '',
    products: data.orders ? JSON.stringify(data.orders) : '[]',
    supplier: JSON.stringify(data.supplier) || '',
    fleet: data.fleet ? JSON.stringify(data.fleet) : {},
    order_date: data.date,
    destination: data.destination || '',
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
    <div className='relative border-card flex p-2 md:flex-row flex-col mb-2 hover:shadow-md hover:cursor-pointer duration-200'>
      <div className='mb-2'>
        <p className='font-semibold'>{data.status}</p>
        <p>{data.date.toString()}</p>
        <p>{data.id}</p>
        <p>{`${data.fleet.name} ${data.fleet.plate}`}</p>
        <p>{data.supplier.name}</p>
        <p>{data.destination}</p>
      </div>
      <div className='w-fit h-fit mt-auto ml-auto'>
        <button
          className='border-card mr-2 font-semibold'
          style={{ background: theme.danger, color: theme.text }}
          onClick={handleReject}
        >
          Reject
        </button>
        <button
          className='border-card font-semibold'
          style={{ background: theme.accent, color: theme.background }}
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
};