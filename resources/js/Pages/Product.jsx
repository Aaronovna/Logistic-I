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
import { TbCurrencyPeso } from "react-icons/tb";

import { Card2, ProductCard } from '@/Components/Cards';
import { numberComparator } from '@/functions/comparators';

import { useStateContext } from '@/context/contextProvider';

export default function Product({ auth, suppliers }) {
  const [products, setProducts] = useState(null);
  const [totalProductValue, setTotalProductValue] = useState(0);

  const { theme } = useStateContext();

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

    if (products) {
      setTotalProductValue(products.reduce((sum, product) => sum + parseFloat(product.price), 0).toFixed(2));

      const total = products.reduce((sum, product) => {
        const price = Number(product.price);
        if (isNaN(price)) {
          console.warn('Invalid price:', product.price);
          return sum;
        }
        return sum + price;
      }, 0);

      const formattedTotal = new Intl.NumberFormat('fil-PH', {
        style: 'currency',
        currency: 'PHP',
      }).format(total);

      setTotalProductValue(formattedTotal);
    }

  }, [products]);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium text-3xl" style={{ color: theme.text }}>Product</h2>}
    >
      <Head title="Product" />

      <div className="content">
        <div className='flex items-end mb-4 gap-4'>
          <Card2 data={totalProductValue} name="Total Asset Value" Icon={TbCurrencyPeso} />
          <Card2 data={products && products.length} name="Total Products" Icon={TbBox} />
          <button style={{background:theme.accent, color: theme.background}}
            className='rounded-lg h-fit py-2 px-2 ml-auto hover:scale-105 hover:shadow-xl duration-200 flex items-center'
          >
            <TbPlus size={18} />
            <p className='ml-1'>Add Product</p>
          </button>
        </div>

        <div className=''>
          {products && products.map((product, index) => {
            return (
              <ProductCard product={product} key={index}></ProductCard>
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