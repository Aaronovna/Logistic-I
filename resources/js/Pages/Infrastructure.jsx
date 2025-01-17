import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DefaultLayout from '@/Layouts/DefaultLayout';
import { Head } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';
import { TbPlus } from "react-icons/tb";
import { useState, useEffect } from 'react';

import Modal from '@/Components/Modal';
import InfrastructureCard from '@/Components/cards/InfrastructureCard';

const warehouse = 'https://media.istockphoto.com/id/457796927/photo/warehouse-building.jpg?s=612x612&w=0&k=20&c=7B89_PjoILSAGcoq7XZYkQsLfXRMOzDlxQlcbyVcWDw=';
const depot = 'https://www.electrive.com/media/2020/12/hamburger-hochbahn-busdepot-elektrobus-electric-bus-2020-01-min.png';
const terminal = 'https://media.philstar.com/photos/2021/10/27/bus_2021-10-27_20-33-19.jpg';

const options = [
  {
    name: 'Type',
    value: null,
  },
  {
    name: 'Warehouse',
    value: 100,
  },
  {
    name: 'Depot',
    value: 101,
  },
  {
    name: 'Terminal',
    value: 102,
  },
]

const filterArray = (array, property, criteria) => {
  if (!Array.isArray(array) || !Array.isArray(criteria)) {
    throw new Error("Both 'array' and 'criteria' should be arrays.");
  }

  return array.filter(item => criteria.includes(item?.[property]));
};

