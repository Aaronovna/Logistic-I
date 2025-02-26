import { useEffect, useState, useRef, useCallback } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { AgGridReact } from 'ag-grid-react';

import InfrastructureLayout from '@/Layouts/InfrastructureLayout';
import Status from '@/Components/Status';
import useUpdateStatus from '@/api/useUpdateStatus';
import { handleInputChange } from '@/functions/handleInputChange';
import { filterArray } from '@/functions/filterArray';
import { requestStatus } from '@/Constants/status';
import { returnStatus } from '@/Constants/status';
import { returnCategories } from '@/Constants/categories';
import { TbX } from "react-icons/tb";
import { dateTimeFormatShort } from '@/Constants/options';
import { simpleFlatUnits } from '@/Constants/units';
import { WeatherCloudChip, WeatherHumidityWindChip, WeatherTempChip } from '@/Components/Chips';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const Depot = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2053])) {
    return (
      <Unauthorized />
    )
  }
  const { updateStatus } = useUpdateStatus();

  const { theme, themePreference } = useStateContext();

  const [depots, setDepots] = useState();
  const fetchInfrastructures = async () => {
    try {
      const response = await axios.get('/infrastructure/get');
      setDepots(filterArray(response.data.data, 'type', [101]));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [products, setProducts] = useState();
  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
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
        return prevItems;
      }

      const updatedItems = [...prevItems, product];

      setRequestMaterialFormData((prevData) => ({
        ...prevData,
        items: [...prevData.items, { product_id: product.id, product_name: product.name, quantity: '', filled: false }],
      }));

      return updatedItems;
    });

    setSearchedProduct('');
    setOpenProductDropdown(false);
  };

  const handleDeleteItem = (id) => {
    setRequestedItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);

      setRequestMaterialFormData((prevData) => ({
        ...prevData,
        items: prevData.items.filter((item) => item.product_id !== id),
      }));

      return updatedItems;
    });
  };

  const handleQuantityChange = (id, value) => {
    setRequestedItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: value } : item
      )
    );

    setRequestMaterialFormData((prevData) => ({
      ...prevData,
      items: prevData.items.map((item) =>
        item.product_id === id ? { ...item, quantity: value } : item
      ),
    }));
  };

  const handleAddRequestSubmit = async (e) => {
    e.preventDefault();

    const hasInvalidQuantity = requestMaterialFormData.items.some(
      (item) => !item.quantity || item.quantity <= 0
    );

    if (hasInvalidQuantity) {
      toast.error("Please ensure all items have a valid quantity.");
      return;
    }

    const data = {
      user_id: auth.user.id,
      infrastructure_id: selectedDepot.id,
      type: requestMaterialFormData.type,
      items: JSON.stringify(requestMaterialFormData.items),
    };

    try {
      const response = await axios.post('/request/create', data);
      fetchRequest();
      setOpenRequestModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };


  const handleAddRequestInputChange = (e) => {
    const { name, value } = e.target;
    setRequestMaterialFormData({ ...requestMaterialFormData, [name]: value });
  };

  const [requests, setRequests] = useState();
  const fetchRequest = async () => {
    try {
      const response = await axios.get('/request/get/infrastructure/depot');
      setRequests(filterArray(response.data.data, 'status', ['Completed', 'Request Canceled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
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
    { category: '', name: '', assoc_product: '', quantityType: 'qty', value: '' }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { category: '', name: '', assoc_product: '', quantityType: 'qty', value: '' }
    ]);
  };

  const handleRemoveItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const returnRequestSubmit = async (e) => {
    e.preventDefault();

    const fixUnitSpacing = (value) => {
      return value.replace(/(\d)([a-zA-Z]+)/, '$1 $2');
    };

    const validateUnit = (value) => {
      const fixedValue = fixUnitSpacing(value);

      const unitPattern = simpleFlatUnits
        .map(unit => `(${unit.abbreviation}|${unit.name.replace(/ /g, '\\s')})`)
        .join('|');

      const regex = new RegExp(`\\b(${unitPattern})\\b$`, 'i');
      return regex.test(fixedValue) ? fixedValue : false;
    };

    const validatedItems = items.map(item => {
      if (!item.category || !item.name || !item.quantityType || item.value === undefined) {
        toast.error('All fields must be populated except for Associated Products.');
        throw new Error('All fields must be populated except for Associated Products.');
      }

      if (item.quantityType === "unit") {
        const validValue = validateUnit(item.value);
        if (!validValue) {
          toast.error(`"${item.name}" value must end with a valid unit abbreviation or name (e.g., mm, cm, kg, meter, etc.).`);
          throw new Error(`"${item.name}" value must end with a valid unit abbreviation or name (e.g., mm, cm, kg, meter, etc.).`);
        }
        item.value = validValue;
      }

      return item;
    });

    const payload = {
      items: JSON.stringify(validatedItems),
      comment: returnRequestFormData.comment,
      requested_by_id: auth.user.id,
      infrastructure_id: selectedDepot.id,
    };

    try {
      const response = await axios.post('/return/request/create', payload);
      fetchReturns();
      setReturnModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [returns, setReturns] = useState();
  const fetchReturns = async () => {
    try {
      const response = await axios.get('/return/request/get');
      setReturns(filterArray(response.data.data, 'status', ['Completed', 'Canceled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [selectedReturnRequests, setSelectedReturnRequests] = useState([]);
  useEffect(() => {
    if (selectedDepot) {
      setSelectedReturnRequests(filterArray(returns, 'infrastructure_id', [selectedDepot.id]))
    }
  }, [returns, selectedDepot])

  const [gridApi, setGridApi] = useState(null);

  const onRequestGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [openRequestDetailSection, setOpenRequestDetailSection] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState(null);
  const onRequestSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedRequestData(selectedRows[0] || null);
    setOpenRequestDetailSection(true);
  };

  const onReturnMaterialGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [openReturnMaterialDetailSection, setOpenReturnMaterialDetailSection] = useState(false);
  const [selectedReturnMaterialData, setSelectedReturnMaterialData] = useState(null);
  const onReturnMaterialSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedReturnMaterialData(selectedRows[0] || null);
    setOpenReturnMaterialDetailSection(true);
  };

  const CompleteOrder = async (id) => {
    const url = `/request/update/${id}`;
    const response = await updateStatus(url, { status: 'Completed' });

    if (response.status === 200) {
      fetchRequest();
    }
  }

  const CancelOrder = async (id) => {
    const url = `/request/update/${id}`;
    const response = await updateStatus(url, { status: 'Request Canceled' });

    if (response.status === 200) {
      fetchRequest();
    }
  }

  const CancelReturn = async (id) => {
    const url = `/return/request/update/${id}`;
    const response = await updateStatus(url, { status: 'Canceled' });

    if (response.status === 200) {
      fetchReturns();
      setReturnModal(false);
    }
  }

  const [weather, setWeather] = useState(null);
  const fetchWeather = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`)
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
      } else {
        setWeather(null);
        toast.error(`failed to fetch weather data`);
        //toast.error(`${data.cod} ${data.message}`);
      }
    } catch (error) {
      toast.error(`failed to fetch weather data`);
    }
  }

  useEffect(() => {
    if (selectedDepot) {
      fetchWeather(selectedDepot.lat, selectedDepot.lng);
    }
  }, [selectedDepot])

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
              <p className='font-semibold w-fit max-w-[50%] mt-auto py-1 px-3 text-lg bg-white/40 backdrop-blur-sm rounded-full shadow-md truncate'>{selectedDepot?.name}</p>
              <WeatherTempChip temp={weather?.main.temp} className='ml-2 py-1 px-3' />
              <select className='py-1 px-3 border-0 ml-auto rounded-full bg-white/5 backdrop-blur-md' name="selectdepot" id="selectdepot" onChange={handleDepotChange}>
                {depots && depots.map((depot, index) => {
                  return (
                    <option key={index} value={depot.id} style={{ background: theme.background, color: theme.text }}>{depot.name}</option>
                  )
                })
                }
              </select>
            </div>
            <div className='mt-auto w-full flex gap-2'>
              <p className='fredoka w-fit max-w-[50%] mt-auto py-1 px-3 text-lg bg-white/40 backdrop-blur-sm rounded-full shadow-md truncate'>{selectedDepot?.address}</p>
              <WeatherHumidityWindChip data={weather} className='ml-auto' />
              <WeatherCloudChip data={weather} />
            </div>
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

          <div className='h-[434px] flex gap-2'>

            <div className={`${selectedRequestData && openRequestDetailSection ? 'w-4/6' : 'w-full'} ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}>
              <AgGridReact
                rowData={selectedDepotRequests}
                columnDefs={requestColDef}
                rowSelection='single'
                pagination={true}
                onGridReady={onRequestGridReady}
                onSelectionChanged={onRequestSelectionChanged}
                onRowClicked={() => setOpenRequestDetailSection(true)}
                getRowStyle={() => ({
                  cursor: "pointer",
                })}
              />
            </div>

            <div className={`w-2/6 border-card flex-1 p-4 ${selectedRequestData && openRequestDetailSection ? 'block' : 'hidden'} flex flex-col shadow-lg`}>
              <div className="flex items-start">
                <p className="text-gray-600">{new Date(selectedRequestData?.created_at).toLocaleString(undefined, dateTimeFormatShort)}</p>
                <button className="ml-auto" onClick={() => setOpenRequestDetailSection(false)}><TbX size={20} /></button>
              </div>

              <p className='mt-6 font-medium mb-2'>Requested Products</p>
              <div className='max-h-64 overflow-y-auto'>
                {selectedRequestData && JSON.parse(selectedRequestData.items).map((item, index) => {
                  return (
                    <div className={`border mb-2 rounded-md ${item.filled ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p key={index} className='flex justify-between px-2 pt-1'>
                        <span className=''>{item.product_name}</span>
                        <span className="italic text-sm text-gray-600">{item.quantity} pcs.</span>
                      </p>
                      <span className={`text-sm px-2 pb-1 ${item.filled ? 'text-green-500' : 'text-red-500'}`}>
                        {item.filled ? 'Fulfilled' : 'Pending Fulfillment'}
                      </span>
                    </div>
                  )
                })
                }
              </div>

              <div className='ml-auto mt-auto'>
                {selectedRequestData?.status === 'Request Created' || selectedRequestData?.status === 'Request Approved' ?
                  <button
                    onClick={() => CancelOrder(selectedRequestData?.id)}
                    className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-red-100 text-red-600 outline outline-1 outline-red-300"
                  >
                    Cancel
                  </button> : null
                }

                {selectedRequestData?.status === 'Delivered' ?
                  <button
                    onClick={() => CompleteOrder(selectedRequestData?.id)}
                    className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300"
                  >
                    Complete
                  </button> : null
                }
              </div>

            </div>

          </div>


          <div className='w-full flex mb-2 items-end mt-6'>
            <div className='flex items-baseline ml-2'>
              <p className='font-semibold text-2xl'>Returns</p>
              <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('depot-history') + '#return-section'}>History</Link>
            </div>
            <button className='ml-auto border-card font-medium mr-2' style={{ background: theme.accent, color: theme.background }} onClick={() => setReturnModal(true)}>Return</button>
          </div>

          <div className='h-[434px] flex gap-2'>

            <div className={`${selectedReturnMaterialData && openReturnMaterialDetailSection ? 'w-4/6' : 'w-full'} ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}>
              <AgGridReact
                rowData={selectedReturnRequests}
                columnDefs={returnColDef}
                rowSelection='single'
                pagination={true}
                onGridReady={onReturnMaterialGridReady}
                onSelectionChanged={onReturnMaterialSelectionChanged}
                getRowStyle={() => ({
                  cursor: "pointer",
                })}
                onRowClicked={() => setOpenReturnMaterialDetailSection(true)}
              />
            </div>

            <div className={`w-2/6 border-card flex-1 p-4 ${selectedReturnMaterialData && openReturnMaterialDetailSection ? 'block' : 'hidden'} flex flex-col shadow-lg`}>
              <div className="flex items-start">
                <p className="text-gray-600">{new Date(selectedReturnMaterialData?.created_at).toLocaleString(undefined, dateTimeFormatShort)}</p>
                <button className="ml-auto" onClick={() => setOpenReturnMaterialDetailSection(false)}><TbX size={20} /></button>
              </div>

              <p className='mt-6 font-medium mb-2'>Item requested to be returned</p>
              <div className='max-h-64 overflow-y-auto'>
                {selectedReturnMaterialData && JSON.parse(selectedReturnMaterialData.items).map((item, index) => {
                  return (
                    <div key={index} className="w-full flex flex-col border mb-2 rounded-md">
                      <div className="w-full flex justify-between px-2 pt-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-right font-medium text-gray-600 text-sm">
                          {item.quantityType === 'qty' ? `${item.value} pcs.` : `${item.value}`}
                        </p>
                      </div>
                      <p className="bg-gray-100 text-sm px-2 pb-1 text-gray-600">{item.category}</p>
                    </div>
                  )
                })
                }
              </div>
              <p className="text-sm italic p-1 mt-2">{selectedReturnMaterialData?.comment}</p>

              <div className='ml-auto mt-auto'>
                {selectedReturnMaterialData?.status === 'Waiting for Approval' || selectedReturnMaterialData?.status === 'Request Approved' ?
                  <button onClick={() => CancelReturn(selectedReturnMaterialData?.id)} className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-red-100 text-red-600 outline outline-1 outline-red-300" >
                    Cancel
                  </button> : null
                }
              </div>
            </div>

          </div>
        </div>

        <Modal show={openRequestModal} onClose={() => setOpenRequestModal(false)} name="Request Material">
          <div style={{ color: theme.text }}>
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

        <Modal show={returnModal} onClose={() => setReturnModal(false)} maxWidth='4xl' name="Create return request">
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
                          id={`unit-${index}`}
                          value="unit"
                          checked={item.quantityType === 'unit'}
                          onChange={(e) => {
                            const newItems = [...items];
                            newItems[index].quantityType = e.target.value;
                            setItems(newItems);
                          }}
                        />
                        <label htmlFor={`unit-${index}`}>unit</label>
                      </span>
                    </div>

                    {/* Quantity/Unit Input */}
                    <input
                      name={`value-${index}`}
                      type={item.quantityType === 'qty' ? 'number' : 'text'}
                      className='resize-none border-card w-1/6'
                      placeholder='1, 2kg, 3L'
                      value={item.value}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].value = e.target.value;
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
        </Modal>
      </InfrastructureLayout>
    </AuthenticatedLayout>
  );
}

export default Depot;

const requestColDef = [
  { field: "id", filter: true, maxWidth: 100 },
  {
    field: 'created_at', headerName: 'Date',
    valueFormatter: (params) => new Date(params.value).toLocaleString(undefined, dateTimeFormatShort)
  },
  { field: "user_name", filter: true, flex: 1, minWidth: 120, headerName: 'Requested by' },
  { field: "type", filter: true, flex: 1, minWidth: 120, headerName: 'Purpose' },
  {
    field: "status", flex: 1, minWidth: 120,
    cellRenderer: (params) => {
      return (
        <Status statusArray={requestStatus} status={params.value} className='leading-normal whitespace-nowrap p-1 px-3 rounded-full' />
      )
    }
  },
];

const returnColDef = [
  { field: "id", filter: true, maxWidth: 100 },
  {
    field: 'created_at', headerName: 'Date',
    valueFormatter: (params) => new Date(params.value).toLocaleString(undefined, dateTimeFormatShort)
  },
  {
    field: 'requested_by_name', headerName: 'Requested by'
  },
  { field: 'comment', flex: 1 },
  {
    field: 'status',
    cellRenderer: (params) => <Status
      statusArray={returnStatus} status={params.data.status}
      className='leading-normal whitespace-nowrap p-1 px-3 rounded-full'
    />
  }
];