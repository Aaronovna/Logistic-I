import { useState, useCallback, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { AgGridReact } from 'ag-grid-react';

import useRole from '@/hooks/useRole';
import { Card } from '@/Components/Cards';

import { TbCategory } from "react-icons/tb";
import { TbPlus } from "react-icons/tb";
import { TbEdit } from "react-icons/tb";
import { TbX } from "react-icons/tb";

const Category = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const { themePreference, userPermissions } = useStateContext();

  const [categories, setCategories] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
  };

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: ''
  });

  const [addFormData, setAddFormData] = useState({
    name: '',
    description: ''
  });

  const colDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 1 },
    { field: "products_count", headerName: 'Products Count', minWidth: 120, maxWidth: 150, },
    { field: "description", flex: 2, sortable: false, },
    {
      field: "action",
      sortable: false,
      minWidth: 70,
      maxWidth: 90,
      cellRenderer: (params) => {
        return (
          <span className='flex w-full justify-center items-center h-full'>
            <button
              disabled={!hasPermissions([352])}
              className='hover:bg-[#b3e9ff] p-2 rounded-full disable'
              onClick={() => {
                setOpenEditModal(true);
                setEditFormData({
                  id: params.data.id,
                  name: params.data.name,
                  description: params.data.description
                })
              }}
            >
              <TbEdit size={18} />
            </button>
            <button
              disabled={!hasPermissions([352])}
              className='hover:bg-[#FF9E8D] p-2 rounded-full disable'
              onClick={() => handleDelete(params.data.id)}
            >
              <TbX size={18} />
            </button>
          </span>
        );
      }
    }
  ];

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddFormData({ ...addFormData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/category/create', addFormData);
      setAddFormData({ name: '', description: '' });
      fetchCategories();
      setOpenAddModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/category/update/${editFormData.id}`, editFormData);
      fetchCategories();
      setOpenEditModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`/category/delete/${id}`);
      fetchCategories();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category/get/count');
      setCategories(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    if (hasPermissions([351])) {
      fetchCategories();
    }
  }, [userPermissions]);

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Category" />

      <Layout user={auth.user} header={<NavHeader headerName="Category" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content">
            <div className='flex flex-col gap-4'>
              <div className='flex items-end'>
                <Card data={categories ? categories.length : "-"} name="Categories" Icon={TbCategory} />
                <button
                  onClick={() => setOpenAddModal(true)}
                  className='disable rounded-lg h-fit py-2 bg-accent text-background px-2 ml-auto hover:scale-105 hover:shadow-xl duration-200 flex items-center'
                  disabled={!hasPermissions([352])}
                >
                  <TbPlus size={18} />
                  <p className='ml-1'>Add Category</p>
                </button>
              </div>

              <div>
                <div className={`${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '508px' }} >
                  <AgGridReact
                    rowData={categories}
                    columnDefs={colDefs}
                    rowSelection='single'
                    pagination={true}
                    onGridReady={onGridReady}
                    onSelectionChanged={onSelectionChanged}
                  />
                </div>
              </div>

              {selectedData ?
                <div className='border-card p-4 text-text'>
                  <span className='flex mb-2'>
                    <p className='mr-2 font-semibold'>{selectedData.id}</p>
                    <p className=''>{selectedData.name}</p>
                  </span>
                  <p>{selectedData.description}</p>
                </div>
                : null}
            </div>
            <Modal show={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth='lg' name="Add New Category">
              <form onSubmit={handleAddSubmit} className='text-text'>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={addFormData.name}
                  onChange={handleAddInputChange}
                  placeholder="Category Name"
                  className="mb-2 p-2 border rounded w-full bg-transparent"
                />
                <textarea
                  type="text"
                  name="description"
                  id="description"
                  rows={4}
                  value={addFormData.description}
                  onChange={handleAddInputChange}
                  placeholder="Category Description"
                  className="mb-2 p-2 border rounded w-full resize-none bg-transparent"
                />
                <button type="submit" disabled={!hasPermissions([352])}
                  className="p-2 border-card font-medium block ml-auto disable bg-accent text-background" 
                >
                  Submit
                </button>
              </form>
            </Modal>
            <Modal show={openEditModal} onClose={() => setOpenEditModal(false)} name="Edit Category">
              <form onSubmit={handleEditSubmit} className='text-text'>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="Category Name"
                  className="mb-2 p-2 border rounded w-full bg-transparent"
                />
                <textarea
                  type="text"
                  name="description"
                  id="description"
                  rows={4}
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  placeholder="Category Description"
                  className="mb-2 p-2 border rounded w-full bg-transparent resize-none"
                />
                <button type="submit" disabled={!hasPermissions([352])}
                  className="disable p-2 border-card font-medium block ml-auto text-background bg-accent"
                >
                  Update
                </button>
              </form>
            </Modal>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Category;
