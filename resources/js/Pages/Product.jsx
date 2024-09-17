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
import { TbSearch } from "react-icons/tb";

import { Card2, ProductCard } from '@/Components/Cards';
import { numberComparator } from '@/functions/comparators';

import { useStateContext } from '@/context/contextProvider';

export default function Product({ auth }) {
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

  const [filteredProducts, setFilteredProducts] = useState(null);
  const [searchedProduct, setSearchedProduct] = useState("");

  const handleSearchProducts = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setSearchedProduct(searchQuery);

    if (searchQuery.trim() === "") {
      setFilteredProducts(null);
      return;
    }

    const filtered = products.filter(product =>
      product.id.toString().toLowerCase().includes(searchQuery) ||
      product.price.toString().toLowerCase().includes(searchQuery) ||
      product.stock.toString().toLowerCase().includes(searchQuery) ||
      product.name.toLowerCase().includes(searchQuery) ||
      product.brand.toLowerCase().includes(searchQuery) ||
      product.category_name.toLowerCase().includes(searchQuery) ||
      product.supplier_name.toLowerCase().includes(searchQuery)
    );

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    fetchProducts();
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
      header={<h2 className="font-medium md:text-3xl text-xl" style={{ color: theme.text }}>Product</h2>}
    >
      <Head title="Product" />

      <div className="content">
        <div className='flex items-end mb-4 gap-4'>
          <Card2 data={totalProductValue} name="Total Asset Value" Icon={TbCurrencyPeso} />
          <Card2 data={products && products.length} name="Total Products" Icon={TbBox} />
        </div>

        <div className='flex w-full gap-4 mb-4'>
          <span className='flex w-full relative items-center outline-card overflow-hidden ' style={{ outlineColor: theme.border }}>
            <span className='absolute pl-2'><TbSearch size={24} color={theme.border} /></span>
            <input
              type="text"
              placeholder="Search product's name, model or brand..."
              style={{ color: theme.text }}
              className='pl-10 w-full border-none bg-transparent'
              value={searchedProduct}
              onChange={handleSearchProducts}
            />
          </span>
          <button style={{ background: theme.accent, color: theme.background }}
            className='rounded-lg  h-fit py-2 px-2 hover:scale-105 hover:shadow-xl duration-200 flex items-center'
          >
            <TbPlus size={18} />
            <p className='ml-1 text-nowrap'>Add Product</p>
          </button>
        </div>

        <p style={{ color: theme.danger }}
          className={`w-full text-center p-2 font-medium text-2xl 
            ${filteredProducts === null || filteredProducts.length !== 0 ? 'invisible hidden' : 'visible'}`
          }>
          No Product Found
        </p>

        {/* <div className=''>
          {filteredProducts && filteredProducts.length > 0 ? (
            filteredProducts.map((product, index) => (
              <ProductCard product={product} key={index} />
            ))
          ) : (
            products && products.map((product, index) => (
              <ProductCard product={product} key={index} />
            ))
          )}
        </div> */}

        <Pagination
          products={products}
          filteredProducts={filteredProducts}
        />

        {/* ALTERNATIVE LOGIC */}
        {/* <div className=''>
          {(filteredProducts && filteredProducts.length > 0 ? filteredProducts : products).map((product, index) => (
            <ProductCard product={product} key={index} />
          ))}
        </div> */}

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

const Pagination = ({ products, filteredProducts }) => {
  const { theme } = useStateContext();
  const [currentPage, setCurrentPage] = useState(1);

  // Configurable number of items per page
  const itemsPerPage = 20;

  let totalPages;
  let currentData;

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate total number of pages
  totalPages = Math.ceil(products && products.length / itemsPerPage);

  // Get current items based on the currentPage
  if (products) {
    currentData = products.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }

  useEffect(() => {

  }, []);

  return (
    <div className="pagination relative">

      <div className=''>
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product, index) => (
            <ProductCard product={product} key={index} />
          ))
        ) : (
          currentData && currentData.map((product, index) => (
            <ProductCard product={product} key={index} />
          ))
        )}
      </div>

      <div
        style={{ outlineColor: theme.border }}
        className='w-full flex justify-center outline-card bottom-4 sticky'
      >
        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2 rounded-l-md'
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          Prev
        </button>
        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2'
          onClick={() => handlePageChange(1)}
        >
          First
        </button>

        {[...Array(20)].map((_, index) => {
          // Calculate the start and end range for buttons
          let startPage = Math.max(1, currentPage - 9); // Start from 1 or currentPage - 5
          let endPage = startPage + 19; // Show 10 pages

          // Adjust the startPage if you are near the last pages
          if (endPage > totalPages) {
            endPage = totalPages; // Ensure endPage doesn't exceed totalPages
            startPage = Math.max(1, totalPages - 19); // Adjust startPage accordingly
          }

          const pageNumber = startPage + index;

          // Don't render a button if it exceeds the totalPages
          if (pageNumber > totalPages) return null;

          return (
            <button
              key={index}
              onClick={() => handlePageChange(pageNumber)}
              className={`flex-1 backdrop-blur-sm`}
              style={{
                background: currentPage === pageNumber ? theme.secondary : theme.blur,
                color: theme.text,
              }}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2'
          onClick={() => handlePageChange(totalPages)}
        >
          Last
        </button>
        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2 rounded-r-md'
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};