export default function Infrastructure({ auth }) {
  const { theme } = useStateContext();
  const [openAddInfrastructureModal, setOpenAddInfrastructureModal] = useState(false);

  const [addInfrustructureFormData, setAddInfrustructureFormData] = useState({
    type: null,
    name: '',
    address: '',
    access: '',
    image_url: '',
  });

  const handleAddInventoryInputChange = (e) => {
    const { name, value } = e.target;
    setAddInfrustructureFormData({ ...addInfrustructureFormData, [name]: value });
  };

  const handleAddInfrastructureSubmit = async (e) => {
    e.preventDefault();

    const parsedArray = addInfrustructureFormData.access.split(/[\s,;\n]+/).filter(Boolean);

    const data = {
      type: addInfrustructureFormData.type,
      name: addInfrustructureFormData.name,
      address: addInfrustructureFormData.address,
      access: JSON.stringify(parsedArray),
      image_url: addInfrustructureFormData.image_url,
    }

    try {
      const response = await axios.post('/infrastructure/create', data);
      setAddInfrustructureFormData({
        type: null,
        name: '',
        address: '',
        access: '',
        image_url: '',
      })

    } catch (error) {

    }
  }

  const [infrastructures, setInfrastructures] = useState();
  const fetchInfrastructures = async () => {
    try {
      const response = await axios.get('/infrastructure/get');
      setInfrastructures(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  useEffect(() => {
    fetchInfrastructures();
  }, [])

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Infrastructure</h2>}
    >
      <Head title="Infrastructure" />

      <DefaultLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Manage Infrastructures</h2>}>
        <div className="content">
          <div className='flex gap-4'>
            <div className="h-36 border-card min-w-36 mb-2 flex justify-center items-center hover:shadow-lg duration-200 hover:scale-105 hover:cursor-pointer"
              onClick={() => setOpenAddInfrastructureModal(true)}
            >
              <TbPlus size={48} color="gray" />
            </div>
            <div className='h-36 border-card w-full'>

            </div>
          </div>

          <p className='font-semibold text-2xl px-2' style={{ color: theme.text }}>Warehouses</p>
          <div className="py-4 flex flex-wrap gap-4">
            {infrastructures && filterArray(infrastructures, 'type', [100]).length > 0 ? (
              filterArray(infrastructures, 'type', [100]).map((data, index) => (
                <InfrastructureCard key={index} data={data} />
              ))
            ) : (
              <p className='px-4' style={{ color: theme.text }}>No warehouses available</p>
            )}
          </div>

          <p className='font-semibold text-2xl px-2' style={{ color: theme.text }}>Depots</p>
          <div className='py-4 flex flex-wrap gap-4'>
            {infrastructures && filterArray(infrastructures, 'type', [101]).length > 0 ? (
              filterArray(infrastructures, 'type', [101]).map((data, index) => (
                <InfrastructureCard key={index} data={data} />
              ))
            ) : (
              <p className='px-4' style={{ color: theme.text }}>No depots available</p>
            )}
          </div>

          <p className='font-semibold text-2xl px-2' style={{ color: theme.text }}>Terminals</p>
          <div className='py-4 flex flex-wrap gap-4'>
            {infrastructures && filterArray(infrastructures, 'type', [102]).length > 0 ? (
              filterArray(infrastructures, 'type', [102]).map((data, index) => (
                <InfrastructureCard key={index} data={data} />
              ))
            ) : (
              <p className='px-4' style={{ color: theme.text }}>No terminals available</p>
            )}
          </div>

          <Modal show={openAddInfrastructureModal} onClose={() => setOpenAddInfrastructureModal(false)}>
            <div className='p-4' style={{ color: theme.text }}>
              <p className='font-semibold text-xl mt-2 mb-4' style={{ color: theme.text }}>Add new Infrastructure</p>
              <form onSubmit={handleAddInfrastructureSubmit}>
                <div className='flex gap-2 mb-2'>
                  <input type="text" name="name" id="name" placeholder='Name'
                    className='border-card bg-transparent w-1/2'
                    style={{ borderColor: theme.border }}
                    value={addInfrustructureFormData.name}
                    onChange={handleAddInventoryInputChange}
                  />
                  <select name="type" id="type"
                    className='border-card bg-transparent w-1/2' style={{ borderColor: theme.border }}
                    onChange={handleAddInventoryInputChange}
                  >
                    {
                      options.map((option, index) => {
                        return (
                          <option key={index} value={option.value} style={{ background: theme.background }}>{option.name}</option>
                        )
                      })
                    }
                  </select>
                </div>
                <input type="text" name="address" id="address" placeholder='Address'
                  className='border-card bg-transparent w-full mb-2'
                  style={{ borderColor: theme.border }}
                  value={addInfrustructureFormData.address}
                  onChange={handleAddInventoryInputChange}
                />
                <input type="text" name="image_url" id="image_url" placeholder='Image Url'
                  className='border-card bg-transparent w-full mb-2'
                  style={{ borderColor: theme.border }}
                  value={addInfrustructureFormData.image_url}
                  onChange={handleAddInventoryInputChange}
                />
                <textarea type="text" name="access" id="access" placeholder='Access'
                  className='border-card bg-transparent w-full resize-none'
                  rows={4}
                  style={{ borderColor: theme.border }}
                  value={addInfrustructureFormData.access}
                  onChange={handleAddInventoryInputChange}
                />
                <div className='flex'>
                  <button className='border-card ml-auto'>Add Infrasture</button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </DefaultLayout>
    </AuthenticatedLayout>
  );
}
/* 
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';

import { useRef } from 'react';
import { TbPlus } from "react-icons/tb";
import InfrastructureCard from '@/Components/cards/InfrastructureCard';

export default function Infrastructure({ auth }) {
  const { theme } = useStateContext();

  const scrollContainerRef1 = useRef(null);
  const scrollContainerRef2 = useRef(null);
  const scrollContainerRef3 = useRef(null);

  const handleWheel = (event, ref) => {
    if (ref.current) {
      const container = ref.current;

      const canScrollHorizontally = container.scrollWidth > container.clientWidth;

      if (canScrollHorizontally) {
        event.preventDefault();
        event.stopPropagation();
        container.scrollLeft += event.deltaY;
      }
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Infrastructure</h2>}
    >
      <Head title="Infrastructure" />

      <div className="content">
        <div className="h-44 border-card w-36 mx-2 mb-2 flex justify-center items-center hover:shadow-lg duration-200 hover:scale-105">
          <TbPlus size={48} color="gray" />
        </div>

        <div
          className="p-2 overflow-x-auto h-48 flex gap-4 whitespace-nowrap scroll-smooth scroll-hide"
          onWheel={(e) => handleWheel(e, scrollContainerRef1)}
          ref={scrollContainerRef1}
        >
          <InfrastructureCard />
          <InfrastructureCard />
          <InfrastructureCard />
          <InfrastructureCard />
        </div>

        <div
          className="p-2 overflow-x-auto h-48 flex gap-4 whitespace-nowrap scroll-smooth scroll-hide"
          onWheel={(e) => handleWheel(e, scrollContainerRef2)}
          ref={scrollContainerRef2}
        >
          <InfrastructureCard />
          <InfrastructureCard />
          <InfrastructureCard />
          <InfrastructureCard />
        </div>

        <div
          className="p-2 overflow-x-auto h-48 flex gap-4 whitespace-nowrap scroll-smooth scroll-hide"
          onWheel={(e) => handleWheel(e, scrollContainerRef3)}
          ref={scrollContainerRef3}
        >
          <InfrastructureCard />
          <InfrastructureCard />
          <InfrastructureCard />
          <InfrastructureCard />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
 */