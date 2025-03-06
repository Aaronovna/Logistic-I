import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import useRole from '@/hooks/useRole';
import Pagination from '@/Components/Pagination';
import { Card2 } from '@/Components/Cards';
import { ProductCard } from '@/Components/cards/ProductCard';
import { feedbackVibrant } from "@/Constants/themes";
import { Badge } from '@/Components/Status';

import { TbPlus } from "react-icons/tb";
import { TbSearch } from "react-icons/tb";
import { TbPackage } from "react-icons/tb";
import { TbPackages } from "react-icons/tb";
import { TbCaretDownFilled } from "react-icons/tb";
import { TbPackageOff } from "react-icons/tb";
import { TbAlertTriangle } from 'react-icons/tb';
import { TbSparkles } from 'react-icons/tb';
import useGemini from '@/hooks/useGemini';
import usePrediction from '@/hooks/usePrediction';
import { generateDemandData } from './Dev';
import { product_intruction } from '@/Constants/instructions';
import { useConfirmation } from '@/context/confirmationProvider';

import IMAGE_PLACEHOLDER from "../../../public/assets/images/image-placeholder.png"

const cardStyle = 'mb-2 snap-center mx-2 md:min-w-64 inline-block min-w-[100%]';

const Product = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);
  const { confirm } = useConfirmation();

  const [products, setProducts] = useState([]);
  const [totalProductValue, setTotalProductValue] = useState(0);
  const [openAddProductModal, setOpenAddProductModal] = useState(false);
  const { prompt, promptBuilder, loading } = useGemini();
  const [response, setResponse] = useState('');
  const [viewReport, setViewReport] = useState(false);

  const [prediction, setPrediction] = useState();
  const { getPrediction } = usePrediction();

  const { theme } = useStateContext();

  const product_image_placeholder = 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png';

  const [totalStocks, setTotalStocks] = useState();
  const [low, setLow] = useState();
  const [out, setOut] = useState();
  const fetchStats = async () => {
    try {
      const response = await axios.get('/inventory/total/stock');
      setTotalStocks(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/inventory/low/count');
      setLow(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/inventory/out/count');
      setOut(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
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
      setCategories(response.data.data);
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
  });

  const handleAddProductInputChange = (e) => {
    const { name, value } = e.target;
    setAddProductFormData({ ...addProductFormData, [name]: value });
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/product/store', addProductFormData);
      fetchProducts();
      fetchStats();
      setOpenAddProductModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSuppliers();
    fetchStats();
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
      onClick={() => onProductClick(product)}
      className='mx-4 hover:scale-[102%] hover:shadow-md mb-3'
    />
  );

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openViewProductModal, setOpenViewProductModal] = useState(false);

  const onProductClick = (data) => {
    setSelectedProduct(data);
    setOpenViewProductModal(true);

    let demands
    if (data.id === 100000) {
      demands = generateDemandData(30, 1, 10);
    } else if (data.id === 100001) {
      demands = generateDemandData(30, 30, 60);
    } else if (data.id === 100002) {
      demands = generateDemandData(30, 50, 100);
    } else {
      demands = generateDemandData(30, 1, 100);
    }
    getPrediction(data.id, demands, setPrediction);
    getProductTurnoverRate(data.id);
  }

  const [openEditProductModal, setOpenEditProductModal] = useState(false);

  const [editProductFormData, setEditProductFormData] = useState({});

  const handleEditProductInputChange = (e) => {
    const { name, value } = e.target;
    setEditProductFormData({ ...editProductFormData, [name]: value });
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/product/update/${selectedProduct.id}`, editProductFormData);
      toast.success(response.data.message);
      setOpenEditProductModal(false);
      setOpenViewProductModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await axios.delete(`/product/delete/${id}}`);
      toast.success(response.data.message);
      setOpenViewProductModal(false);
      fetchProducts();
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setEditProductFormData({
        name: selectedProduct.name,
        model: selectedProduct.model,
        brand: selectedProduct.brand,
        description: selectedProduct.description,
        image_url: selectedProduct.image_url,
        price: selectedProduct.price,
        restock_point: selectedProduct.restock_point,
        category_id: selectedProduct.category_id,
        supplier_id: selectedProduct.supplier_id,
      })
    }
  }, [selectedProduct]);

  const generateReport = () => {
    if (!response) {
      prompt(promptBuilder('Product', selectedProduct, product_intruction), setResponse);
    }
    setViewReport(true);
  }

  const [prodTurnoverRate, setProdTurnoverRate] = useState('');

  const getProductTurnoverRate = async (id) => {
    try {
      const response = await axios.get(`/inventory/turnover/${id}/90`);
      setProdTurnoverRate(response.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Product" />

      <Layout user={auth.user} header={<NavHeader headerName="Product" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content">
            <div className='md:items-end mb-2 md:mb-0 md:gap-4 overflow-x-auto snap-mandatory snap-x pb-1 whitespace-nowrap'>
              <Card2 data={totalStocks && totalStocks.total_quantity} name="Total Stocks" className={cardStyle} Icon={TbPackages} iconColor={feedbackVibrant.info} />
              <Card2 data={products && products.length} name="Total Products" className={cardStyle} Icon={TbPackage} iconColor={feedbackVibrant.success} />
              <Card2 data={low && low.low_stock_count} name="Low on Stock" className={cardStyle} Icon={TbCaretDownFilled} iconColor={feedbackVibrant.warning} />
              <Card2 data={out && out.out_of_stock_count} name="Out of Stock" className={cardStyle} Icon={TbPackageOff} iconColor={feedbackVibrant.danger} />
            </div>

            <div className='flex sm:flex-row flex-col md:flex-row w-full gap-4 mb-4 mt-4'>
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
              <button className='btn disable'
                disabled={!hasPermissions([332])}
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

            <Modal show={openAddProductModal} onClose={() => setOpenAddProductModal(false)} maxWidth={'2xl'} name="Add new product">
              <div style={{ color: theme.text }}>
                <form onSubmit={handleAddProductSubmit}>
                  <div className='flex gap-2 mb-4'>
                    <div className='w-48 border-card p-0 overflow-hidden product-placeholder bg-contain'
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

                      <div className='flex gap-2 w-full'>
                        <input type="number" name="price" id="price" placeholder="Price"
                          className='border-card bg-transparent w-1/2'
                          style={{ borderColor: theme.border }}
                          value={addProductFormData.price}
                          onChange={handleAddProductInputChange}
                        />
                        <input type="number" name="restock_point" id="restock_point" placeholder="Restock Point"
                          className='border-card bg-transparent w-1/2'
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
                    <button className='btn disable ml-auto'
                      disabled={!hasPermissions([332])}
                    >
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            </Modal>

            <Modal name={`${selectedProduct?.name} ${selectedProduct?.model}`} show={openViewProductModal} onClose={() => { setOpenViewProductModal(false); setResponse('') }}>
              <div>
                <div className={`relative w-full h-56 rounded-lg overflow-y-auto ${selectedProduct?.image_url ? 'bg-contain bg-no-repeat bg-center' : '[background-size:100%_100%]'}`}
                  style={{ backgroundImage: selectedProduct?.image_url ? `url(${selectedProduct?.image_url})` : `url(${IMAGE_PLACEHOLDER})` }}
                >
                  <span className='absolute right-4 top-4'>
                    {selectedProduct?.low_on_stock && selectedProduct?.stock != 0 ? <Badge name='Low on Stock' className='block' color='yellow' /> : null}
                    {selectedProduct?.stock <= 0 ? <Badge Icon={TbAlertTriangle} name='Out of Stock ' className='block' color='red' /> : null}
                  </span>
                  {response && viewReport &&
                    <div className='flex flex-col backdrop-blur-2xl bg-white/50 border p-4 rounded-lg overflow-y-auto min-h-full text-justify'>
                      <p className='mb-2'>{response}</p>
                      <button onClick={(viewReport) => setViewReport(!viewReport)} className='mt-auto w-fit ml-auto'>close</button>
                    </div>
                  }
                </div>

                <div className='w-full flex mt-2 gap-2'>
                  <div className='w-1/2'>
                    <p className='truncate'>
                      <span className='font-medium mr-2 text-lg'>{selectedProduct?.name} {selectedProduct?.model}</span>
                    </p>
                    <p className=''>{selectedProduct?.brand}</p>
                    <p className='text-gray-600 text-sm mt-4'>{selectedProduct?.category_name}</p>
                    <p className='text-gray-600 font-medium text-sm'>{selectedProduct?.id}</p>
                    <p className='font-medium text-gray-600 px-1 mt-4'>{selectedProduct?.supplier_name}</p>
                  </div>
                  <div className='w-1/2 flex flex-col'>
                    <p className='flex justify-between text-xl'>
                      <span className='font-semibold'><span className='font-medium text-base text-gray-300 mr-2'>Stock</span>{selectedProduct?.stock}</span>
                      <span className='font-semibold'><span className='font-medium text-base text-gray-300 mr-2'>Restock Point</span>{selectedProduct?.restock_point}</span>
                    </p>

                    <p className='font-semibold text-xl mt-2 flex'>
                      <span className='font-medium text-base text-gray-300'>Safe Stock Level</span>
                      <TbSparkles className='mr-2 text-orange-300' />
                      {prediction}
                    </p>
                    <p className='font-semibold text-lg mt-2 flex items-baseline'>
                      <span className='font-medium text-base text-gray-300 mr-2'>Turnover Rate</span>
                      {prodTurnoverRate.turnover_category}
                    </p>


                    <button className='btn bg-primary mt-auto disable' disabled={loading}
                      onClick={generateReport}
                    > Generate Report <TbSparkles size={20} className='ml-2 text-orange-300' /> </button>
                  </div>
                </div>

                <div className='w-full mt-2 flex gap-2'>
                  <button className='btn disable text-black bg-red-200 hover:bg-red-400 w-full'
                    disabled={!hasPermissions([332])}
                    onClick={() => confirm(cm_delete, () => handleDeleteProduct(selectedProduct?.id))}
                  > Delete </button>
                  <button className='btn disable w-full' disabled={!hasPermissions([332])} onClick={() => setOpenEditProductModal(true)}>Edit</button>
                </div>
              </div>
            </Modal>

            <Modal show={openEditProductModal} onClose={() => setOpenEditProductModal(false)} maxWidth={'2xl'} name="Edit Product">
              <div>
                <form onSubmit={handleEditProductSubmit}>
                  <div className='flex gap-2 mb-4'>
                    <div className='w-52 aspect-square border-card overflow-hidden'
                      style={{ background: `url(${product_image_placeholder})`, backgroundSize: '100%' }}>
                      {editProductFormData.image_url === ''
                        ? null
                        : <img className='w-full h-full' src={editProductFormData.image_url} alt="Can't load image :(" />
                      }
                    </div>
                    <div className='flex flex-col flex-1 gap-2'>
                      <select className='border-card' name="category_id" id="category_id" onChange={handleEditProductInputChange}>
                        <option value={null}>Select Category</option>
                        {categories.map((category, index) => {
                          return (
                            <option key={index} value={category.id}>{category.name}</option>
                          )
                        })}
                      </select>
                      <select className='border-card' name="supplier_id" id="supplier_id" onChange={handleEditProductInputChange}>
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
                          value={editProductFormData.price || 0}
                          onChange={handleEditProductInputChange}
                        />
                        <input type="number" name="restock_point" id="restock_point" placeholder="Restock Point"
                          className='border-card'
                          value={editProductFormData.restock_point || 0}
                          onChange={handleEditProductInputChange}
                        />
                      </div>
                      <input type="text" name="image_url" id="image_url" placeholder="Image URL"
                        className='border-card'
                        value={editProductFormData.image_url || ''}
                        onChange={handleEditProductInputChange}
                      />
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <div className='flex gap-2'>
                      <input type="text" name="name" id="name" placeholder="Name"
                        className='border-card w-2/3'
                        value={editProductFormData.name || ''}
                        onChange={handleEditProductInputChange}
                      />
                      <input type="text" name="model" id="model" placeholder="Model"
                        className='border-card w-1/3'
                        value={editProductFormData.model || ''}
                        onChange={handleEditProductInputChange}
                      />
                    </div>
                    <input type="text" name="brand" id="brand" placeholder="Brand"
                      className='border-card w-full'
                      value={editProductFormData.brand || ''}
                      onChange={handleEditProductInputChange}
                    />
                    <textarea type="text" name="description" id="description" placeholder="Description"
                      rows={6}
                      className='border-card w-full resize-none'
                      value={editProductFormData.description || ''}
                      onChange={handleEditProductInputChange}
                    />
                    <button className='btn disable ml-auto'
                      disabled={!hasPermissions([332])}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </Modal>

          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Product;

const cm_delete = `Are you sure you want to delete this product entry?`;