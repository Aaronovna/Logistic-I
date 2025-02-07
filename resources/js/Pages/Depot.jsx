import { useEffect, useState, useRef } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { AgGridReact } from 'ag-grid-react';

import InfrastructureLayout from '@/Layouts/InfrastructureLayout';
import Status from '@/Components/Status';
import updateStatus from '@/api/updateStatus';
import { handleInputChange } from '@/functions/handleInputChange';
import { filterArray } from '@/functions/filterArray';
import { requestStatus } from '@/Constants/status';
import { returnStatus } from '@/Constants/status';
import { returnCategories } from '@/Constants/categories';

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
    fetchReturns();
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
      const response = await axios.get('/request/get/infrastructure/depot');
      setRequests(filterArray(response.data, 'status', ['Completed', 'Request Canceled'], true));
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const [returnModal, setReturnModal] = useState(false);

  const [selectedDepotRequests, setSelectedDepotRequests] = useState([]);
  useEffect(() => {
    if (selectedDepot) {
      setSelectedDepotRequests(filterArray(requests, 'infrastructure_id', [selectedDepot.id]))
    }
  }, [requests, selectedDepot])

  const [returnRequestFormData, setReturnRequestFormData] = useState({
    comment: ''
  });

  const [items, setItems] = useState([
    { category: '', name: '', assoc_product: '', quantityType: 'qty', quantity: '' }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { category: '', name: '', assoc_product: '', quantityType: 'qty', quantity: '' }
    ]); // Add a new empty item with quantityType defaulted to 'qty'
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index); // Remove the item at the given index
    setItems(newItems);
  };

  const returnRequestSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      items: JSON.stringify(items),
      comment: returnRequestFormData.comment,
      requested_by_id: auth.user.id,
      infrastructure_id: selectedDepot.id,
    }

    try {
      const response = await axios.post('/return/request/create', payload)
    } catch (error) {

    }
  }

  const [returns, setReturns] = useState();
  const fetchReturns = async () => {
    try {
      const response = await axios.get('/return/request/get');
      setReturns(filterArray(response.data, 'status', ['Canceled'], true));
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const [selectedReturnRequests, setSelectedReturnRequests] = useState([]);
  useEffect(() => {
    if (selectedDepot) {
      setSelectedReturnRequests(filterArray(returns, 'infrastructure_id', [selectedDepot.id]))
    }
  }, [returns, selectedDepot])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Depot" />
      <InfrastructureLayout user={auth.user} header={<NavHeader headerName="Depot" />}>
        <div className="content">
          <div className='border-card p-4 shadow-sm flex flex-col h-56 bg-cover bg-white'
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

          <div className='w-full flex mb-2 items-end mt-6'>
            <div className='flex items-baseline ml-2'>
              <p className='font-semibold text-2xl'>Requests</p>
              <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('depot-history')}>History</Link>
            </div>
            <button
              className='ml-auto border-card font-medium'
              style={{ background: theme.accent, color: theme.background }}
              onClick={() => setOpenRequestModal(true)}
            >
              Request
            </button>
          </div>

          <div className={`w-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '434px' }} >
            <AgGridReact
              rowData={selectedDepotRequests}
              columnDefs={requestColDef}
              rowSelection='single'
              pagination={true}
            />
          </div>

          <div className='w-full flex mb-2 items-end mt-6'>
            <div className='flex items-baseline ml-2'>
              <p className='font-semibold text-2xl'>Returns</p>
              <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('depot-history') + '#return-section'}>History</Link>
            </div>
            <button className='ml-auto border-card font-medium mr-2' style={{ background: theme.accent, color: theme.background }} onClick={() => setReturnModal(true)}>Return</button>
          </div>
          <div className={`w-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '434px' }} >
            <AgGridReact
              rowData={selectedReturnRequests}
              columnDefs={returnColDef}
              rowSelection='single'
              pagination={true}
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

        <Modal show={returnModal} onClose={() => setReturnModal(false)} maxWidth='4xl'>
          <div className='p-4'>
            <p className='modal-header'>Return Items</p>
            <form onSubmit={returnRequestSubmit}>

              <div className='h-52 overflow-y-auto pr-1 gutter-stable border-card'>
                {items.map((item, index) => (
                  <div key={index} className='border-b pb-2 mb-2'>
                    <div className='flex gap-2'>
                      {/* Category Selection */}
                      <select
                        name={`category-${index}`}
                        className='border-card w-1/4'
                        value={item.category}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].category = e.target.value;
                          setItems(newItems);
                        }}
                      >
                        <option value="">Select Category</option>
                        {returnCategories.map((cat, catIndex) => (
                          <option value={cat.name} key={catIndex}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      {/* Item / Material Name Input */}
                      <input
                        name={`name-${index}`}
                        className='resize-none border-card w-1/4'
                        placeholder='Item / Material'
                        value={item.name}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].name = e.target.value;
                          setItems(newItems);
                        }}
                      />

                      {/* Associated Products Input */}
                      <input
                        name={`assoc_product-${index}`}
                        className='resize-none border-card w-1/4'
                        placeholder='Assoc. Products'
                        value={item.assoc_product}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].assoc_product = e.target.value;
                          setItems(newItems);
                        }}
                      />

                      {/* Quantity Type Radio Buttons */}
                      <div className='flex items-center gap-1'>
                        <span className='flex items-center'>
                          <input
                            type="radio"
                            name={`quantityType-${index}`}
                            id={`qty-${index}`}
                            value="qty"
                            checked={item.quantityType === 'qty'}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].quantityType = e.target.value;
                              setItems(newItems);
                            }}
                          />
                          <label htmlFor={`qty-${index}`}>qty.</label>
                        </span>
                        <span className='flex items-center'>
                          <input
                            type="radio"
                            name={`quantityType-${index}`}
                            id={`wt-${index}`}
                            value="wt"
                            checked={item.quantityType === 'wt'}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].quantityType = e.target.value;
                              setItems(newItems);
                            }}
                          />
                          <label htmlFor={`wt-${index}`}>wt.</label>
                        </span>
                      </div>

                      {/* Quantity/Weight Input */}
                      <input
                        name={`quantity-${index}`}
                        type="text"
                        className='resize-none border-card w-1/6'
                        placeholder='2 / 5kg'
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...items];
                          newItems[index].quantity = e.target.value;
                          setItems(newItems);
                        }}
                      />

                      {/* Remove Button */}
                      <button
                        type='button'
                        className='border-card text-red-500 px-2'
                        onClick={() => handleRemoveItem(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Button Only After Last Row */}
                <button type='button' className='border-card w-full mt-2' onClick={handleAddItem}>
                  Add
                </button>
              </div>


              <textarea
                name="comment" id="comment"
                className='w-full resize-none mt-2 border-card' rows={5} placeholder='Comment'
                value={returnRequestFormData.comment}
                onChange={(e) => handleInputChange(e, setReturnRequestFormData)}
              />
              <button type='submit' className='border-card'>Submit</button>
            </form>
          </div>
        </Modal>
      </InfrastructureLayout>
    </AuthenticatedLayout>
  );
}

