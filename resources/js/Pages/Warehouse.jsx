import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { Card2 } from '@/Components/Cards';
import { useEffect, useState } from 'react';

import { TbBox } from "react-icons/tb";
import { TbCurrencyPeso } from "react-icons/tb";

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const colDefs = [
  { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
  { field: "name", filter: true, flex: 1 },
  { field: "category_name", flex: 1, minWidth: 120, },
  { field: "supplier_name", flex: 1, minWidth: 120, },
];

export default function Warehouse({ auth }) {
  const { theme, themePreference } = useStateContext();

  const [totalProductValue, setTotalProductValue] = useState(0);
  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const [categories, setCategories] = useState([]);
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category/get/count');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const [suppliers, setSuppliers] = useState([]);
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get('/supplier/get');
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
  }, []);

  useEffect(() => {
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
      header={<h2 className="header" style={{ color: theme.text }}>Warehouse</h2>}
    >
      <Head title="Receipt" />

      <div className="content">
        <div className='border-card p-4 shadow-sm mb-6 flex h-28'>
          <div>
            <p className='text-2xl font-semibold tracking-wider'>Warehouse Name</p>
            <p>Address</p>
          </div>
          <div className='ml-auto'>
            <select className='p-2' name="select_warehouse" id="select_warehouse">
              <option value="0">All Warehouses</option>
              <option value="1">Warehouse 1</option>
            </select>
          </div>
        </div>

        <div className='flex gap-4'>
          <div className='flex flex-col gap-4 w-2/3'>
            <div className='flex items-end gap-4 w-full'>
              <Card2 data={totalProductValue} name="Total Asset Value" Icon={TbCurrencyPeso} className='w-1/2' iconColor={theme.text} />
              <Card2 data={products && products.length} name="Total Products" Icon={TbBox} className='w-1/2' iconColor={theme.text} />
            </div>
            <div className={`w-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '434px' }} >
              <AgGridReact
                rowData={products}
                columnDefs={colDefs}
                rowSelection='single'
                pagination={true}
              /* onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged} */
              />
            </div>
          </div>

          <div className='w-1/3' style={{ color: theme.text }}>
            <div className='flex gap-2 mb-2'>
              <button
                className='border-card w-full font-medium'
                style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
              >
                Add Inventory
              </button>
            </div>
            <div className='border-card p-4 w-full h-[554px] flex flex-col'>
              <div className='flex gap-4'>
                <div className='product-placeholder w-1/2 aspect-square rounded-md bg-contain'></div>
                <div>
                  <p>ID: 100000</p>
                  <p>Restock Point:</p>
                  <p>Stock</p>
                  <p>Price</p>
                </div>
              </div>

              <div className='mt-4'>
                <p>Supplier</p>
                <p>Category</p>
                <p>Name</p>
                <p>Model</p>
                <p>Brand</p>
                <p>Description</p>
              </div>
              <button
                className='border-card ml-auto mt-auto font-medium'
                style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
              >
                Edit Stocks
              </button>

            </div>
          </div>
        </div>

      </div>
    </AuthenticatedLayout>
  );
}
