import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Head } from '@inertiajs/react';
import Modal from '@/Components/Modal';
import axios from 'axios';

import { TbCategory } from "react-icons/tb";
import { TbPlus } from "react-icons/tb";
import { TbEdit } from "react-icons/tb";
import { TbX } from "react-icons/tb";

export default function Category({ auth }) {

  const [categories, setCategories] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [gridApi, setGridApi] = useState(null);

  

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [editData, setEditData] = useState({
    name: '',
    description: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const [colDefs, setColDefs] = useState([
    { field: "id", filter: true, flex: 1 },
    { field: "name", filter: true, flex: 1 },
    { field: "products_count", headerName: 'Products Count' },
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
              className='hover:bg-[#B2E9FF] p-2 rounded-full'
              onClick={() => {
                setOpenEditModal(true);
                setEditData({
                  id: params.data.id,
                  name: params.data.name,
                  description: params.data.description
                })
              }}
            >
              <TbEdit size={18} />
            </button>
            <button
              className='hover:bg-[#f2a5a5] p-2 rounded-full'
              onClick={() => handleDelete(params.data.id)}
            >
              <TbX size={18} />
            </button>
          </span>
        );
      }
    }
  ]);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/category', formData);

      setRowData([...rowData, response.data]);
      setOpenAddModal(false);
      setFormData({ name: '', description: '' });
      fetchCategories();

    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/category/update/${editData.id}`, editData);
  
      if (response.status === 200) {
        alert('Category updated successfully');
        fetchCategories();
        setOpenEditModal(false);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to update category');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/category/delete/${id}}`);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
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
      header={<h2 className="font-medium text-3xl text-[#004369]">Manage Categories</h2>}
    >
      <Head title="Category" />

      <div className="m-8">
        <div className='flex flex-col gap-4'>
          <div className='flex'>
            <div className='flex rounded-lg py-2 p-4 items-center bg-[#EEF9FF] w-fit border-gray-300 border'>
              <span className='flex justify-center items-center rounded-full aspect-square w-fit h-fit'>
                <TbCategory size={46} title='Category' />
              </span>
              <span className='ml-4'>
                <p className='font-semibold text-2xl text-right'>{categories ? categories.length : '-'}</p>
                <p className='text-sm text-gray-400'>Category</p>
              </span>
            </div>
            <button
              onClick={() => setOpenAddModal(true)}
              className='border-card py-3 px-5 bg-[#B2E9FF] ml-auto hover:scale-105 hover:shadow-xl duration-200 aspect-square'
            >
              <TbPlus size={32} />
            </button>
          </div>

          <div>
            <div className='ag-theme-quartz h-96' style={{ height: '400px' }}>
              <AgGridReact
                rowData={categories}
                columnDefs={colDefs}
                rowSelection='single'
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
              />
            </div>
          </div>

          {selectedData ?
            <div className='border-card p-4'>
              <span className='flex mb-2'>
                <p className='text-gray-500 mr-2'>{selectedData.id}</p>
                <p className='font-semibold'>{selectedData.name}</p>
              </span>
              <p>{selectedData.description}</p>
            </div>
            : null}
        </div>
      </div>


      {/* MODAL FOR CREATING NEW CATEGORY */}
      <Modal show={openAddModal} onClose={() => setOpenAddModal(false)}>
        <form onSubmit={handleSubmit} className="p-4">
          <p className='font-semibold text-xl mt-2 mb-4'>Add New Category</p>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Category Name"
            className="mb-2 p-2 border rounded w-full"
          />
          <input
            type="text"
            name="description"
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Category Description"
            className="mb-2 p-2 border rounded w-full"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
        </form>
      </Modal>

      {/* MODAL FOR EDITING EXISTING CATEGORY */}
      <Modal show={openEditModal} onClose={() => setOpenEditModal(false)}>
        <form onSubmit={handleEditSubmit} className="p-4">
          <p className='font-semibold text-xl mt-2 mb-4'>Edit Category</p>
          <input
            type="text"
            name="name"
            id="name"
            value={editData.name}
            onChange={handleEditInputChange}
            placeholder="Category Name"
            className="mb-2 p-2 border rounded w-full"
          />
          <textarea
            type="text"
            name="description"
            id="description"
            value={editData.description}
            onChange={handleEditInputChange}
            placeholder="Category Description"
            className="mb-2 p-2 border rounded w-full"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Save</button>
        </form>
      </Modal>
    </AuthenticatedLayout>
  );
}
