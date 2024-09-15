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
import { numberComparator } from '@/functions/comparators';

export default function Product({ auth, suppliers }) {
  const [products, setProducts] = useState(null);

  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
  };

  const productColDefs = [
    {
      headerName: "Image", autoHeight: true,
      cellRenderer: (params) => {
        return (
          <div className='flex'>
            <img src={params.data.image_url} alt={params.data.name} />
          </div>
        )
      }
    },
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 1 },
    { field: "price", filter: true, flex: 1, minWidth: 100, maxWidth: 140, comparator: numberComparator },
    { field: "brand", filter: true, flex: 1 },
    { field: "model", filter: true, flex: 1 },
    { field: "category_name", headerName: "Category", filter: true, flex: 1 },
  ];

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      toast.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium text-3xl text-[#004369]">Product</h2>}
    >
      <Head title="Product" />

      <div className="content">
        <div className='flex items-end mb-4'>
          <Card data={products && products.length} name="Products" Icon={TbBox} />
          <button
            className='text-white rounded-lg h-fit py-2 px-2 bg-[#004369] ml-auto hover:scale-105 hover:shadow-xl duration-200 flex items-center'
          >
            <TbPlus size={18} />
            <p className='ml-1'>Add Product</p>
          </button>
        </div>

        <div className=''>
          {products && products.map((product, index) => {
            return (
              <div className='p-2 border-card flex h-28 mb-2' key={index}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className={`w-24 aspect-square outline outline-1 outline-gray-300 rounded-md inline-block`}
                />
                <div className='flex flex-col mx-4'>
                  <p className='text-xl font-semibold text-[#004369]'>{`${product.name} ${product.model}`}</p>
                  <p className='font-medium text-gray-400'>{product.brand}</p>
                  <p className='mt-auto text-gray-400'>{product.category_name}</p>
                </div>
                <span className='h-full bg-gray-300 rounded-sm ml-auto mx-4' style={{ width: '2px' }}></span>
                <div className='w-96 gap-2'>
                  <p className='block mb-2 font-semibold'>{product.supplier_name}</p>
                  <span className='inline-block mr-4'>
                    <p className='text-gray-400'>Buying Price</p>
                    <p className='text-xl font-semibold'>{product.price}</p>
                  </span>
                </div>
              </div>
            )
          })}
        </div>


        {/* <div className='ag-theme-quartz' style={{height: '512px'}}>
          <AgGridReact
            rowData={products}
            columnDefs={productColDefs}
            rowSelection='single'
            onGridReady={onGridReady}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[20,40,80,100]}
            onSelectionChanged={onSelectionChanged}
          />
        </div> */}

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