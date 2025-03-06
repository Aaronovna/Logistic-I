import useRole from '@/hooks/useRole';
import { router } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';
import { TbPlus } from "react-icons/tb";
import { useState, useEffect } from 'react';
import AddressPicker from '@/Components/AddressPicker';
import InfrastructureCard from '@/Components/cards/InfrastructureCard';

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
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const { theme } = useStateContext();
  const [openAddInfrastructureModal, setOpenAddInfrastructureModal] = useState(false);

  const [addInfrustructureFormData, setAddInfrustructureFormData] = useState({
    type: null,
    name: '',
    address: '',
    access: '',
    image_url: '',
    lng: '',
    lat: '',
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
      lng: geoInfo.lng,
      lat: geoInfo.lat,
    }

    try {
      const response = await axios.post('/infrastructure/create', data);
      setAddInfrustructureFormData({
        type: null,
        name: '',
        address: '',
        access: '',
        image_url: '',
        lng: '',
        lat: '',
      })
      setOpenAddInfrastructureModal(false);
      toast.success(response.data.message);
      fetchInfrastructures();
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [infrastructures, setInfrastructures] = useState();
  const fetchInfrastructures = async () => {
    try {
      const response = await axios.get('/infrastructure/get');
      setInfrastructures(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    fetchInfrastructures();
  }, [])

  const handleInfrastructureClick = (id) => {
    router.get('/infrastructure/view', { id: id });
  };

  const [geoInfo, setGeoInfo] = useState({ name: '', lng: 0, lat: 0 });

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Infrastructure" />
      <Layout user={auth.user} header={<NavHeader headerName='Infrastructure' />}>
        {!hasAccess(auth.user.type, [2050, 2051]) ? <Unauthorized /> :
          <div className="content">
            <div className='flex gap-4'>
              <button className="h-36 min-w-36 mb-2 hover:shadow-lg hover:scale-105 btn bg-transparent hover:bg-transparent border-card disable"
                onClick={() => setOpenAddInfrastructureModal(true)}
                disabled={!hasPermissions([122])}
              >
                <TbPlus size={48} color="gray" />
              </button>
              <div className='h-36 border-card w-full'>

              </div>
            </div>

            <p className='font-medium text-xl px-2' style={{ color: theme.text }}>Warehouses</p>
            <div className="py-4 grid grid-cols-3 gap-4">
              {infrastructures && filterArray(infrastructures, 'type', [100]).length > 0 ? (
                filterArray(infrastructures, 'type', [100]).map((data, index) => (
                  <InfrastructureCard key={index} data={data} onClick={() => handleInfrastructureClick(data.id)} />
                ))
              ) : (
                <p className='px-4' style={{ color: theme.text }}>No warehouses available</p>
              )}
            </div>

            <p className='font-medium text-xl px-2' style={{ color: theme.text }}>Depots</p>
            <div className="py-4 grid grid-cols-3 gap-4">
              {infrastructures && filterArray(infrastructures, 'type', [101]).length > 0 ? (
                filterArray(infrastructures, 'type', [101]).map((data, index) => (
                  <InfrastructureCard key={index} data={data} onClick={() => handleInfrastructureClick(data.id)} />
                ))
              ) : (
                <p className='px-4' style={{ color: theme.text }}>No depots available</p>
              )}
            </div>

            <p className='font-medium text-xl px-2' style={{ color: theme.text }}>Terminals</p>
            <div className="py-4 grid grid-cols-3 gap-4">
              {infrastructures && filterArray(infrastructures, 'type', [102]).length > 0 ? (
                filterArray(infrastructures, 'type', [102]).map((data, index) => (
                  <InfrastructureCard key={index} data={data} onClick={() => handleInfrastructureClick(data.id)} />
                ))
              ) : (
                <p className='px-4' style={{ color: theme.text }}>No terminals available</p>
              )}
            </div>

            <Modal show={openAddInfrastructureModal} onClose={() => setOpenAddInfrastructureModal(false)} maxWidth='4xl' name='Add new Infrastructure'>
              <div className='flex gap-4' style={{ color: theme.text }}>
                <form className='w-1/2 flex flex-col' onSubmit={handleAddInfrastructureSubmit}>
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
                  <textarea type="text" name="address" id="address" placeholder='Address'
                    className='border-card bg-transparent w-full mb-2 resize-none' rows={2}
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
                  <div className='flex mt-auto'>
                    <button className='btn w-full disable' disabled={!hasPermissions([122])}>Add Infrastructure</button>
                  </div>
                </form>
                <div className='w-1/2'>
                  <AddressPicker setGeoInfo={setGeoInfo}>
                    <AddressPicker.Searchbar></AddressPicker.Searchbar>
                    <div className='w-full h-96 overflow-hidden rounded-md border mt-2'>
                      <AddressPicker.Picker></AddressPicker.Picker>
                    </div>
                  </AddressPicker>
                </div>
              </div>
            </Modal>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}