export default Depot;

const CompleteOrder = (id) => {
  const url = `/request/update/${id}`;
  updateStatus(url, { status: 'Completed' })
}

const CancelOrder = (id) => {
  const url = `/request/update/${id}`;
  updateStatus(url, { status: 'Request Canceled' })
}

const CancelReturn = (id) => {
  const url = `/return/update/${id}`;
  updateStatus(url, { status: 'Canceled' })
}

const requestColDef = [
  { field: "user_name", filter: true, flex: 1, minWidth: 120, headerName: 'Requested by' },
  { field: "type", filter: true, flex: 1, minWidth: 120, headerName: 'Purpose' },
  {
    field: "items", filter: true, flex: 1, minWidth: 120, headerName: 'Requested Materials', autoHeight: true,
    cellRenderer: (params) => {
      const items = JSON.parse(params.data.items);

      return (
        <div>
          {
            items.map((item, index) => {
              return (
                <p key={index} className="w-full flex justify-between">{item.product_name} <span className="italic">qty. {item.quantity}</span></p>
              )
            })
          }
        </div>
      )
    }
  },
  {
    field: "status", flex: 1, minWidth: 120,
    cellRenderer: (params) => {
      return (
        <Status statusArray={requestStatus} status={params.data.status} className='leading-normal whitespace-nowrap p-1 px-3 rounded-full' />
      )
    }
  },
  {
    field: "Action", minWidth: 100, flex: 1,
    cellRenderer: (params => {
      return (
        <div>
          {
            params.data.status !== 'Request Created' || params.data.status !== 'Request Approved' || params.data.status !== 'Material Procured' ?
              <button
                onClick={() => CancelOrder(params.data.id)}
                className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-red-100 text-red-600 outline outline-1 outline-red-300"
              >
                Cancel
              </button>
              : null
          }
          {
            params.data.status === 'Delivered' ?
              <button
                onClick={() => CompleteOrder(params.data.id)}
                className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300"
              >
                Complete
              </button>
              : null
          }
        </div>
      );
    })
  },
];

const returnColDef = [
  {
    field: 'requested_by_name',
    headerName: 'Requested by'
  },
  {
    field: 'comment', flex: 2,
  },
  {
    field: 'items', flex: 6, autoHeight: true,
    cellRenderer: (params) => {
      const items = JSON.parse(params.data.items);

      return (
        <div>
          <span className="w-full flex">
            <p className="w-2/6 font-medium text-gray-600">Category</p>
            <p className="w-2/6 font-medium text-gray-600">Name</p>
            <p className="w-2/6 font-medium text-gray-600">Assoc. Product</p>
            <p className="w-1/6 font-medium text-gray-600 text-right">Qty.</p>
          </span>
          {
            items.map((item, index) => {
              return (
                <span key={index} className="w-full flex">
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.category}</p>
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.name}</p>
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.assoc_product ? item.assoc_product : 'N/A'}</p>
                  <p className="w-1/6 text-right">{item.quantity}</p>
                </span>

              )
            })
          }
        </div>
      )
    }
  },
  {
    field: 'status',
    cellRenderer: (params) => {
      return (
        <Status statusArray={returnStatus} status={params.data.status} className='leading-normal whitespace-nowrap p-1 px-3 rounded-full' />
      )
    }
  },
  {
    field: 'Action',
    cellRenderer: (params) => {
      if (params.data.status === 'Canceled') {
        return null;
      }

      return (
        <button onClick={() => CancelReturn(params.data.id)} className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-red-100 text-red-600 outline outline-1 outline-red-300" >
          Cancel
        </button>
      )
    }
  }
];