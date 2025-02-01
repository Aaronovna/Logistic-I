import { useEffect, useState, useRef } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { AgGridReact } from 'ag-grid-react';

import InfrastructureLayout from '@/Layouts/InfrastructureLayout';
import { filterArray } from '@/functions/filterArray';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const Depot = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2053])) {
    return (
      <Unauthorized />
    )
  }

  const { theme, themePreference } = useStateContext();

  const [depots, setDepots] = useState();
  const fetchInfrastructures = async () => {
    try {
      const response = await axios.get('/infrastructure/get');
      setDepots(filterArray(response.data, 'type', [101]));
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const [products, setProducts] = useState();
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  useEffect(() => {
    fetchRequest();
    fetchInfrastructures();
    fetchProducts();
  }, [])

  const handleDepotChange = (e) => {
    const { value } = e.target;
    setSelectedDepot(depots.find(depot => depot.id === parseInt(value)));
  };

  const [selectedDepot, setSelectedDepot] = useState();

  useEffect(() => {
    if (depots) {
      setSelectedDepot(depots[0]);
    }
  }, [depots])

  const colDefs = [
    { field: "user_name", filter: true, flex: 1, minWidth: 120, headerName: 'User' },
    { field: "type", filter: true, flex: 1, minWidth: 120 },
    {
      field: "items", filter: true, flex: 1, minWidth: 120, headerName: 'Requested Material', autoHeight: true,
      cellRenderer: (params) => {
        const items = JSON.parse(params.data.items);

        return (
          <div>
            {
              items.map((item, index) => {
                return (
                  <p key={index}>{`${item.product_name ? item.product_name : `ID:${item.product_id}`} ${item.quantity}`}</p>
                )
              })
            }
          </div>
        )
      }
    },
    { field: "status", filter: true, flex: 1, minWidth: 120 },
    {
      field: "Action", maxWidth: 100,
      cellRenderer: (params => {
        const handleDelete = async (id) => {
          try {
            const response = await axios.delete(`/request/delete/${id}`);  // Replace with your actual delete endpoint
            if (response.status === 200) {
              alert('Product deleted successfully');
            } else {
              alert('Failed to delete product');
            }
          } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
          }
        };

        return (
          <button
            onClick={() => handleDelete(params.data.id)}  // Assuming `product_id` is the ID to delete
            className="px-2 py-1"
          >
            Delete
          </button>
        );
      })
    },
  ];

  const [openRequestModal, setOpenRequestModal] = useState(false);

  const [requestMaterialFormData, setRequestMaterialFormData] = useState({
    user_id: null,
    infrastructure_id: null,
    type: 'maintenance',
    items: [],
  });

  const [openProductDropdown, setOpenProductDropdown] = useState(false);
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

  const [requestedItems, setRequestedItems] = useState([]);
  const handleSelectProduct = (product) => {
    setRequestedItems((prevItems) => {
      const productExists = prevItems.some((item) => item.id === product.id);

      if (productExists) {
        return prevItems; // If the product already exists, return the existing array
      }

      // Add the product to both `requestedItems` and `requestMaterialFormData.items`
      const updatedItems = [...prevItems, product];

      setRequestMaterialFormData((prevData) => ({
        ...prevData,
        items: [...prevData.items, { product_id: product.id, product_name: product.name, quantity: '', filled: false }], // Initialize quantity to 0
      }));

      return updatedItems;
    });

    setSearchedProduct('');
    setOpenProductDropdown(false);
  };

  const handleDeleteItem = (id) => {
    setRequestedItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);

      // Remove the corresponding item from `requestMaterialFormData.items`
      setRequestMaterialFormData((prevData) => ({
        ...prevData,
        items: prevData.items.filter((item) => item.product_id !== id),
      }));

      return updatedItems;
    });
  };

  const handleQuantityChange = (id, value) => {
    // Update quantity in `requestedItems`
    setRequestedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: value } : item
      )
    );

    // Update quantity in `requestMaterialFormData.items`
    setRequestMaterialFormData((prevData) => ({
      ...prevData,
      items: prevData.items.map((item) =>
        item.product_id === id ? { ...item, quantity: value } : item
      ),
    }));
  };

  const handleAddRequestSubmit = async (e) => {
    e.preventDefault();

    const data = {
      user_id: auth.user.id,
      infrastructure_id: selectedDepot.id,
      type: requestMaterialFormData.type,
      items: JSON.stringify(requestMaterialFormData.items),
    }

    console.log(data);

    try {
      const response = await axios.post('/request/create', data);

    } catch (error) {

    }
  }

  const handleAddRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestMaterialFormData({ ...requestMaterialFormData, [name]: value });
  };

  const [requests, setRequests] = useState();
  const fetchRequest = async () => {
    try {
      const response = await axios.get('request/get/infrastructure/depot');
      setRequests(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Depot" />
      <InfrastructureLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Depot</h2>}>
        <div className="content">
          <div className='border-card p-4 shadow-sm mb-4 flex flex-col h-56 bg-cover'
            style={{
              backgroundImage: selectedDepot?.image_url ? `url(${selectedDepot.image_url})` : 'none',
            }}>
            <div className='flex'>
              <p className='text-xl font-semibold py-2 px-4 bg-white/40 backdrop-blur-sm rounded-full shadow-sm w-fit'>{selectedDepot?.name}</p>
              <div className='ml-auto bg-white/10 backdrop-blur-sm rounded-full h-fit duration-200 px-2'>
                <select className='p-2 bg-transparent border-0' name="selectdepot" id="selectdepot" onChange={handleDepotChange}>
                  {depots && depots.map((depot, index) => {
                    return (
                      <option key={index} value={depot.id} style={{ background: theme.background, color: theme.text }}>{depot.name}</option>
                    )
                  })
                  }
                </select>
              </div>
            </div>
            <p className=' mt-auto py-1 px-2 bg-white/40 backdrop-blur-sm rounded-full shadow-md w-fit'>{selectedDepot?.address}</p>
          </div>

          <div className='w-full flex gap-2 mb-4'>
            <button className='border-card font-semibold' style={{ background: theme.accent, color: theme.background }}>Return</button>
            <button
              className='border-card font-semibold'
              style={{ background: theme.accent, color: theme.background }}
              onClick={() => setOpenRequestModal(true)}
            >
              Request
            </button>
          </div>

          <div className={`w-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '434px' }} >
            <AgGridReact
              rowData={requests}
              columnDefs={colDefs}
              rowSelection='single'
              pagination={true}
            /* onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged} */
            />
          </div>
        </div>

        <Modal show={openRequestModal} onClose={() => setOpenRequestModal(false)}>
          <div className='p-4' style={{ color: theme.text }}>
            <p className='font-semibold text-xl mt-2 mb-4'>Request Materials</p>
            <form onSubmit={handleAddRequestSubmit}>
              <div className='flex gap-2'>
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
                            <button key={index} className="block p-2 hover:bg-gray-300/50 w-full text-left" onClick={() => { handleSelectProduct(product) }}>
                              {`${product.id} ${product.name} ${product.model}`}
                            </button>)
                          : <p className="p-2 text-[#FF9E8D]">No Product Found</p>
                      }
                    </div>}
                </div>

                <select name="type" id="type" className='border-card h-fit' onChange={handleAddRequestInputChange}>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className='h-96 overflow-y-auto my-4'>
                <table className="w-full border-collapse table-auto border">
                  <thead className='sticky top-0 z-10'>
                    <tr className="bg-gray-300">
                      <th className="text-left p-2 w-3/5 font-semibold">Item Name & Model</th>
                      <th className="text-left p-2 w-2/5 font-semibold">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requestedItems &&
                      requestedItems.map((item, index) => (
                        <tr
                          key={index}
                          className="even:bg-gray-200 group relative"
                          style={{ height: 'auto' }} // Ensure rows are only as tall as their content
                        >
                          {/* Item Name and Model */}
                          <td className="p-2 align-top">
                            {`${item.name} - ${item.model}`}
                            <span
                              className="absolute top-0 right-0 cursor-pointer opacity-0 m-1 group-hover:opacity-100 text-red-500"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              &#215;
                            </span>
                          </td>

                          {/* Quantity Input */}
                          <td className="p-2 pr-6 align-top">
                            <input
                              type="number"
                              className="border border-gray-300 p-1 rounded w-full"
                              style={{ height: 'auto' }} // Ensure input height does not stretch
                              value={requestMaterialFormData.items.find((i) => i.product_id === item.id)?.quantity} // Show current quantity
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

              </div>
              <button className='border-card'>Request</button>
            </form>
          </div>
        </Modal>
      </InfrastructureLayout>
    </AuthenticatedLayout>
  );
}

export default Depot;