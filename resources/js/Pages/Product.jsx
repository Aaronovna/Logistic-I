import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { TbPlus } from "react-icons/tb";
import { TbBox } from "react-icons/tb";

import Card from '@/Components/Card';

export default function Product({ auth, suppliers }) {
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
  };

  const productColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 1 },
    { field: "price", filter: true, flex: 1, minWidth: 100, maxWidth: 140, },
    { field: "brand", filter: true, flex: 1 },
    { field: "model", filter: true, flex: 1 },
  ]; 

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium text-3xl text-[#004369]">Product</h2>}
    >
      <Head title="Product" />

      <div className="mx-4">
        <div className='flex items-end mb-4'>
        <Card data={productDummyData && productDummyData.length} name="Products" Icon={TbBox}/>
            <button
              className='text-white rounded-lg h-fit py-2 px-2 bg-[#004369] ml-auto hover:scale-105 hover:shadow-xl duration-200 flex items-center'
            >
              <TbPlus size={18} />
              <p className='ml-1'>Add Product</p>
            </button>
          </div>
        <div className='ag-theme-quartz h-96'>
          <AgGridReact
            rowData={productDummyData}
            columnDefs={productColDefs}
            rowSelection='single'
            onGridReady={onGridReady}
            pagination={true}
            /* onSelectionChanged={onSelectionChanged} */
          />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

const productDummyData = [
  {
    id: 1234,
    name: "Smartphone X12",
    brand: "TechBrand",
    model: "X12 Pro",
    description: "The latest smartphone with advanced features, 5G support, and a powerful camera.",
    price: 899.99,
  },
  {
    id: 1235,
    name: "Laptop UltraBook",
    brand: "ComputeTech",
    model: "UltraBook 2023",
    description: "Lightweight laptop with 16GB RAM, 1TB SSD, and a high-resolution display.",
    price: 1299.99,
  },
  {
    id: 1236,
    name: "Wireless Headphones",
    brand: "SoundMax",
    model: "WH500",
    description: "Noise-canceling wireless headphones with 40 hours of battery life and high-fidelity sound.",
    price: 199.99,
  },
  {
    id: 1237,
    name: "Smart TV 55\"",
    brand: "VisionPlus",
    model: "VP55UHD",
    description: "55-inch 4K UHD smart TV with HDR support and built-in streaming apps.",
    price: 699.99,
  },
  {
    id: 1238,
    name: "Smartwatch GT5",
    brand: "FitTech",
    model: "GT5",
    description: "Fitness smartwatch with heart rate monitoring, GPS, and 7-day battery life.",
    price: 149.99,
  },
];