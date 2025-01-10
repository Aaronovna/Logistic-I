import { useStateContext } from '@/context/contextProvider';
import { generateRandomNumber } from '@/functions/numberGenerator';
import { generateRandomItem } from '@/functions/itemGenerator';

const status = [
  'Out for Delivery',
  'Delivered',
  'Checked',
  'Checking',
  'Accepted', 'Rejected'
];

const orders = ['item1', 'item2', 'item3', 'item4'];

const generateData = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: generateRandomNumber(8),
    fleet: `fleet ${index + 1}`,
    supplier: `supplier ${index + 1}`,
    status: generateRandomItem(status),
    orders: [...orders],
  }));
};

export default function Dev() {
  const { theme, setOrdersDummyData } = useStateContext();

  return (
    <div style={{ color: theme.text }}>
      <div className='bg-white/10 backdrop-blur-lg'>
        <div className='p-4' style={{ background: theme.background }}>
          <p className='text-2xl'>{`Dummy Data Generator [Pre Integration]`}</p>
        </div>
        <div className='p-4 w-full'>
          <p className='text-2xl my-2'>Receipt</p>
          <hr className='mb-4' />
          <button className='border-card mr-2' onClick={() => setOrdersDummyData(generateData(100))}>Generate Order</button>
        </div>
      </div>
    </div>
  );
}
