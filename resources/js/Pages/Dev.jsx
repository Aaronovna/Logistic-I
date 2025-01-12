import { useStateContext } from '@/context/contextProvider';
import { generateRandomNumber } from '@/functions/numberGenerator';
import { generateRandomItem } from '@/functions/itemGenerator';

import { useEffect, useState } from 'react';

const status = [
  'Upcoming',
  'Delivered',
  'Checking',
  'Checked',
  'Success', 'Return'
];

//const orders = ['item1', 'item2', 'item3', 'item4'];
const orders = [
  {
    name: 'abc',
    quantity: 5,
  },
  {
    name: 'xyz',
    quantity: 10,
  }
];

export default function Dev() {
  const { theme, setOrdersDummyData } = useStateContext();

  const [suppliers, setSuppliers] = useState([]);
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/supplier/get');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const generateData = (count) => {
    
    const date = new Date();
    console.log(date);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')
    console.log(formattedDate);

    return Array.from({ length: count }, (_, index) => ({
      id: generateRandomNumber(8),
      fleet: generateRandomItem(fleet),
      supplier: generateRandomItem(suppliers),
      status: generateRandomItem(status),
      orders: [...orders],
      date: formattedDate,
      destination: generateRandomItem(['Warehouse 1', 'Warehouse 2']),
    }));
  };

  const generateOrder = () => {

    const date = new Date();
    console.log(date);
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')
    console.log(formattedDate);
    
    return [{
      id: generateRandomNumber(8),
      fleet: generateRandomItem(fleet),
      supplier: generateRandomItem(suppliers),
      status: 'Upcoming',
      orders: [...orders],
      date: formattedDate,
      destination: generateRandomItem(['Warehouse 1', 'Warehouse 2']),
    }];
  };

  useEffect(()=>{
    fetchSuppliers();
  },[])

  return (
    <div style={{ color: theme.text }}>
      <div className='bg-white/10 backdrop-blur-lg'>
        <div className='p-4' style={{ background: theme.background }}>
          <p className='text-2xl'>{`Dummy Data Generator [Pre Integration]`}</p>
        </div>
        <div className='p-4 w-full'>
          <p className='text-2xl my-2'>Receipt</p>
          <hr className='mb-4' />
          <button className='border-card mr-2' onClick={() => setOrdersDummyData(generateOrder())}>Generate Order</button>
          <button className='border-card mr-2' onClick={() => setOrdersDummyData(generateData(100))}>Generate Data</button>
        </div>
      </div>
    </div>
  );
}

const fleet = [
  { name: "City Van", plate: "AB1234CD" },
  { name: "Cargo Truck", plate: "EF5678GH" },
  { name: "Express Hauler", plate: "IJ9101KL" },
  { name: "Logistics Carrier", plate: "MN2345OP" },
  { name: "Freight Transporter", plate: "QR6789ST" },
  { name: "Delivery Mover", plate: "UV0123WX" },
  { name: "Transit Liner", plate: "YZ4567AB" },
  { name: "Fleet Wagon", plate: "CD8901EF" },
  { name: "Highway Shuttle", plate: "GH2345IJ" },
  { name: "Utility Freighter", plate: "KL6789MN" },
];
