import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DefaultLayout from '@/Layouts/DefaultLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';
import { useState, useEffect } from 'react';
import { TbEdit } from "react-icons/tb";
import Modal from '@/Components/Modal';

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

export default function Infrastructure_View({ auth }) {
  const { theme } = useStateContext();
  const { props } = usePage();

  const { id } = props;

  const handleClick1 = () => {
    router.get('/infrastructure');
  };

  const handleClick2 = () => {
    router.get('/infrastructure/view', { id: id });
  };

  const [infrastructure, setInfrastructure] = useState();

  const fetchInfrastructure = async () => {
    try {
      const response = await axios.get(`/infrastructure/get/${id}`);
      setInfrastructure(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  useEffect(() => {
    fetchInfrastructure()
  }, []);


  useEffect(() => {
    if (infrastructure) {
      setEditInfrustructureFormData({
        type: infrastructure.type,
        name: infrastructure.name,
        address: infrastructure.address,
        access: JSON.parse(infrastructure.access).join(", "),
        image_url: infrastructure.image_url,
      })
    }
  }, [infrastructure]);

  const [openEditInfrastructureModal, setOpenEditInfrastructureModal] = useState(false);

  const [editInfrustructureFormData, setEditInfrustructureFormData] = useState({
    type: null,
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
      type: editInfrustructureFormData.type,
      name: editInfrustructureFormData.name,
      address: editInfrustructureFormData.address,
      access: JSON.stringify(parsedArray),
      image_url: editInfrustructureFormData.image_url,
    }

    try {
      const response = await axios.patch(`/infrastructure/update/${id}`, data);
      setEditInfrustructureFormData({
        type: null,
        name: '',
        address: '',
        access: '',
        image_url: '',
      })
      fetchInfrastructure();
      setOpenEditInfrastructureModal(false);
    } catch (error) {
      setOpenEditInfrastructureModal(false);
    }
  }

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 style={{ color: theme.text }}>
        <span className='header hover:underline cursor-pointer' onClick={handleClick1}>{`Infrastructure`}</span>
        <span className='header'>{' > '}</span>
        <span className='header hover:underline cursor-pointer' onClick={handleClick2}>{`View`}</span>
      </h2>}
    >
      <Head title="View Infrastructure" />

      <DefaultLayout user={auth.user} header={<h2 style={{ color: theme.text }}>
        <span className='header hover:underline cursor-pointer' onClick={handleClick1}>{`Infrastructure`}</span>
        <span className='header'>{' > '}</span>
        <span className='header hover:underline cursor-pointer' onClick={handleClick2}>{`View`}</span>
      </h2>}>
      
        <div className="content">
          <div className='w-full border-card h-56 bg-cover bg-center flex' style={{ backgroundImage: `url(${infrastructure?.image_url})` }}>
            <span onClick={() => setOpenEditInfrastructureModal(true)}
              className='mt-auto ml-auto p-3 rounded-full shadow-lg hover:scale-105 duration-200 cursor-pointer'
              style={{ background: theme.accent, color: theme.background }}
            >
              <TbEdit size={24} />
            </span>
          </div>
          <div style={{ color: theme.text }}>
            <p className='text-2xl font-semibold mt-4'>{infrastructure?.name}</p>
            <p className='text-xl'>{infrastructure?.address}</p>

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

          <Modal show={openEditInfrastructureModal} onClose={() => setOpenEditInfrastructureModal(false)}>
            <div className='p-4' style={{ color: theme.text }}>
              <p className='font-semibold text-xl mt-2 mb-4' style={{ color: theme.text }}>Edit Infrastructure Detail</p>
              <form onSubmit={handleEditInfrastructureSubmit}>
                <div className='flex gap-2 mb-2'>
                  <input type="text" name="name" id="name" placeholder='Name'
                    className='border-card bg-transparent w-1/2'
                    style={{ borderColor: theme.border }}
                    value={editInfrustructureFormData.name}
                    onChange={handleEditInventoryInputChange}
                  />
                  <select name="type" id="type"
                    className='border-card bg-transparent w-1/2' style={{ borderColor: theme.border }}
                    onChange={handleEditInventoryInputChange}
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
      </DefaultLayout>
    </AuthenticatedLayout>
  );
}
