import { useEffect, useState, useRef, useCallback } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { AgGridReact } from 'ag-grid-react';

import useRole from '@/hooks/useRole';
import { Card2 } from '@/Components/Cards';
import { filterArray } from '@/functions/filterArray';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const cardStyle = 'mb-2 snap-center mx-2 md:min-w-64 inline-block min-w-[100%] border-none text-black backdrop-blur-lg bg-white/30';

const formatValue = (value) => {
  if (value) {
    const formattedValue = new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);

    return formattedValue;
  }

  return 0;
}

const Warehouse = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const { themePreference } = useStateContext();

  const [openAddInventoryModal, setOpenAddInventoryModal] = useState(false);
  const [openEditInventoryModal, setOpenEditInventoryModal] = useState(false);

  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () => {
    try {
      const response = await axios.get('/inventory/get');
      setInventory(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [warehouses, setWarehouses] = useState([{ name: 'All Warehouses', id: 0, type: 100 }]);
  const fetchInfrastructures = async () => {
    try {
      const response = await axios.get('/infrastructure/get');
      setWarehouses(prevWarehouses => [
        ...prevWarehouses,
        ...filterArray(response.data.data, 'type', [100])]);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [totalStocks, setTotalStocks] = useState();
  const [totalValue, setTotalValue] = useState();
  const fetchInventoryStats = async () => {
    try {
      const response = await axios.get('/inventory/total/stock');
      setTotalStocks(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/inventory/total/value');
      setTotalValue(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
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

  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const [product, setProduct] = useState([]);
  const fetchProduct = async (id) => {
    try {
      const response = await axios.get(`/product/get/${id}`);
      setProduct(response.data.data);
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
    fetchInfrastructures();
  }, []);

  const [addInventoryFormData, setAddInventoryFormData] = useState({
    quantity: '',
    product_id: '',
    warehouse_id: null,
  });

  const handleAddInventorySubmit = async (e) => {
    e.preventDefault();

    const payload = {
      quantity: addInventoryFormData.quantity,
      product_id: addInventoryFormData.product_id,
      warehouse_id: selectedWarehouse.id,
    }

    try {
      const response = await axios.post('/inventory/create', payload);

      setAddInventoryFormData({
        quantity: '',
        product_id: '',
        warehouse_id: addInventoryFormData.warehouse_id,
      });

      toast.success(response.data.message);
      fetchInventoryStats();
      fetchInventory();
      setOpenAddInventoryModal(false);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [openProductDropdown, setOpenProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [searchedProduct, setSearchedProduct] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const productDropdownRef = useRef(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

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

  const handleWarehouseChange = (e) => {
    const { value } = e.target;
    setSelectedWarehouse(warehouses.find(warehouse => warehouse.id === parseInt(value)));
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

  const [editInventoryFormData, setEditInventoryFormData] = useState({
    quantity: '',
    warehouse_id: 0,
    operation: null,
  });

  const handleEditInventorySubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/inventory/update/${selectedData.id}`, {
        quantity: editInventoryFormData.quantity,
        warehouse_id: selectedData.warehouse_id,
        operation: editInventoryFormData.operation,
      });

      setEditInventoryFormData({
        quantity: '',
        warehouse_id: 0,
        operation: null,
      });

      toast.success(response.data.message);
      fetchInventoryStats();
      fetchInventory();
      setOpenEditInventoryModal(false);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const handleEditProductInputChange = (e) => {
    const { name, value } = e.target;

    setEditInventoryFormData({ ...editInventoryFormData, [name]: value });
  };

  useEffect(() => {
    setSelectedWarehouse({ name: 'All Warehouses', id: 0, type: 100 });
  }, [])


  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Receipt" />

      <Layout user={auth.user} header={<NavHeader headerName="Warehouse" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content bg-cover" >
            <div className='border-card p-4 shadow-md mb-6 flex relative overflow-hidden'>
              <div className='w-full h-full absolute blur-sm top-0 left-0 bg-cover bg-center'
                style={{
                  backgroundImage: selectedWarehouse?.image_url ? `url(${selectedWarehouse.image_url})` :
                    `url(https://img.freepik.com/free-vector/warehouse-interior-logistics-cargo-delivery_107791-1777.jpg?semt=ais_hybrid)`,
                }}></div>
              <div className='flex flex-col flex-1 z-10'>
                <div className='flex'>
                  <select className='p-2 w-full border-none shadow-md text-black tracking-wider bg-white/10 backdrop-blur-lg font-medium text-lg rounded-full' name="warehouse_id" id="warehouse_id" onChange={handleWarehouseChange}>
                    {warehouses && warehouses.map((warehouse, index) => {
                      return (
                        <option key={index} value={warehouse.id} className='text-sm bg-background text-text'>{warehouse.name}</option>
                      )
                    })
                    }
                  </select>
                </div>
                <p className='mt-auto w-fit truncate backdrop-blur-lg bg-white/10 rounded-full px-2 py-1'>{selectedWarehouse?.address}</p>
              </div>

              <div className='ml-auto md:items-end mb-2 md:mb-0 md:gap-4 overflow-x-auto snap-mandatory snap-x pb-1 whitespace-nowrap'>
                <Card2 data={totalValue && formatValue(totalValue.total_stock_value)} name="Total Asset Value" className={cardStyle} />
                <Card2 data={totalStocks && totalStocks.total_quantity} name="Total Stocks" className={cardStyle} />
              </div>
            </div>

            <div className='flex gap-4 flex-col md:flex-row'>
              <div className='flex flex-col gap-4 md:w-2/3 w-full'>
                <div className={`w-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '768px' }} >
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

              <div className='md:w-1/3 w-full flex flex-col h-fit'>
                <div className='flex gap-2 mb-2'>
                  <button
                    onClick={() => setOpenAddInventoryModal(true)}
                    disabled={selectedWarehouse?.id === 0 || !hasPermissions([322])}
                    className='btn w-full disable'
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
                      <p>Stock <span className='font-semibold'>{product?.total_stock ? product?.total_stock : '--'}</span></p>
                      <p>Price <span className='font-semibold'>{product?.price ? product?.price : '--'}</span></p>
                    </div>
                  </div>

                  <div className='mt-4'>
                    <p>Brand <span className='font-semibold'>{product?.brand ? product?.brand : '--'}</span></p>
                    <p>Name <span className='font-semibold'>{product?.name ? product?.name : '--'}</span></p>
                    <p>Model <span className='font-semibold'>{product?.model ? product?.model : '--'}</span></p>
                    <p className='text-lg text-gray-500 mt-10'>{product?.supplier_name ? product?.supplier_name : '--'}</p>
                    <p className='text-sm text-gray-500'>{product?.category_name ? product?.category_name : '--'}</p>
                  </div>
                  <button
                    className='btn ml-auto mt-auto disable'
                    onClick={() => setOpenEditInventoryModal(true)}
                    disabled={!selectedData || !hasPermissions([322])}
                  >
                    Edit Stock
                  </button>

                </div>
              </div>
            </div>
            <Modal show={openAddInventoryModal} onClose={() => setOpenAddInventoryModal(false)} maxWidth='lg' name="Add Inventory">
              <div className='text-text'>
                <form onSubmit={handleAddInventorySubmit} className="flex flex-col">
                  <div className='relative w-full'>
                    <input
                      type="text"
                      placeholder="Search product..."
                      className='border-card w-full mb-2 bg-transparent'
                      value={searchedProduct}
                      onChange={handleSearchProduct}
                      onClick={() => setOpenProductDropdown(!openProductDropdown)}
                    />
                    {openProductDropdown &&
                      <div
                        ref={productDropdownRef}
                        className="absolute w-full rounded-md max-h-44 overflow-y-auto z-50 backdrop-blur border-card"
                      >
                        {searchedProduct.trim() === ""
                          ? <p className="p-2">  Product</p>
                          : filteredProducts.length > 0
                            ? filteredProducts.map((product, index) =>
                              <button key={index} className="p-2 hover:bg-hbg rounded-md w-full text-left" onClick={() => { handleSelectProduct(product); handleAddInventoryInput(product) }}>
                                {`${product.id} ${product.name} ${product.model}`}
                              </button>)
                            : <p className="p-2 text-neutral">No Product Found</p>
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
                      value={addInventoryFormData.quantity}
                      onChange={handleAddProductInputChange}
                    />

                    <button className='btn disable' disabled={!hasPermissions([322])}>Add</button>
                  </div>
                </form>
              </div>
            </Modal>

            <Modal show={openEditInventoryModal} onClose={() => setOpenEditInventoryModal(false)} maxWidth='lg' name={`Edit '${selectedData?.product_name}' Stock`}>
              <div>
                <p className='text-lg mt-2 mb-4 text-gray-500'>Warehouse: <span className='font-semibold text-gray-700'>{`${selectedData?.warehouse_name}(${selectedData?.warehouse_id})`}</span></p>
                <form onSubmit={handleEditInventorySubmit} className="flex flex-col">
                  <div className='py-4'>
                    <p>Product ID: <span>{`${selectedData ? selectedData?.product_id : ''}`}</span></p>
                    <p>{`Product: ${selectedData ? selectedData?.product_name : ''}`}</p>
                    <p>{`Model: ${selectedData ? selectedData?.product_model : ''}`}</p>
                    <p>{`Current Stock: ${selectedData ? selectedData?.quantity : ''}`}</p>
                  </div>

                  <span className="flex gap-8">
                    {/* Add Radio */}
                    <label htmlFor="add" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-5 h-5 border rounded-md flex items-center justify-center">
                        <input type="radio" name="operation" id="add" className="hidden peer" value="add" onChange={handleEditProductInputChange} />
                        <div className="w-3 h-3 bg-transparent rounded-md peer-checked:bg-blue-400 transition-all"></div>
                      </div>
                      <p>Add</p>
                    </label>

                    {/* Subtract Radio */}
                    <label htmlFor="subtract" className="flex items-center gap-2 cursor-pointer">
                      <div className="w-5 h-5 border rounded-md flex items-center justify-center">
                        <input type="radio" name="operation" id="subtract" className="hidden peer" value="subtract" onChange={handleEditProductInputChange} />
                        <div className="w-3 h-3 bg-transparent rounded-md peer-checked:bg-red-400 transition-all"></div>
                      </div>
                      <p>Subtract</p>
                    </label>
                  </span>


                  <div className='flex gap-2 mt-auto'>
                    <input type="number" name="quantity" id="quantity" placeholder="Quantity"
                      className='border-card bg-transparent flex-1'
                      value={editInventoryFormData.quantity}
                      onChange={handleEditProductInputChange}
                    />

                    <button className='btn disable' disabled={!hasPermissions([322])}>Save</button>
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

export default Warehouse;

const colDefs = [
  { field: "product_id", width: 100, headerName: 'ID' },
  {
    field: "product_name", filter: true, flex: 1, minWidth: 120, headerName: 'Product',
    cellRenderer: (params) => {
      return (
        <span>{params.data.product_name} | {params.data.product_model}</span>
      )
    }
  },
  {
    field: "quantity", filter: true, flex: 1, minWidth: 150,
    cellRenderer: (params) => {
      return (
        <p>{`${formatValue(params.data.quantity)} (${params.data.warehouse_name})`}</p>
      )
    }
  },
  {
    field: "product_price", filter: true, flex: 1, minWidth: 150, headerName: 'Price',
    cellRenderer: (params) => {
      return (
        <p>{`${formatValue(params.data.product_price)} (${(formatValue(params.data.product_price * params.data.quantity.toFixed(2)))})`}</p>
      )
    }
  }
];