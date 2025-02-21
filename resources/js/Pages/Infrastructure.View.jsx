import InventoryLayout from '@/Layouts/InventoryLayout';
import { usePage, router } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';
import { useState, useEffect } from 'react';
import { TbEdit } from "react-icons/tb";
import { WeatherCloudChip, WeatherHumidityWindChip, WeatherTempChip } from '@/Components/Chips';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function Infrastructure_View({ auth }) {
  if (!hasAccess(auth.user.type, [2050, 2051])) {
    return (
      <Unauthorized />
    )
  }

  const { theme } = useStateContext();
  const { props } = usePage();
  const { id } = props;

  const handleClick1 = () => {
    router.get('/infrastructure');
  };

  const handleClick2 = (id) => {
    router.get('/infrastructure/view', { id: id });
  };

  const [infrastructure, setInfrastructure] = useState();

  const fetchInfrastructure = async (id) => {
    try {
      const response = await axios.get(`/infrastructure/get/${id}`);
      setInfrastructure(response.data);
    } catch (error) {
      handleClick1();
    }
  };

  useEffect(() => {
    fetchInfrastructure(id);
  }, []);


  useEffect(() => {
    if (infrastructure) {
      setEditInfrustructureFormData({
        name: infrastructure.name,
        address: infrastructure.address,
        access: infrastructure.access ? JSON.parse(infrastructure.access).join(", ") : [],
        image_url: infrastructure.image_url,
      })
    }
  }, [infrastructure]);

  const [openEditInfrastructureModal, setOpenEditInfrastructureModal] = useState(false);

  const [editInfrustructureFormData, setEditInfrustructureFormData] = useState({
    name: '',
    address: '',
    access: '',
    image_url: '',
  });

  const handleEditInventoryInputChange = (e) => {
    const { name, value } = e.target;
    setEditInfrustructureFormData({ ...editInfrustructureFormData, [name]: value });
  };

  const handleEditInfrastructureSubmit = async (e) => {
    e.preventDefault();

    const parsedArray = editInfrustructureFormData.access.split(/[\s,;\n]+/).filter(Boolean);

    const data = {
      name: editInfrustructureFormData.name,
      address: editInfrustructureFormData.address,
      access: JSON.stringify(parsedArray),
      image_url: editInfrustructureFormData.image_url,
    }

    try {
      const response = await axios.patch(`/infrastructure/update/${id}`, data);
      setEditInfrustructureFormData({
        name: '',
        address: '',
        access: '',
        image_url: '',
      })
      fetchInfrastructure(id);
      setOpenEditInfrastructureModal(false);
    } catch (error) {
      setOpenEditInfrastructureModal(false);
    }
  }

  const [weather, setWeather] = useState(null);
  const fetchWeather = async (lat, lng) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`)
      const data = await response.json();
      if (response.ok) {
        setWeather(data);
      }
    } catch (error) {

    }
  }

  useEffect(() => {
    if (infrastructure) {
      fetchWeather(infrastructure.lat, infrastructure.lng);
    }
  }, [infrastructure])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="View Infrastructure" />
      <InventoryLayout user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Infrastructure", "View"]}
          onClickHandlers={[
            () => handleClick1(),
            () => handleClick2(id)
          ]} />}
      >

        <div className="content">
          <div className='relative w-full border-card h-72 bg-cover bg-center flex' style={{ backgroundImage: `url(${infrastructure?.image_url ? infrastructure?.image_url : ''})` }}>
            <div className='h-fit'>
              <WeatherCloudChip data={weather} />
              <WeatherHumidityWindChip data={weather} className='mt-4' />
            </div>
            <WeatherTempChip temp={weather?.main.temp} className='absolute bottom-2 left-2 bg-white/80' />
            <span onClick={() => setOpenEditInfrastructureModal(true)}
              className='absolute bottom-2 right-2 p-3 rounded-full shadow-lg hover:scale-105 duration-200 cursor-pointer'
              style={{ background: theme.accent, color: theme.background }}
            >
              <TbEdit size={24} />
            </span>
          </div>

          <div style={{ color: theme.text }}>
            <p className='text-xl font-medium mt-4'>{infrastructure?.name}</p>
            <p>{infrastructure?.address}</p>

            <p className='text-xl font-semibold mt-4' >Access</p>
            <div className='my-2'>
              {
                infrastructure?.access && JSON.parse(infrastructure?.access).map((a, index) => {
                  return (
                    <p key={index}>{a}</p>
                  )
                })
              }
            </div>
          </div>

          <Modal show={openEditInfrastructureModal} onClose={() => setOpenEditInfrastructureModal(false)} name='Edit Infrastructure Information'>
            <div style={{ color: theme.text }}>
              <form onSubmit={handleEditInfrastructureSubmit}>
                <input type="text" name="name" id="name" placeholder='Name'
                  className='border-card bg-transparent w-full mb-2'
                  style={{ borderColor: theme.border }}
                  value={editInfrustructureFormData.name}
                  onChange={handleEditInventoryInputChange}
                />
                <input type="text" name="address" id="address" placeholder='Address'
                  className='border-card bg-transparent w-full mb-2'
                  style={{ borderColor: theme.border }}
                  value={editInfrustructureFormData.address}
                  onChange={handleEditInventoryInputChange}
                />
                <input type="text" name="image_url" id="image_url" placeholder='Image Url'
                  className='border-card bg-transparent w-full mb-2'
                  style={{ borderColor: theme.border }}
                  value={editInfrustructureFormData.image_url}
                  onChange={handleEditInventoryInputChange}
                />
                <textarea type="text" name="access" id="access" placeholder='Access'
                  className='border-card bg-transparent w-full resize-none'
                  rows={4}
                  style={{ borderColor: theme.border }}
                  value={editInfrustructureFormData.access}
                  onChange={handleEditInventoryInputChange}
                />
                <div className='flex'>
                  <button className='border-card ml-auto'>Save Changes</button>
                </div>
              </form>
            </div>
          </Modal>
        </div>
      </InventoryLayout>
    </AuthenticatedLayout>
  );
}
