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

import { Card } from '@/Components/Cards';
import Modal from '@/Components/Modal';

import { permissions } from '@/Constants/permissions';

import { useStateContext } from '@/context/contextProvider';

import { generatePassword } from '@/functions/passwordGenerator';
import { convertPermissions } from '@/functions/permissionsConverter';

import { userToastMessages, positionToastMessages } from '@/Constants/toastMessages';

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

  const { theme, themePreference, userPermissions } = useStateContext();

  const [users, setUsers] = useState(null);
  const [positions, setPositions] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [openAddPositionModal, setOpenAddPositionModal] = useState(false);
  const [openEditPositionModal, setOpenEditPositionModal] = useState(false);

  const [selectUserPermissionsForm, setSelectUserPermissionsForm] = useState(
    permissions.map((permission) => ({
      [permission.code]: false,
    }))
  );

  const resetUserPermissionsForm = () => {
    const resetPermissions = selectUserPermissionsForm.map((permission) => {
      const roleCode = Object.keys(permission)[0];
      return { [roleCode]: false };
    });

    setSelectUserPermissionsForm(resetPermissions); // Update the state with the reset values
  };

  const handleUserPermissionsCheckBoxesChange = (e, index, role) => {
    const newPermissions = [...selectUserPermissionsForm];
    newPermissions[index] = { ...newPermissions[index], [role.code]: e.target.checked };
    setSelectUserPermissionsForm(newPermissions);
  };

  const handleEditUserPermissionsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`/user/update/permission/${userSelectedData.id}`, { permissions: selectUserPermissionsForm });

      toast.success(userToastMessages.update_UserPermission.success);
      fetchUsers();
    } catch (error) {
      toast.error(userToastMessages.update_UserPermission.error, error);
    }
  }

  const [openEditPositionPermissionsModal, setOpenEditPositionPermissionsModal] = useState(false);

  const [selectPositionPermissionsForm, setSelectPositionPermissionsForm] = useState(
    permissions.map((permission) => ({
      [permission.code]: false,
    }))
  );

  const resetPositionPermissionsForm = () => {
    const resetPermissions = selectPositionPermissionsForm.map((permission) => {
      const roleCode = Object.keys(permission)[0];
      return { [roleCode]: false };
    });

    setSelectPositionPermissionsForm(resetPermissions);
  };

  const handlePositionPermissionsCheckBoxesChange = (e, index, role) => {
    const newPermissions = [...selectPositionPermissionsForm];
    newPermissions[index] = { ...newPermissions[index], [role.code]: e.target.checked };
    setSelectPositionPermissionsForm(newPermissions);
  };

  const handleEditPositionPermissionsSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`/position/update/permission/${positionSelectedData.id}`, { permissions: selectPositionPermissionsForm });

      toast.success(positionToastMessages.update_PositionPermission.success);
      fetchPositions();
      fetchUsers();
      setOpenEditPositionPermissionsModal(false);
    } catch (error) {
      toast.error(positionToastMessages.update_PositionPermission.error, error);
    }
  }

  const [openAddUserModal, setOpenAddUserModal] = useState(false);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [userSelectedData, setUserSelectedData] = useState(null)


  const onUserSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedUser = selectedRows[0] || null;

    setUserSelectedData(selectedUser);
    resetUserPermissionsForm();

    if (selectedUser && selectedUser.permissions) {
      const permissions = convertPermissions(selectedUser.permissions);
      setSelectUserPermissionsForm(permissions);
    } else {
      resetUserPermissionsForm();
    }
  };

  const [positionSelectedData, setPositionSelectedData] = useState(null)

  const onPositionSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedPosition = selectedRows[0] || null;

    setPositionSelectedData(selectedPosition);
    resetPositionPermissionsForm();

    if (selectedPosition && selectedPosition.permissions) {
      const permissions = convertPermissions(selectedPosition.permissions);
      setSelectPositionPermissionsForm(permissions);
    } else {
      resetPositionPermissionsForm();
    }
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
      password: generatePassword(employee)
    });
  };

  const handleAddPositionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/position/create', { name: addPositionName });

      setAddPositionName("");
      toast.success(positionToastMessages.store.success);
      fetchPositions();
      setOpenAddPositionModal(false);
    } catch (error) {
      toast.error(positionToastMessages.store.error, error);
    }
  };

  const handleEditPositionSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`/position/update/${positionSelectedData.id}`, { name: editPositionName });

      toast.success(positionToastMessages.update.success);
      setEditPositionName("");
      fetchPositions();
      setOpenEditPositionModal(false);
    } catch (error) {
      toast.error(positionToastMessages.update.error, error);
    }
  };

  const handleDeletePosition = async (id) => {
    try {
      await axios.delete(`/position/delete/${id}}`);
      fetchPositions();
      setOpenEditPositionModal(false);
      toast.success(positionToastMessages.destroy.success);
    } catch (error) {
      toast.error(positionToastMessages.destroy.error, error);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/user/create', addUserFormData);

      toast.success(userToastMessages.store.success);
      fetchUsers();
      setOpenAddUserModal(false);
    } catch (error) {
      toast.error(userToastMessages.store.error, error);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/user/delete/${id}}`);
      fetchUsers();
      toast.success(userToastMessages.destroy.success);
    } catch (error) {
      toast.error(userToastMessages.destroy.error, error);
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
      toast.error(userToastMessages.show.error, error);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get('/position');
      setPositions(response.data);
    } catch (error) {
      toast.error(positionToastMessages.show.error, error);
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

  const handleSelectEmployee = employee => {
    setSelectedEmployee(employee);
    setSearchedEmployee(employee);
    setOpenEmployeeDropdown(false);
  };

  useEffect(() => {
    fetchUsers();
    fetchPositions();
  }, []);

  const handleTemplateChange = (e) => {
    const { value } = e.target;
    const selectedPosition = positions.find((position) => position.id === parseInt(value));
    if (selectedPosition.permissions) {
      const permissions = convertPermissions(selectedPosition.permissions);
      setSelectUserPermissionsForm(permissions);
    } else resetUserPermissionsForm();
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Manage Users</h2>}
    >
      <Head title="Users" />

      <div className='content flex flex-col'>

        <div className='flex items-center gap-6'>
          <Card data={users ? users.length : "-"} name="Users" Icon={TbUser} />
          <Card data={positions ? positions.length : "-"} name="Positions" Icon={TbBriefcase} />
        </div>

        <div className='flex md:flex-row flex-col gap-8'>

          <div className="md:w-2/3 w-full realtive p-1">
            <span className='flex justify-between h-14 items-center'>
              <p className='text-xl font-semibold h-fit' style={{ color: theme.text }}>Users</p>

              <button style={{ background: theme.accent, color: theme.background }}
                disabled={userPermissions === '000' ? true : false}
                className='m-2 mr-0 p-2 rounded-md flex items-center gap-1'
                onClick={() => setOpenAddUserModal(true)}>
                <TbUserPlus />
                <p className='md:block hidden'>Add Users</p>
              </button>

            </span>
            <div className={themePreference === 'light' ? 'ag-theme-quartz ' : 'ag-theme-quartz-dark'} style={{ height: '380px' }}>
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
              <p className='text-xl font-semibold h-fit' style={{ color: theme.text }}>Positions</p>
              <button
                className='m-2 mr-0 p-2 rounded-md flex items-center gap-1'
                style={{ background: theme.accent, color: theme.background }}
                onClick={() => setOpenAddPositionModal(true)}>
                <TbPlus size={24} />
              </button>
            </span>
            <div className={themePreference === 'light' ? 'ag-theme-quartz ' : 'ag-theme-quartz-dark'} style={{ height: '380px' }}>
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
            <div className={`z-10 absolute h-full w-full top-0 left-0 p-1 backdrop-blur-sm duration-300 rounded-md ${openAddPositionModal ? 'visible opacity-100' : 'invisible opacity-0'} ${themePreference === 'light' ? 'l-t-grad' : 'd-t-grad'}`}>
              <span className='h-14 flex justify-end items-center rounded-md'>
                <button className='font-semibold m-2 mr-0 p-2 rounded-md flex' style={{ color: theme.background, background: theme.danger }}
                  onClick={() => setOpenAddPositionModal(false)}
                >
                  <TbX size={24} />
                </button>
              </span>
              <form onSubmit={handleAddPositionSubmit} className='flex flex-col p-2 border-card' style={{ borderColor: theme.border }}>
                <p style={{ color: theme.text }} className='font-semibold text-2xl inline-block h-fit w-full text-center mb-2'>Add Position</p>
                <input
                  className='border-card'
                  type="text"
                  name="name"
                  id="name"
                  value={addPositionName}
                  onChange={(e) => setAddPositionName(e.target.value)}
                />
                <button className='p-2 mt-2 font-semibold border-card' style={{ background: theme.primary, text: theme.text, borderColor: theme.border }}>Create</button>
              </form>
            </div>

            {/* MODAL FOR EDITING AND DELETING POSITION */}
            <div className={`z-10 absolute h-full w-full top-0 left-0 p-1 backdrop-blur-sm duration-300 ${openEditPositionModal ? 'visible opacity-100' : 'invisible opacity-0'} ${themePreference === 'light' ? 'l-t-grad' : 'd-t-grad'}`}>
              <span className='h-14 flex justify-end items-center rounded-md'>
                <button className='font-semibold m-2 mr-0 p-2 rounded-md flex' style={{ color: theme.background, background: theme.danger }}
                  onClick={() => setOpenEditPositionModal(false)}
                >
                  <TbX size={24} />
                </button>
              </span>
              <form onSubmit={handleEditPositionSubmit} className='flex flex-col p-2 border-card' style={{ borderColor: theme.border }}>
                <p className='font-semibold text-2xl inline-block h-fit w-full text-center mb-2' style={{ color: theme.text }}>Edit Position</p>
                <input
                  className='border-card'
                  type="text"
                  name="name"
                  id="name"
                  placeholder={positionSelectedData ? positionSelectedData.name : ''}
                  value={editPositionName}
                  onChange={(e) => setEditPositionName(e.target.value)}
                />
                <span className='flex gap-2'>
                  <button type='button' className='flex-1 p-2 mt-2 font-medium text-white border-card'
                    style={{ color: theme.background, borderColor: theme.border, background: theme.danger }}
                    onClick={() => handleDeletePosition(positionSelectedData.id)}>
                    Remove
                  </button>
                  <button type='submit' className='flex-1 p-2 mt-2 font-medium border-card'
                    style={{ background: theme.primary, color: theme.background, borderColor: theme.border }}>
                    Update
                  </button>
                </span>
                <button type='button' onClick={() => setOpenEditPositionPermissionsModal(true)}
                  className='p-2 mt-2 font-medium border-card'
                  style={{ background: theme.secondary, color: theme.text, borderColor: theme.border }}>Edit Permissions</button>
              </form>
            </div>
          </div>
        </div>

        <div className='border-card my-4 p-4' style={{ borderColor: theme.border }}>
          <p className='text-xl font-medium' style={{ color: theme.text }}>Edit User</p>
          <p className='text-lg' style={{ color: theme.text }}><span className='inline font-medium'>Name:</span> {userSelectedData ? userSelectedData.name : ''}</p>
          <form onSubmit={handleEditUserPermissionsSubmit} className='my-4'>
            <div className='flex justify-between'>
              <p className='text-lg font-medium' style={{ color: theme.text }}>Edit User Permissions</p>
              <span>
                <p className='inline-block text-lg font-medium' style={{ color: theme.text }}>Template: </p>
                <select
                  style={{ color: theme.text, background: theme.background }}
                  className="inline-block border-none" name="position_list" id="position_list"
                  onChange={(e) => handleTemplateChange(e)}
                  disabled={userSelectedData && userSelectedData.email_verified_at ? false : true}
                >

                  <option value="none">None</option>
                  {positions && positions.map((position, index) => {
                    return (
                      <option value={position.id} key={index}>{`${position.id} ${position.name}`}</option>
                    )
                  })}
                </select>
              </span>
            </div>
            <div className='my-2 relative border-card p-1 grid grid-cols-3 grid-rows-3 grid-flow-col' style={{ color: theme.text, borderColor: theme.border }}>
              <div className={`${userSelectedData === null ? 'hidden' : userSelectedData && userSelectedData.email_verified_at ? ' hidden ' : ' absolute '} top-0 left-0 rounded-lg backdrop-blur w-full h-full flex justify-center items-center`}>
                <p className='text-xl font-semibold'>User is not verified yet</p>
              </div>
              {permissions.map((role, index) => {
                return (
                  <label htmlFor={`user-${role.code}`} className='flex m-1 w-fit h-fit gap-2 items-center select-none cursor-pointer' key={`user-${index}`}>
                    <input
                      type="checkbox"
                      className={`h-0 w-0 absolute block invisible overflow-hidden ${themePreference === 'light' ? 'l' : 'd'}`}
                      name={role.alias}
                      id={`user-${role.code}`}
                      checked={selectUserPermissionsForm[index][role.code]}
                      onChange={(e) => handleUserPermissionsCheckBoxesChange(e, index, role)}
                      disabled={userSelectedData && userSelectedData.email_verified_at ? false : true}
                    />
                    <span className='check w-5 h-5 inline-block rounded border' style={{ borderColor: theme.border }}></span>
                    <p>{role.alias}</p>
                  </label>
                )
              })}
            </div>
            <div className='flex justify-between my-4'>
              <button type='submit' disabled={userSelectedData ? false : true}
                className={`p-2 border-card font-medium disabled:cursor-not-allowed`}
                style={{ background: theme.accent, color: theme.background, borderColor: theme.border }}>
                Save
              </button>
              <button type='button' disabled={userSelectedData ? false : true}
                className={`p-2 border-card font-medium disabled:cursor-not-allowed`}
                style={{ color: theme.background, borderColor: theme.border, background: theme.danger }}
                onClick={() => handleDeleteUser(userSelectedData.id)}>
                Delete User
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal show={openAddUserModal} onClose={() => setOpenAddUserModal(false)} maxWidth={'2xl'}>
        <div className='p-4' style={{ color: theme.text }}>
          <p className='font-semibold text-xl mt-2 mb-4'>Create User</p>
          <form onSubmit={handleAddUserSubmit} className='flex flex-col gap-2'>
            <div className='relative w-full'>
              <input
                type="text"
                placeholder="Search an employee..."
                className='border-card w-full mb-2 bg-transparent'
                value={searchedEmployee}
                onChange={handleSearchEmployee}
                onClick={() => setOpenEmployeeDropdown(!openEmployeeDropdown)}
                style={{ borderColor: theme.border }}
              />
              {openEmployeeDropdown &&
                <div
                  ref={employeeDropdownRef}
                  className="absolute w-full rounded-md max-h-36 overflow-y-auto z-50 backdrop-blur border-card"
                >
                  {searchedEmployee.trim() === ""
                    ? <p className="p-2">Search Employee</p>
                    : filteredEmployees.length > 0
                      ? filteredEmployees.map((employee, index) =>
                        <button key={index} className="block p-2 hover:bg-gray-300/50 w-full text-left" onClick={() => { handleSelectEmployee(employee.fname); handleAddUserInput(employee); }}>
                          {`${employee.fname} ${employee.sname}`}
                        </button>)
                      : <p className="p-2 text-[#FF9E8D]">No Employee Found</p>
                  }
                </div>}
            </div>
            <div className='w-full mt-10'>
              <input readOnly={true} value={addUserFormData.name} className='border-card w-3/5 mb-2 bg-transparent' style={{ borderColor: theme.border }} type="text" name="name" id="name" placeholder='Name' />
              <input readOnly={true} value={addUserFormData.email} className='border-card w-3/5 mb-2 bg-transparent' style={{ borderColor: theme.border }} type="email" name='email' id='email' placeholder='Email' />
              <input readOnly={true} value={addUserFormData.password} className='border-card w-3/5 mb-2 bg-transparent' style={{ borderColor: theme.border }} type="text" name='password' id='password' placeholder='Password' />
              <button type="submit" className="block ml-auto text-white font-medium p-2 rounded-md" style={{ background: theme.primary }}>Submit</button>
            </div>
          </form>
        </div>
      </Modal>

      <Modal show={openEditPositionPermissionsModal} onClose={() => setOpenEditPositionPermissionsModal(false)} maxWidth={'2xl'}>
        <div className='p-4' style={{ color: theme.text }}>
          <p className='font-semibold text-xl mt-2 mb-4'>Edit <span className='font-semibold text-xl mt-2 mb-4' style={{ color: theme.accent }}>{positionSelectedData && `${positionSelectedData.name}'s`}</span> Permissions</p>
          <form onSubmit={handleEditPositionPermissionsSubmit} className='flex flex-col gap-2'>
            <div className='my-2 relative border-card p-1 grid grid-cols-3 grid-rows-3 grid-flow-col' style={{ color: theme.text, borderColor: theme.border }}>
              {permissions.map((role, index) => {
                return (
                  <label htmlFor={`position-${role.code}`} className='flex m-1 w-fit h-fit gap-2 items-center select-none cursor-pointer' key={`position-${index}`}>
                    <input
                      type="checkbox"
                      className={`h-0 w-0 absolute block invisible overflow-hidden ${themePreference === 'light' ? 'l' : 'd'}`}
                      name={role.alias}
                      id={`position-${role.code}`}
                      checked={selectPositionPermissionsForm[index][role.code]}
                      onChange={(e) => handlePositionPermissionsCheckBoxesChange(e, index, role)}
                    />
                    <span className='check w-5 h-5 inline-block rounded border' style={{ borderColor: theme.border }}></span>
                    <p>{role.alias}</p>
                  </label>
                )
              })}
            </div>
            <button type="submit" className="block ml-auto text-white font-medium p-2 rounded-md" style={{ background: theme.primary }}>Submit</button>
          </form>
        </div>
      </Modal>
    </AuthenticatedLayout>
  );
}

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