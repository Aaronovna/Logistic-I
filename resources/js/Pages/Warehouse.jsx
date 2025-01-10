import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { Card2 } from '@/Components/Cards';
import { useEffect, useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';

import Modal from '@/Components/Modal';

import { TbBox } from "react-icons/tb";
import { TbCurrencyPeso } from "react-icons/tb";

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const formatValue = (value) => {
  const formattedValue = new Intl.NumberFormat('fil-PH', {
    //style: 'currency',
    currency: 'PHP',
  }).format(value);

  return formattedValue;
}

const colDefs = [
  { field: "product_id", maxWidth: 100, flex: 1, headerName: 'ID' },
  { field: "product_name", filter: true, flex: 1, minWidth: 120, headerName: 'Product' },
  { field: "product_model", filter: true, flex: 1, minWidth: 120, headerName: 'Model' },
  { field: "quantity", filter: true, maxWidth: 150, flex: 1 },
  {
    field: "product_price", filter: true, flex: 1, minWidth: 150, headerName: 'Price',
    cellRenderer: (params) => {
      return (
        <p>{`${formatValue(params.data.product_price)} (${(formatValue(params.data.product_price * params.data.quantity.toFixed(2)))})`}</p>
      )
    }
  }
];

export default function Warehouse({ auth }) {
  const { theme, themePreference } = useStateContext();

  const [openAddInventoryModal, setOpenAddInventoryModal] = useState(false);
  const [openEditInventoryModal, setOpenEditInventoryModal] = useState(false);

  const [totalProductValue, setTotalProductValue] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [inventoryStats, setInventoryStats] = useState([]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/inventory/get');
      setInventory(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      const response = await axios.get('/inventory/stats');
      setInventoryStats(response.data);
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

  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const [product, setProduct] = useState([]);
  const fetchProduct = async (id) => {
    try {
      const response = await axios.get(`/product/get/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchCategories();
    fetchSuppliers();
    fetchProducts();
    fetchInventoryStats();
  }, []);

  const [addInventoryFormData, setAddInventoryFormData] = useState({
    quantity: '',
    product_id: '',
    warehouse_id: '',
  });

  const handleAddInventorySubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/inventory/create', addInventoryFormData);

      setAddInventoryFormData({
        quantity: '',
        product_id: '',
      });

      toast.success('success');
      fetchInventory();
      setOpenAddInventoryModal(false);
    } catch (error) {
      toast.error('error');
    }
  };

  const [openProductDropdown, setOpenProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchedProduct, setSearchedProduct] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const productDropdownRef = useRef(null);

  const handleSearchProduct = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setSearchedProduct(searchQuery);

    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = products.filter(products =>
      products.id.toString().toLowerCase().includes(searchQuery) ||
      products.name.toLowerCase().includes(searchQuery) ||
      products.model.toLowerCase().includes(searchQuery)
    );

    setFilteredProducts(filtered);
    setOpenProductDropdown(true);
  };

  const handleSelectProduct = product => {
    setSelectedProduct(product);
    setSearchedProduct(product.name);
    setOpenProductDropdown(false);
  };

  const handleAddProductInputChange = (e) => {
    const { name, value } = e.target;

    setAddInventoryFormData({ ...addInventoryFormData, [name]: value });
  };

  const handleAddInventoryInput = (product) => {
    setAddInventoryFormData({
      ...addInventoryFormData,
      product_id: product.id,
    });
  };

  const [selectedData, setSelectedData] = useState();

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
    fetchProduct(selectedRows[0].product_id);
  };

  const [gridApi, setGridApi] = useState(null);
  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  useEffect(() => {
    if (inventoryStats) {
      setTotalProductValue(formatValue(inventoryStats.totalStockValue));
    }
  }, [inventoryStats]);

  const [editInventoryFormData, setEditInventoryFormData] = useState({
    quantity: '',
  });

  const handleEditInventorySubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/inventory/update/${selectedData.id}`, editInventoryFormData);
      setEditInventoryFormData({
        quantity: '',
      });

      toast.success('success');
      fetchInventory();
      setOpenEditInventoryModal(false);
    } catch (error) {
      toast.error('error');
    }
  };

  const handleEditProductInputChange = (e) => {
    const { name, value } = e.target;

    setEditInventoryFormData({ ...editInventoryFormData, [name]: value });
  };

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
              <Card2 data={inventoryStats && inventoryStats?.totalStock} name="Total Stocks" Icon={TbBox} className='w-1/2' iconColor={theme.text} />
            </div>
            <div className={`w-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '434px' }} >
              <AgGridReact
                rowData={inventory}
                columnDefs={colDefs}
                rowSelection='single'
                pagination={true}
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
              />
            </div>
          </div>

          <div className='w-1/3 flex flex-col' style={{ color: theme.text }}>
            <div className='flex gap-2 mb-2'>
              <button
                onClick={() => setOpenAddInventoryModal(true)}
                className='border-card w-full font-medium'
                style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
              >
                Add Inventory
              </button>
            </div>
            <div className='border-card p-4 w-full flex flex-1 flex-col'>
              <div className='flex gap-4'>
                <div className='product-placeholder w-1/2 aspect-square rounded-md bg-contain'>
                  <img src={product?.image_url} alt={product?.name} />
                </div>
                <div>
                  <p className='text-lg font-semibold mb-2'>{product?.id ? product?.id : '--'}</p>
                  <p>Restock Point <span className='font-semibold'>{product?.restock_point ? product?.restock_point : '--'}</span></p>
                  <p>Stock <span className='font-semibold'>{product?.stock ? product?.stock : '--'}</span></p>
                  <p>Price <span className='font-semibold'>{product?.price ? product?.price : '--'}</span></p>
                </div>
              </div>

              <div className='mt-4'>
                <p>Brand <span className='font-semibold'>{product?.brand ? product?.brand : '--'}</span></p>
                <p>Name <span className='font-semibold'>{product?.name ? product?.name : '--'}</span></p>
                <p>Model <span className='font-semibold'>{product?.model ? product?.model : '--'}</span></p>
                <p className='py-4'>{product?.description}</p>
                <p className='text-lg text-gray-500'>{product?.supplier_name ? product?.supplier_name : '--'}</p>
                <p className='text-sm text-gray-500'>{product?.category_name ? product?.category_name : '--'}</p>
              </div>
              <button
                className='border-card ml-auto mt-auto font-medium'
                style={{ background: theme.accent, borderColor: theme.border, color: theme.background }}
                onClick={()=>setOpenEditInventoryModal(true)}
                disabled={selectedData ? false : true} 
              >
                Edit Stock
              </button>

            </div>
          </div>
        </div>
      </div>

      <Modal show={openAddInventoryModal} onClose={() => setOpenAddInventoryModal(false)} maxWidth='lg'>
        <div className='p-4' style={{ color: theme.text }}>
          <p className='font-semibold text-xl mt-2 mb-4'>Add Product</p>
          <form onSubmit={handleAddInventorySubmit} className="flex flex-col" style={{ color: theme.text }}>
            <div className='relative w-full'>
              <input
                type="text"
                placeholder="Search product..."
                className='border-card w-full mb-2 bg-transparent'
                value={searchedProduct}
                onChange={handleSearchProduct}
                onClick={() => setOpenProductDropdown(!openProductDropdown)}
                style={{ borderColor: theme.border }}
              />
              {openProductDropdown &&
                <div
                  ref={productDropdownRef}
                  className="absolute w-full rounded-md max-h-44 overflow-y-auto z-50 backdrop-blur border-card"
                >
                  {searchedProduct.trim() === ""
                    ? <p className="p-2">Search Product</p>
                    : filteredProducts.length > 0
                      ? filteredProducts.map((product, index) =>
                        <button key={index} className="block p-2 hover:bg-gray-300/50 w-full text-left" onClick={() => { handleSelectProduct(product); handleAddInventoryInput(product) }}>
                          {`${product.id} ${product.name} ${product.model}`}
                        </button>)
                      : <p className="p-2 text-[#FF9E8D]">No Product Found</p>
                  }
                </div>}
            </div>

            <div className='py-4'>
              <p>{`Product ID: ${addInventoryFormData ? addInventoryFormData?.product_id : ''}`}</p>
              <p>{`Product: ${selectedProduct ? selectedProduct?.name : ''}`}</p>
              <p>{`Model: ${selectedProduct ? selectedProduct?.model : ''}`}</p>
              <p>{`Supplier: ${selectedProduct ? selectedProduct?.supplier_name : ''}`}</p>
              <p>{`Current Stock: ${selectedProduct ? selectedProduct?.stock : ''}`}</p>
            </div>

            <div className='flex gap-2 mt-auto'>
              <input type="number" name="quantity" id="quantity" placeholder="Quantity"
                className='border-card bg-transparent flex-1'
                style={{ borderColor: theme.border }}
                value={addInventoryFormData.quantity}
                onChange={handleAddProductInputChange}
              />

              <button className='border-card' style={{ background: theme.accent, color: theme.background }}>Add to Inventory</button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal show={openEditInventoryModal} onClose={() => setOpenEditInventoryModal(false)} maxWidth='lg'>
        <div className='p-4' style={{ color: theme.text }}>
          <p className='font-semibold text-xl mt-2 mb-4'>Edit Stock</p>
          <form onSubmit={handleEditInventorySubmit} className="flex flex-col" style={{ color: theme.text }}>
            <div className='py-4'>
              <p>{`Product ID: ${selectedData ? selectedData?.product_id : ''}`}</p>
              <p>{`Product: ${selectedData ? selectedData?.product_name : ''}`}</p>
              <p>{`Model: ${selectedData ? selectedData?.product_model : ''}`}</p>
              <p>{`Current Stock: ${selectedData ? selectedData?.quantity : ''}`}</p>
            </div>

            <div className='flex gap-2 mt-auto'>
              <input type="number" name="quantity" id="quantity" placeholder="Quantity"
                className='border-card bg-transparent flex-1'
                style={{ borderColor: theme.border }}
                value={editInventoryFormData.quantity}
                onChange={handleEditProductInputChange}
              />

              <button className='border-card' style={{ background: theme.accent, color: theme.background }}>Save</button>
            </div>
          </form>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
