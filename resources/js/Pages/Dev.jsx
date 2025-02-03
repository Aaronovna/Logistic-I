import { useStateContext } from '@/context/contextProvider';
import { generateRandomNumber } from '@/functions/numberGenerator';
import { generateRandomItem,generateRandomItems } from '@/functions/itemGenerator';

import { useEffect, useState } from 'react';
import { filterArray } from '@/functions/filterArray';

const status = [
  'Upcoming',
  'Delivered',
  'Checking',
  'Checked',
  'Success', 'Return'
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
  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const [warehouses, setWarehouses] = useState([]);
  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/infrastructure/get');
      setWarehouses(filterArray(response.data, 'type', [100] ));
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const processProducts = (products) => {
    const allowedQuantities = Array.from({ length: 20 }, (_, i) => (i + 1) * 50); // [50, 100, ..., 1000]
  
    return products.map(product => ({
      id: product.id,
      name: product.name,
      model: product.model,
      brand: product.brand,
      quantity: allowedQuantities[Math.floor(Math.random() * allowedQuantities.length)], // Pick random quantity
    }));
  };

  const generateData = (count) => {
    
    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')

    return Array.from({ length: count }, (_, index) => ({
      id: generateRandomNumber(8),
      fleet: generateRandomItem(fleet),
      supplier: generateRandomItem(suppliers),
      status: 'Upcoming',
      orders: processProducts(generateRandomItems(10,products)),
      date: formattedDate,
      destination: generateRandomItem(warehouses),
    }));
  };

  const generateOrder = () => {

    const date = new Date();
    const formattedDate = date.toISOString().slice(0, 19).replace('T', ' ')
    
    const order = [{
      id: generateRandomNumber(8),
      fleet: generateRandomItem(fleet),
      supplier: generateRandomItem(suppliers),
      status: 'Upcoming',
      orders: processProducts(generateRandomItems(10,products)),
      date: formattedDate,
      destination: generateRandomItem(warehouses),
    }];
    return order;
  };

  useEffect(()=>{
    fetchSuppliers();
    fetchProducts();
    fetchWarehouses();
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
          <button className='border-card mr-2' onClick={() => setOrdersDummyData(generateData(20))}>Generate Data</button>
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
