import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback, useRef } from 'react';
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

import { roles } from '@/Constants/roles';

const dummyEmployeesData = [
  {
    fname: 'Saika',
    sname: 'Kaede',
    email: 'saika.kaede@app.net',
    employeeId: '1212',
  },
  {
    fname: 'Karen',
    sname: 'Ishikawa',
    email: 'karen.ishikawa@app.net',
    employeeId: '3434',
  },
  {
    fname: 'Mio',
    sname: 'kawakita',
    email: 'mio.kawakita@app.net',
    employeeId: '5656',
  },
]

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

  const [userSelectedData, setUserSelectedData] = useState(null)
  const onUserSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setUserSelectedData(selectedRows[0] || null);
  };

  const [positionSelectedData, setPositionSelectedData] = useState(null)

  const onPositionSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setPositionSelectedData(selectedRows[0] || null);
  };

  const [addPositionName, setAddPositionName] = useState("");
  const [editPositionName, setEditPositionName] = useState("");

  const [addUserFormData, setAddUserFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleAddUserInputChange = (e) => {
    const { name, value } = e.target;
    setAddUserFormData({ ...addFormData, [name]: value });
  };

  const handleAddUserInput = (employee) => {
    setAddUserFormData({
      ...addUserFormData,
      name: employee.fname + " " + employee.sname,
      email: employee.email,
      password: userPasswordGenerator(employee)
    });
  };

  const handleAddPositionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/position/create', { name: addPositionName });

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
      const response = await axios.patch(`/position/update/${positionSelectedData.id}`, { name: editPositionName });

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

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/user/create', addUserFormData);

      toast.success('User added successfully');
      fetchUsers();
      setOpenAddUserModal(false);
    } catch (error) {
      toast.error('Failed to add user' + error);
    }
  };

  const userColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 2, minWidth: 200 },
    { field: "email", filter: true, flex: 2, minWidth: 200 },
    {
      field: "email_verified_at", filter: true, flex: 1, headerName: "Status",
      cellRenderer: (params) => {
        return (
          <span className='flex flex-col w-full justify-center items-center h-full'>
            <p>{params.data.email_verified_at ? 'Verified' : 'Unverified'}</p>
          </span>
        )
      }
    },
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

  const [openEmployeeDropdown, setOpenEmployeeDropdown] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [searchedEmployee, setSearchedEmployee] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const employeeDropdownRef = useRef(null);

  //MULTIPLE FIELD SEARCH
  const handleSearchEmployee = (e) => {
    const searchQuery = e.target.value.toLowerCase();
    setSearchedEmployee(searchQuery);

    if (searchQuery.trim() === "") {
      setFilteredEmployees([]);
      return;
    }

    const filtered = dummyEmployeesData.filter(employee =>
      employee.fname.toLowerCase().includes(searchQuery) ||
      employee.sname.toLowerCase().includes(searchQuery) ||
      employee.email.toLowerCase().includes(searchQuery) ||
      employee.employeeId.toLowerCase().includes(searchQuery)
    );

    setFilteredEmployees(filtered);
    setOpenEmployeeDropdown(true);
  };

  //SINGLE FIELD SEARCH
  /* const handleSearchEmployee = e => {
    const searchQuery = e.target.value;
    setSearchedEmployee(searchQuery);

    if (searchQuery.trim() === "") {
      setFilteredEmployees([]);
      return;
    }

    const filtered = dummyEmployeesData.filter(employee =>
      employee.fname.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
    setOpenEmployeeDropdown(true);
  }; */

  const userPasswordGenerator = (employee) => {
    const firstPart = employee.fname.slice(0, 2).toUpperCase();
    const secondPart = employee.sname.slice(0, 2).toUpperCase();
    const lastFourDigits = employee.employeeId.toString().slice(-4);

    const password = `#${firstPart}${secondPart}${lastFourDigits}`;
    return password;
  }

  const handleSelectEmployee = employee => {
    setSelectedEmployee(employee);
    setSearchedEmployee(employee);
    setOpenEmployeeDropdown(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchPositions();
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium md:text-3xl text-xl text-[#004369]">Manage Users</h2>}
    >
      <Head title="Users" />

      <div className='flex mx-4 flex-col'>

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
                onSelectionChanged={onUserSelectionChanged}
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
                  placeholder={positionSelectedData ? positionSelectedData.name : ''}
                  value={editPositionName}
                  onChange={(e) => setEditPositionName(e.target.value)}
                />
                <button type='submit' className='p-2 mt-2 font-semibold bg-[#004369] text-white border-card'>Update</button>
                <button type='button' className='p-2 mt-2 font-semibold bg-[#f2a5a5] text-white border-card' onClick={() => handleDeletePosition(positionSelectedData.id)}>Remove</button>
              </form>
            </div>
          </div>
        </div>

        <div className={`border-card my-4 p-4 ${userSelectedData ? 'block' : 'hidden'}`}>
          <p className='text-xl font-medium'>Edit User</p>
          <p className='text-lg'><p className='inline font-medium'>Name:</p> {userSelectedData ? userSelectedData.name : ''}</p>
          <form action="" className='my-4'>
            <p className='text-lg font-medium'>Edit User Roles</p>
            <div className='my-2 relative border-card p-1 bg-[#EEF9FF] grid grid-cols-3 grid-rows-3 grid-flow-col'>
              <div className={`${userSelectedData && userSelectedData.email_verified_at ? ' hidden ' : ' absolute '}   bg-white/50 p-1 top-0 left-0 border-card backdrop-blur-sm w-full h-full flex justify-center items-center`}>
                <p className='text-xl font-semibold'>User is not verified yet</p>
              </div>
              {roles.map((role, index) => {
                return (
                  <label htmlFor={role.code} className='flex m-1 w-fit h-fit gap-2 items-center' key={index}>
                    <input type="checkbox" className='h-0 w-0 absolute block invisible overflow-hidden' name={role.alias} id={role.code} />
                    <span className='check w-5 h-5 bg-white inline-block rounded border border-gray-300'></span>
                    <p>{role.alias}</p>
                  </label>
                )
              })}
            </div>
            <button className={`bg-[#004369] text-white font-semibold p-2 border-card`}>Save</button>
          </form>
        </div>
      </div>

      <Modal show={openAddUserModal} onClose={() => setOpenAddUserModal(false)} maxWidth={'2xl'}>
        <div className='p-4'>
          <p className='font-semibold text-xl mt-2 mb-4'>Create User</p>
          <form onSubmit={handleAddUserSubmit} className='flex gap-2'>
            <div className='w-1/2'>
              <input readOnly={true} value={addUserFormData.name} className='border-card w-full mb-2' type="text" name="name" id="name" placeholder='Name' />
              <input readOnly={true} value={addUserFormData.email} className='border-card w-full mb-2' type="email" name='email' id='email' placeholder='email' />
              <input readOnly={true} value={addUserFormData.password} className='border-card w-full mb-2' type="text" name='password' id='password' placeholder='password' />
              <button type="submit" className="bg-blue-500 text-white p-2 rounded">Submit</button>
            </div>
            <div className='relative w-1/2'>
              <input
                type="text"
                placeholder="Search for an employee..."
                className='border-card w-full mb-2'
                value={searchedEmployee}
                onChange={handleSearchEmployee}
                onClick={() => setOpenEmployeeDropdown(!openEmployeeDropdown)}
              />
              {openEmployeeDropdown &&
                <div
                  ref={employeeDropdownRef}
                  className="absolute w-full rounded-md max-h-36 overflow-y-auto z-50 bg-white"
                >
                  {searchedEmployee.trim() === ""
                    ? <p className="bg-white p-2">Search Employee</p>
                    : filteredEmployees.length > 0
                      ? filteredEmployees.map((employee, index) =>
                        <button key={index} className="block p-2 hover:bg-[#EEF9FF] w-full text-left" onClick={() => { handleSelectEmployee(employee.fname); handleAddUserInput(employee); }}>
                          {`${employee.fname} ${employee.sname}`}
                        </button>)
                      : <p className="p-2 text-[#F2A5A5]">No Employee Found</p>
                  }
                </div>}
            </div>
          </form>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}
