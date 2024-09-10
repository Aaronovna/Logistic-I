import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { TbUser } from "react-icons/tb";
import { TbBriefcase } from "react-icons/tb";
import { TbUserPlus } from "react-icons/tb";
import { TbPlus } from "react-icons/tb";
import { TbX } from "react-icons/tb";

import Card from '@/Components/Card';
import Modal from '@/Components/Modal';

export default function User({ auth }) {

  const [users, setUsers] = useState(null);
  const [positions, setPositions] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [openAddPositionModal, setOpenAddPositionModal] = useState(false);
  const [openEditPositionModal, setOpenEditPositionModal] = useState(false);

  const [openAddUserModal, setOpenAddUserModal] = useState(false);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
  };

  const [positionSelectedData, setPositionSelectedData] = useState(null)

  const onPositionSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setPositionSelectedData(selectedRows[0] || null);
  };

  const [addPositionName, setAddPositionName] = useState("");
  const [editPositionName, setEditPositionName] = useState("");

  const handleAddPositionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/position/create', {name: addPositionName});

      setAddPositionName("");
      toast.success('Position added successfully');
      fetchPositions();
      setOpenAddPositionModal(false);
    } catch (error) {
      toast.error('Failed to add position' + error);
    }
  };

  const handleEditPositionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`/position/update/${positionSelectedData.id}`, {name: editPositionName});

      toast.success('Position updated successfully');
      setEditPositionName("");
      fetchPositions();
      setOpenEditPositionModal(false);
    } catch (error) {
      toast.error('Failed to update position' + error);
    }
  };

  const handleDeletePosition = async (id) => {
    try {
      await axios.delete(`/position/delete/${id}}`);
      fetchPositions();
      setOpenEditPositionModal(false);
      toast.success('Position deleted successfully');
    } catch (error) {
      toast.error('Error deleting position:', error);
    }
  };


  const userColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 1, minWidth: 200 },
    { field: "email", filter: true, flex: 1, minWidth: 200 },
    {
      field: "action",
      minWidth: 70,
      maxWidth: 90,
      cellRenderer: (params) => {
        return (
          <p>ads</p>
        )
      }
    }
  ];

  const positionColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90 },
    { field: "name", filter: true, flex: 1, minWidth: 200 },
  ];

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/user/get');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users:', error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get('/position');
      setPositions(response.data);
    } catch (error) {
      toast.error('Error fetching positions:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPositions();
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium text-3xl text-[#004369]">Manage Users</h2>}
    >
      <Head title="Users" />

      <div className='flex m-8 flex-col'>

        <div className='flex items-center gap-6'>
          <Card data={users ? users.length : "-"} name="Users" Icon={TbUser} />
          <Card data={positions ? positions.length : "-"} name="Positions" Icon={TbBriefcase} />
        </div>

        <div className='flex md:flex-row flex-col gap-8'>

          <div className="md:w-2/3 w-full realtive p-1">
            <span className='flex justify-between h-14 items-center'>
              <p className='text-xl text-[#004369] font-semibold h-fit'>Users</p>
              <button className='bg-[#004369] text-white m-2 mr-0 p-2 rounded-md flex items-center gap-1' onClick={() => setOpenAddUserModal(true)}>
                <TbUserPlus />
                <p className='md:block hidden'>Add Users</p>
              </button>
            </span>
            <div className='ag-theme-quartz' style={{ height: '400px' }}>
              <AgGridReact
                rowData={users}
                columnDefs={userColDefs}
                rowSelection='single'
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
              />
            </div>

          </div>
          <div className="md:w-1/3 w-full relative p-1">
            <span className='flex justify-between h-14 items-center'>
              <p className='text-xl text-[#004369] font-semibold h-fit'>Positions</p>
              <button className='bg-[#004369] text-white m-2 mr-0 p-2 rounded-md flex items-center gap-1' onClick={() => setOpenAddPositionModal(true)}>
                <TbPlus size={24} />
              </button>
            </span>
            <div className='ag-theme-quartz' style={{ height: '400px' }}>
              <AgGridReact
                rowData={positions}
                columnDefs={positionColDefs}
                rowSelection='single'
                onGridReady={onGridReady}
                onSelectionChanged={onPositionSelectionChanged}
                onRowClicked={() => setOpenEditPositionModal(true)}
              />
            </div>

            {/* MODAL FOR ADD POSITION */}
            <div className={`w-t-grad z-10 absolute h-full w-full top-0 left-0 p-1 bg-white/50 backdrop-blur-sm duration-300 ${openAddPositionModal ? 'visible opacity-100' : 'invisible opacity-0'}`}>
              <span className='h-14 flex justify-end items-center rounded-md'>
                <button className='font-semibold bg-[#f2a5a5] m-2 mr-0 p-2 rounded-md flex text-white'
                  onClick={() => setOpenAddPositionModal(false)}
                >
                  <TbX size={24} />
                </button>
              </span>
              <form onSubmit={handleAddPositionSubmit} className='flex flex-col p-2 border-card' action="">
                <p className='font-semibold text-2xl inline-block h-fit text-[#004369] w-full text-center mb-2'>Add Position</p>
                <input
                  className='border-card'
                  type="text"
                  name="name"
                  id="name"
                  value={addPositionName}
                  onChange={(e) => setAddPositionName(e.target.value)}
                />
                <button className='p-2 mt-2 font-semibold bg-[#004369] text-white border-card'>Create</button>
              </form>
            </div>

            {/* MODAL FOR EDITING AND DELETING POSITION */}
            <div className={`w-t-grad z-10 absolute h-full w-full top-0 left-0 p-1 bg-white/50 backdrop-blur-sm duration-300 ${openEditPositionModal ? 'visible opacity-100' : 'invisible opacity-0'}`}>
              <span className='h-14 flex justify-end items-center rounded-md'>
                <button className='font-semibold bg-[#f2a5a5] m-2 mr-0 p-2 rounded-md flex text-white'
                  onClick={() => setOpenEditPositionModal(false)}
                >
                  <TbX size={24} />
                </button>
              </span>
              <form onSubmit={handleEditPositionSubmit} className='flex flex-col p-2 border-card' action="">
                <p className='font-semibold text-2xl inline-block h-fit text-[#004369] w-full text-center mb-2'>Edit Position</p>
                <input
                  className='border-card'
                  type="text"
                  name="name"
                  id="name"
                  placeholder={positionSelectedData?positionSelectedData.name:''}
                  value={editPositionName}
                  onChange={(e) => setEditPositionName(e.target.value)}
                />
                <button type='submit' className='p-2 mt-2 font-semibold bg-[#004369] text-white border-card'>Update</button>
                <button type='button' className='p-2 mt-2 font-semibold bg-[#f2a5a5] text-white border-card' onClick={()=>handleDeletePosition(positionSelectedData.id)}>Remove</button>
              </form>
            </div>
          </div>
        </div>

        <div className='border-card my-8'>{positionSelectedData ? positionSelectedData.id : 'asd'}</div>
      </div>

      <Modal show={openAddUserModal} onClose={() => setOpenAddUserModal(false)}>

      </Modal>
    </AuthenticatedLayout>
  );
}
