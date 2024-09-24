import { Head } from '@inertiajs/react';
import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { useStateContext } from '@/context/contextProvider';

import Modal from '@/Components/Modal';
import { Card } from '@/Components/Cards';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

import { TbCategory } from "react-icons/tb";
import { TbPlus } from "react-icons/tb";
import { TbEdit } from "react-icons/tb";
import { TbX } from "react-icons/tb";

export default function Category({ auth }) {
  const { theme, themePreference } = useStateContext();

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
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90,},
    { field: "name", filter: true, flex: 1 },
    { field: "products_count", headerName: 'Products Count', minWidth: 120,maxWidth: 150, },
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
              className='hover:bg-[#b3e9ff] p-2 rounded-full'
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
              className='hover:bg-[#FF9E8D] p-2 rounded-full'
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
      toast.success('Category added successfully');
      fetchCategories();
      setOpenAddModal(false);
    } catch (error) {
      toast.error('Failed to add category' + error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/category/update/${editFormData.id}`, editFormData);

      toast.success('Category updated successfully');
      fetchCategories();
      setOpenEditModal(false);
    } catch (error) {
      toast.error('Failed to add category' + error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/category/delete/${id}}`);
      fetchCategories();
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Error deleting category:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category/get/count');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium md:text-3xl text-xl" style={{ color: theme.text }}>Manage Categories</h2>}
    >
      <Head title="Category" />

      <div className="mx-4">
        <div className='flex flex-col gap-4'>
          <div className='flex items-end'>
            <Card data={categories ? categories.length : "-"} name="Categories" Icon={TbCategory} />
            <button
              onClick={() => setOpenAddModal(true)}
              className='rounded-lg h-fit py-2 px-2 ml-auto hover:scale-105 hover:shadow-xl duration-200 flex items-center'
              style={{ background: theme.accent, color: theme.background }}
            >
              <TbPlus size={18} />
              <p className='ml-1'>Add Category</p>
            </button>
          </div>

          <div>
            <div className={`${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '380px' }} >
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
            <div className='border-card p-4' style={{color: theme.text}}>
              <span className='flex mb-2'>
                <p className='text-gray-300/50 mr-2'>{selectedData.id}</p>
                <p className='font-semibold'>{selectedData.name}</p>
              </span>
              <p>{selectedData.description}</p>
            </div>
            : null}
        </div>
      </div>


      {/* MODAL FOR CREATING NEW CATEGORY */}
      <Modal show={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth='lg'>
        <form onSubmit={handleAddSubmit} className="p-4" style={{color: theme.text}}>
          <p className='font-semibold text-xl mt-2 mb-4'>Add New Category</p>
          <input
            type="text"
            name="name"
            id="name"
            value={addFormData.name}
            onChange={handleAddInputChange}
            placeholder="Category Name"
            className="mb-2 p-2 border rounded w-full bg-transparent"
            style={{borderColor: theme.border}}
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
            style={{borderColor: theme.border}}
          />
          <button type="submit" className="p-2 border-card font-medium text-white block ml-auto" style={{background: theme.primary, borderColor: theme.border}}>Submit</button>
        </form>
      </Modal>

      {/* MODAL FOR EDITING EXISTING CATEGORY */}
      <Modal show={openEditModal} onClose={() => setOpenEditModal(false)}>
        <form onSubmit={handleEditSubmit} className="p-4" style={{color: theme.text}}>
          <p className='font-semibold text-xl mt-2 mb-4'>Edit Category</p>
          <input
            type="text"
            name="name"
            id="name"
            value={editFormData.name}
            onChange={handleEditInputChange}
            placeholder="Category Name"
            className="mb-2 p-2 border rounded w-full bg-transparent"
            style={{borderColor: theme.border}}
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
            style={{borderColor: theme.border}}
          />
          <button type="submit" className="p-2 border-card font-medium text-white block ml-auto" style={{background: theme.primary, borderColor: theme.border}}>Update</button>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
