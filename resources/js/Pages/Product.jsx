import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { TbPlus } from "react-icons/tb";
import { TbBox } from "react-icons/tb";
import { TbCurrencyPeso } from "react-icons/tb";
import { TbSearch } from "react-icons/tb";
import { TbDownload } from "react-icons/tb";
import { TbUpload } from "react-icons/tb";

import { useStateContext } from '@/context/contextProvider';

import { Card2, ProductCard } from '@/Components/Cards';
import PopperMenu from '@/Components/PopperMenu';
import Modal from '@/Components/Modal';

export default function Product({ auth }) {
  const [products, setProducts] = useState(null);
  const [totalProductValue, setTotalProductValue] = useState(0);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);

  const { theme } = useStateContext();

  const product_image_placeholder = 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png';

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

  const [addProductFormData, setAddProductFormData] = useState({
    name: '',
    model: '',
    brand: '',
    description: '',
    image_url: '',
    price: '',
    restock_point: '',
    category_id: '',
    supplier_id: '',
    /* stock: 0, */
  });

  const handleAddProductInputChange = (e) => {
    const { name, value } = e.target;
    setAddProductFormData({ ...addProductFormData, [name]: value });
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/product/store', addProductFormData);

      toast.success('Product added successfully');
      fetchProducts();
      setOpenAddProductModal(false);
    } catch (error) {
      toast.error('Failed to add product' + error);
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
            onClick={() => setOpenAddProductModal(true)}
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

        <Pagination
          products={products}
          filteredProducts={filteredProducts}
          searchedProduct={searchedProduct}
        />

        {/* ALTERNATIVE LOGIC */}
        {/* <div className=''>
          {(filteredProducts && filteredProducts.length > 0 ? filteredProducts : products).map((product, index) => (
            <ProductCard product={product} key={index} />
          ))}
        </div> */}

        <Modal show={openAddProductModal} onClose={() => setOpenAddProductModal(false)} maxWidth={'2xl'}>
          <div className='p-4'>
            <p className='font-semibold text-xl mt-2 mb-4' style={{ color: theme.text }}>Add Product</p>
            <form onSubmit={handleAddProductSubmit}>
              <div className='flex gap-2 mb-4'>
                <div className='w-52 aspect-square border-card overflow-hidden'
                  style={{ background: `url(${product_image_placeholder})`, backgroundSize: '100%' }}>
                  {addProductFormData.image_url === ''
                    ? null
                    : <img className='w-full h-full' src={addProductFormData.image_url} alt="Can't load image :(" />
                  }
                </div>
                <div className='flex flex-col flex-1 gap-2'>
                  <select className='border-card' name="category_id" id="category_id" onChange={handleAddProductInputChange}>
                    <option value={null}>Select Category</option>
                    {categories.map((category, index) => {
                      return (
                        <option key={index} value={category.id}>{category.name}</option>
                      )
                    })}
                  </select>
                  <select className='border-card' name="supplier_id" id="supplier_id" onChange={handleAddProductInputChange}>
                    <option value={null}>Select Supplier</option>
                    {suppliers.map((supplier, index) => {
                      return (
                        <option key={index} value={supplier.id}>{supplier.name}</option>
                      )
                    })}
                  </select>
                  <div className='flex gap-2'>
                    <input type="number" name="price" id="price" placeholder="Price"
                      className='border-card'
                      value={addProductFormData.price}
                      onChange={handleAddProductInputChange}
                    />
                    <input type="number" name="restock_point" id="restock_point" placeholder="Restock Point"
                      className='border-card'
                      value={addProductFormData.restock_point}
                      onChange={handleAddProductInputChange}
                    />
                  </div>
                  <input type="text" name="image_url" id="image_url" placeholder="Image URL"
                    className='border-card'
                    value={addProductFormData.image_url}
                    onChange={handleAddProductInputChange}
                  />
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-2'>
                  <input type="text" name="name" id="name" placeholder="Name"
                    className='border-card w-2/3'
                    value={addProductFormData.name}
                    onChange={handleAddProductInputChange}
                  />
                  <input type="text" name="model" id="model" placeholder="Model"
                    className='border-card w-1/3'
                    value={addProductFormData.model}
                    onChange={handleAddProductInputChange}
                  />
                </div>
                <input type="text" name="brand" id="brand" placeholder="Brand"
                  className='border-card w-full'
                  value={addProductFormData.brand}
                  onChange={handleAddProductInputChange}
                />
                <textarea type="text" name="description" id="description" placeholder="Description"
                  rows={6}
                  className='border-card w-full resize-none'
                  value={addProductFormData.description}
                  onChange={handleAddProductInputChange}
                />
                <button
                  style={{ background: theme.primary, borderColor: theme.border }}
                  className='border-card p-2 font-medium ml-auto text-white'>
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </Modal>


      </div>
    </AuthenticatedLayout>
  );
}

const Pagination = ({ products, filteredProducts, searchedProduct }) => {
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
            <ProductCard product={product} key={index} className={`${searchedProduct !== '' ? 'hidden' : 'block'}`} />
          ))
        )}
      </div>
      <div
        style={{ outlineColor: theme.border }}
        className={`w-full flex outline-card bottom-4 sticky ml-auto backdrop-blur-sm ${searchedProduct === '' ? 'visible' : 'invisible'}`}
      >
        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2 rounded-l-md'
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          {'<'}
        </button>
        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2'
          onClick={() => handlePageChange(1)}
        >
          {'<<'}
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
              className={`flex-1`}
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
          {'>>'}
        </button>
        <button
          style={{ background: theme.accent, color: theme.background }}
          className='p-2 rounded-r-md'
          disabled={currentPage === totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          {'>'}
        </button>
      </div>
    </div>
  );
};