import { Link } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { generateRandomNumber } from '@/functions/numberGenerator';
 const odd = [
  {
    id: generateRandomNumber(8),
    fleet:'fleet1234',
    supplier: 'supplier_a',
    orders: [
      'item1',
      'item2',
      'item3',
      'item4',
    ]
  },
  {
    id: generateRandomNumber(8),
    fleet:'fleet5678',
    supplier: 'supplier_b',
    orders: [
      'item1',
      'item2',
      'item3',
      'item4',
    ]
  },
  {
    id: generateRandomNumber(8),
    fleet:'fleet9012',
    supplier: 'supplier_c',
    orders: [
      'item1',
      'item2',
      'item3',
      'item4',
    ]
  },
 ]

export default function Dev() {
  const { theme, ordersDummyData, setOrdersDummyData } = useStateContext();

  return (
    <div style={{ color: theme.text }}>
      <div className='bg-white/10 backdrop-blur-lg'>
        <div className='p-4' style={{ background: theme.background }}>
          <p className='text-2xl'>{`Dummy Data Generator [Pre Integration]`}</p>
        </div>
        <div className='p-4 w-full'>
          <p className='text-2xl my-2'>Receipt</p>
          <hr className='mb-4'/>
          <button className='border-card mr-2' onClick={()=>setOrdersDummyData(odd)}>Generate Order</button>
        </div>
      </div>
    </div>
  );
}
