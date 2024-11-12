import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { TbPlus } from "react-icons/tb";
import { TbSearch } from "react-icons/tb";

import { TbPackage } from "react-icons/tb";
import { TbPackages } from "react-icons/tb";
import { TbCaretDownFilled } from "react-icons/tb";
import { TbPackageOff } from "react-icons/tb";


import { useStateContext } from '@/context/contextProvider';

import { Card2 } from '@/Components/Cards';
import { ProductCard } from '@/Components/cards/ProductCard';

import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import { feedbackVibrant } from "@/Constants/themes";
import { productToastMessages } from '@/Constants/toastMessages';

const cardStyle = 'mb-2 snap-center mx-2 md:min-w-64 inline-block min-w-[100%]';

export default function Product({ auth }) {
  const [products, setProducts] = useState([]);
  const [totalProductValue, setTotalProductValue] = useState(0);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);

  const { theme } = useStateContext();

  const product_image_placeholder = 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png';

  const [productStats, setProductStats] = useState({});

  const fetchProductStats = async () => {
    try {
      const response = await axios.get('/product/get/stats');
      setProductStats(response.data);
    } catch (error) {
      toast.error('product stat error', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const updateData = () => {
    fetchProducts();
    fetchProductStats();
  };

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchedProduct, setSearchedProduct] = useState("");

  const handleSearchProducts = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setSearchedProduct(searchQuery);

    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(product =>
      product.id.toString().toLowerCase().includes(searchQuery) ||
      product.price.toString().toLowerCase().includes(searchQuery) ||
      product.stock.toString().toLowerCase().includes(searchQuery) ||
      product.name.toLowerCase().includes(searchQuery) ||
      product.brand.toLowerCase().includes(searchQuery) ||
      product.model.toLowerCase().includes(searchQuery) ||
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

      toast.success(productToastMessages.store.success);
      fetchProducts();
      fetchProductStats();
      setOpenAddProductModal(false);
    } catch (error) {
      toast.error(productToastMessages.store.error, error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchProductStats();
  }, []);

  useEffect(() => {
    setFilteredProducts([]);
    setSearchedProduct("");
  }, [products]);

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

  const renderProductItem = (product, index) => (
    <ProductCard
      product={product}
      key={index}
      list={['Edit', 'Delete']}
      categories={categories}
      suppliers={suppliers}
      update={updateData}
    />
  );

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Product</h2>}
    >
      <Head title="Product" />

      <div className="content">
        <div className='md:items-end mb-2 md:mb-0 md:gap-4 overflow-x-auto snap-mandatory snap-x pb-1 whitespace-nowrap'>
          <Card2 data={productStats?.totalStock} name="Total Stocks" className={cardStyle} Icon={TbPackages} iconColor={feedbackVibrant.info} />
          <Card2 data={productStats?.totalProducts} name="Total Products" className={cardStyle} Icon={TbPackage} iconColor={feedbackVibrant.success} />
          <Card2 data={productStats?.lowStockProducts} name="Low on Stock" className={cardStyle} Icon={TbCaretDownFilled} iconColor={feedbackVibrant.warning} />
          <Card2 data={productStats?.outOfStockProducts || 0} name="Out of Stock" className={cardStyle} Icon={TbPackageOff} iconColor={feedbackVibrant.danger} />
        </div>

        <div className='flex sm:flex-row flex-col md:flex-row w-full gap-4 mb-4'>
          <span className='flex w-full relative items-center outline-card overflow-hidden ' style={{ outlineColor: theme.border }}>
            <span className='absolute pl-2'><TbSearch size={24} color={theme.border} /></span>
            <input
              type="text"
              placeholder="Search product's name, model or brand..."
              style={{ color: theme.text }}
              className='pl-10 w-full border-none bg-transparent p-2'
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

        <p
          style={{ color: theme.danger }}
          className={`w-full text-center p-2 font-medium text-2xl ${filteredProducts.length === 0 && searchedProduct ? '' : 'hidden'}`}>
          No Product Found
        </p>

        <div className='w-full'>
          <Pagination
            data={products}
            filteredData={filteredProducts}
            itemsPerPage={10}
            renderItem={renderProductItem}
            theme={theme}
            hidePage={!filteredProducts.length === 0}
          />
        </div>

        {/* ALTERNATIVE LOGIC */}
        {/* <div className=''>
          {(filteredProducts && filteredProducts.length > 0 ? filteredProducts : products).map((product, index) => (
            <ProductCard product={product} key={index} />
          ))}
        </div> */}

        <Modal show={openAddProductModal} onClose={() => setOpenAddProductModal(false)} maxWidth={'2xl'}>
          <div className='p-4' style={{ color: theme.text }}>
            <p className='font-semibold text-xl mt-2 mb-4'>Add Product</p>
            <form onSubmit={handleAddProductSubmit}>
              <div className='flex gap-2 mb-4'>
                <div className='w-52 aspect-square border-card overflow-hidden product-placeholder bg-contain'
                  style={{ backgroundSize: '100%' }}>
                  {addProductFormData.image_url === ''
                    ? null
                    : <img className='w-full h-full' src={addProductFormData.image_url} alt="Can't load image :(" />
                  }
                </div>
                <div className='flex flex-col flex-1 gap-2'>
                  <select className='border-card bg-transparent' style={{ borderColor: theme.border }} name="category_id" id="category_id" onChange={handleAddProductInputChange}>
                    <option value={null} style={{ background: theme.background }}>Select Category</option>
                    {categories.map((category, index) => {
                      return (
                        <option style={{ background: theme.background }} key={index} value={category.id}>{category.name}</option>
                      )
                    })}
                  </select>
                  <select className='border-card bg-transparent' style={{ borderColor: theme.border }} name="supplier_id" id="supplier_id" onChange={handleAddProductInputChange}>
                    <option value={null} style={{ background: theme.background }}>Select Supplier</option>
                    {suppliers.map((supplier, index) => {
                      return (
                        <option style={{ background: theme.background }} key={index} value={supplier.id}>{supplier.name}</option>
                      )
                    })}
                  </select>
                  <div className='flex gap-2'>
                    <input type="number" name="price" id="price" placeholder="Price"
                      className='border-card bg-transparent'
                      style={{ borderColor: theme.border }}
                      value={addProductFormData.price}
                      onChange={handleAddProductInputChange}
                    />
                    <input type="number" name="restock_point" id="restock_point" placeholder="Restock Point"
                      className='border-card bg-transparent'
                      style={{ borderColor: theme.border }}
                      value={addProductFormData.restock_point}
                      onChange={handleAddProductInputChange}
                    />
                  </div>
                  <input type="text" name="image_url" id="image_url" placeholder="Image URL"
                    className='border-card bg-transparent'
                    style={{ borderColor: theme.border }}
                    value={addProductFormData.image_url}
                    onChange={handleAddProductInputChange}
                  />
                </div>
              </div>
              <div className='flex flex-col gap-2'>
                <div className='flex gap-2'>
                  <input type="text" name="name" id="name" placeholder="Name"
                    className='border-card w-2/3 bg-transparent'
                    style={{ borderColor: theme.border }}
                    value={addProductFormData.name}
                    onChange={handleAddProductInputChange}
                  />
                  <input type="text" name="model" id="model" placeholder="Model"
                    className='border-card w-1/3 bg-transparent'
                    style={{ borderColor: theme.border }}
                    value={addProductFormData.model}
                    onChange={handleAddProductInputChange}
                  />
                </div>
                <input type="text" name="brand" id="brand" placeholder="Brand"
                  className='border-card w-full bg-transparent'
                  style={{ borderColor: theme.border }}
                  value={addProductFormData.brand}
                  onChange={handleAddProductInputChange}
                />
                <textarea type="text" name="description" id="description" placeholder="Description"
                  rows={6}
                  className='border-card w-full resize-none bg-transparent'
                  style={{ borderColor: theme.border }}
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