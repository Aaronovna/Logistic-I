import useRole from '@/hooks/useRole';
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
import { TbX, TbCheck } from "react-icons/tb";

import { Card } from '@/Components/Cards';
import Modal from '@/Components/Modal';
import { permissions, userType } from '@/Constants/permissions';

import { useStateContext } from '@/context/contextProvider';

import { generatePassword } from '@/functions/passwordGenerator';
import { convertPermissions } from '@/functions/permissionsConverter';
import { useConfirmation } from '@/context/confirmationProvider';

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
  {
    fname: 'John',
    sname: 'Doe',
    email: 'materwelon826@gmail.com',
    employeeId: '7878',
  },
]

export default function User({ auth }) {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);
  const { confirm } = useConfirmation();

  const { theme, themePreference } = useStateContext();

  const [users, setUsers] = useState(null);
  const [positions, setPositions] = useState(null);
  const [gridApi, setGridApi] = useState(null);
  const [openAddPositionModal, setOpenAddPositionModal] = useState(false);
  const [openEditPositionModal, setOpenEditPositionModal] = useState(false);

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
      fetchPositions();
      fetchUsers();
      setOpenEditPositionPermissionsModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    } finally { window.location.reload() }
  }

  const [openAddUserModal, setOpenAddUserModal] = useState(false);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [userSelectedData, setUserSelectedData] = useState(null)
  const [selectedUserPermissions, setSelectedUserPermissions] = useState(null)
  const [positionId, setPositionId] = useState(null);
  const [role, setRole] = useState(null);

  const changeRole = (e) => {
    setRole(e.target.value);
  }

  const changePermission = (e) => {
    const id = Number(e.target.value);
    setPositionId(id);

    const position = positions.find((pos) => pos.id === id);

    const perms = convertPermissions(position.permissions);
    setSelectedUserPermissions(perms);
  };

  const submitSetUserPosition = async (e) => {
    e.preventDefault();
    confirm(cm_change, async () => {
      const payload = {};
      if (positionId !== null) payload.position_id = positionId;
      if (role !== null) payload.type = role;

      // Ensure there's at least one field to update
      if (Object.keys(payload).length === 0) {
        toast.error("No changes detected.");
        return;
      }

      try {
        const response = await axios.patch(`/user/update/${userSelectedData.id}`, payload);
        fetchUsers();
        toast.success(response.data.message);
      } catch (error) {
        toast.error(`${error.response?.status || "Error"}: ${error.response?.data?.message || "Something went wrong"}`);
      } finally { window.location.reload() }
    })
  };

  const onUserSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    const selectedUser = selectedRows[0] || null;

    setUserSelectedData(selectedUser);
    if (selectedUser.position) {
      setSelectedUserPermissions(convertPermissions(selectedUser.position.permissions));
    } else {
      const perms = permissions.map((permission) => {
        const roleCode = Object.keys(permission)[0];
        return { [roleCode]: false };
      });

      setSelectedUserPermissions(perms);
    };
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
    confirm(cm_change, async () => {
      try {
        const response = await axios.post('/position/create', { name: addPositionName });
        setAddPositionName("");
        fetchPositions();
        setOpenAddPositionModal(false);
        toast.success(response.data.message);
      } catch (error) {
        toast.error(`${error.status} ${error.response.data.message}`);
      } finally { window.location.reload() }
    })
  };

  const handleEditPositionSubmit = async (e) => {
    e.preventDefault();
    confirm(cm_change, async () => {
      try {
        const response = await axios.patch(`/position/update/${positionSelectedData.id}`, { name: editPositionName });
        setEditPositionName("");
        fetchPositions();
        setOpenEditPositionModal(false);
        toast.success(response.data.message);
      } catch (error) {
        toast.error(`${error.status} ${error.response.data.message}`);
      } finally { window.location.reload() }
    })
  };

  const handleDeletePosition = async (id) => {
    try {
      await axios.delete(`/position/delete/${id}}`);
      fetchPositions();
      setOpenEditPositionModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    } finally { window.location.reload() }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/user/create', addUserFormData);
      fetchUsers();
      setOpenAddUserModal(false);
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const handleDeactivateUser = async (id) => {
    try {
      await axios.patch(`/user/update/${id}}`, {status: 'deactivated', type: 2056, position_id: null});
      fetchUsers();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    } finally { window.location.reload() }
  };

  const userColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 2, maxWidth: 220 },
    { field: "email", filter: true, flex: 2, maxWidth: 300 },
    {
      field: "email_verified_at", filter: true, flex: 1, headerName: "Status", maxWidth: 150,
      valueFormatter: (params) => params.data.email_verified_at ? `${params.data.status} (Verified)` : `${params.data.status} (Unverified)`
    },
    {
      field: "position", filter: true, flex: 1,
      valueFormatter: (params) => params.value?.name
    },
    {
      field: "type", filter: true, maxWidth: 300,
      valueFormatter: (params) => {
        const type = userType.find(item => item.code === params.value);
        return type ? type.alias : "Unknown";
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
      setUsers(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get('/position');
      setPositions(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
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

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Users" />
      <Layout user={auth.user} header={<NavHeader headerName="User" />}>
        {!hasAccess(auth.user.type, [2050, 2051]) ? <Unauthorized /> :
          <div className='content flex flex-col'>

            <div className='flex items-center gap-6'>
              <Card data={users ? users.length : "-"} name="Users" Icon={TbUser} />
              <Card data={positions ? positions.length : "-"} name="Positions" Icon={TbBriefcase} />
            </div>

            <div className="w-full realtive mb-4">
              <span className='flex justify-between h-14 items-center'>
                <p className='text-xl font-semibold h-fit' style={{ color: theme.text }}>Users</p>

                <button style={{ background: theme.accent, color: theme.background }}
                  disabled={!hasPermissions([102])}
                  className='btn gap-2 disable'
                  onClick={() => setOpenAddUserModal(true)}>
                  <TbUserPlus />
                  Add User
                </button>

              </span>
              <div className={`h-96 ${themePreference === 'light' ? 'ag-theme-quartz ' : 'ag-theme-quartz-dark'}`}>
                <AgGridReact
                  rowData={users}
                  columnDefs={userColDefs}
                  rowSelection='single'
                  onGridReady={onGridReady}
                  onSelectionChanged={onUserSelectionChanged}
                />
              </div>

            </div>
            <div className='w-full flex gap-4'>
              <div className='w-2/3' style={{ borderColor: theme.border }}>
                <span className='flex justify-between h-14 ml-1 items-center'>
                  <p className='text-xl font-semibold h-fit' style={{ color: theme.text }}>User Information</p>
                </span>
                <div className='border-card h-96 p-4 relative overflow-hidden flex flex-col'>
                  {!userSelectedData || userSelectedData.status === 'deactivated' || userSelectedData.email_verified_at === null ? (
                    <div className='absolute top-0 left-0 w-full h-full bg-black/10 backdrop-blur-md z-10 flex items-center justify-center'>
                      {userSelectedData ? (
                        <p className='text-2xl font-medium tracking-wider text-gray-500'>User is not verified yet or deactivated</p>
                      ) : (
                        <p className='text-2xl font-medium tracking-wider text-gray-500'>Select a user first</p>
                      )}
                    </div>
                  ) : null}
                  <p className='text-lg font-medium ml-1' style={{ color: theme.text }}>{userSelectedData ? userSelectedData.name : '-'}</p>
                  <p className='text-neutral ml-1'>{userSelectedData?.position?.name ? userSelectedData.position?.name : 'No position set yet'}</p>
                  <div className='my-2 relative border-card grid grid-cols-2 h-56 overflow-y-auto p-2'>
                    {selectedUserPermissions &&
                      permissions.map((permission, index) => {
                        const permissionValue = selectedUserPermissions[index][permission.code]; // Get true/false using key

                        return (
                          <p key={index} className='capitalize flex gap-1 items-center hover:bg-hbg rounded text-text cursor-default'>
                            <span>{permissionValue ? <TbCheck size={22} color='lime' /> : <TbX size={22} color='red' />}</span> {/* Display based on value */}
                            <span>{permission.alias.replace(/_/g, " ")}</span>
                          </p>
                        );
                      })}
                  </div>

                  <form className='flex flex-col gap-2 mt-auto' onSubmit={submitSetUserPosition}>
                    <div className='flex gap-2'>
                      <select name="su_position" id="su_position" className='border-card bg-background text-text w-2/3' onChange={changePermission}>
                        <option value={null} className='text-sm text-neutral bg-background'>Select Position</option>
                        {
                          positions && positions.map((position, index) => {
                            return (
                              <option value={position.id} key={index} className='text-sm text-text bg-background'>{position.name}</option>
                            )
                          })
                        }
                      </select>
                      <select name="su_role" id="su_role" className='border-card bg-background text-text w-1/3' onChange={(changeRole)}>
                        <option value={null} className='text-sm text-neutral bg-background'>Select Role</option>
                        {
                          userType.map((type, index) => {
                            return (
                              <option value={type.code} key={index} className='text-sm text-text bg-background'>{type.alias}</option>
                            )
                          })
                        }
                      </select>
                    </div>
                    <div className='flex gap-2'>
                      <button className='btn disable w-full bg-red-400 hover:bg-red-500' type='button'
                        onClick={() => confirm(cm_deact, () => handleDeactivateUser(userSelectedData.id))}
                        disabled={!hasPermissions([103])}
                      > Deactivate User </button>
                      <button className='btn disable w-full' disabled={!hasPermissions([102])}>Save</button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="w-1/3 relative">
                <span className='flex justify-between h-14 items-center'>
                  <p className='text-xl font-semibold h-fit' style={{ color: theme.text }}>Positions</p>
                  <button
                    className='m-2 mr-0 p-2 btn gap-1 disable'
                    disabled={!hasPermissions([102])}
                    onClick={() => setOpenAddPositionModal(true)}>
                    <TbPlus size={24} />
                  </button>
                </span>
                <div className={`h-96 ${themePreference === 'light' ? 'ag-theme-quartz ' : 'ag-theme-quartz-dark'}`}>
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
                <div className={`z-10 absolute h-full w-full top-0 left-0 backdrop-blur-sm duration-300 rounded-md ${openAddPositionModal ? 'visible opacity-100' : 'invisible opacity-0'} ${themePreference === 'light' ? 'l-t-grad' : 'd-t-grad'}`}>
                  <span className='h-14 flex justify-end items-center rounded-md'>
                    <button className='font-semibold m-2 mr-0 btn bg-red-200 hover:bg-red-400'
                      onClick={() => setOpenAddPositionModal(false)}
                    >
                      <TbX size={24} color='black' />
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
                    <button className='p-2 mt-2 btn disable' disabled={!hasPermissions([102])}>Create</button>
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
                      <button type='button' className='flex-1 p-2 mt-2 btn disable bg-red-400 hover:bg-red-500'
                        disabled={!hasPermissions([102])}
                        onClick={() => handleDeletePosition(positionSelectedData.id)}>
                        Remove
                      </button>
                      <button type='submit' className='flex-1 p-2 mt-2 btn disable bg-primary hover:bg-accent'
                        disabled={!hasPermissions([102])}>
                        Update
                      </button>
                    </span>
                    <button type='button' onClick={() => setOpenEditPositionPermissionsModal(true)}
                      className='p-2 mt-2 btn disable'
                      disabled={!hasPermissions([102])}>
                      Edit Permissions</button>
                  </form>
                </div>
              </div>
            </div>
            <Modal show={openAddUserModal} onClose={() => setOpenAddUserModal(false)} maxWidth={'2xl'} name="Create User">
              <div style={{ color: theme.text }}>
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
                  </div>
                  <button type="submit" className="ml-auto btn disable" disabled={!hasPermissions([102])}>Create User</button>
                </form>
              </div>
            </Modal>

            <Modal show={openEditPositionPermissionsModal} onClose={() => setOpenEditPositionPermissionsModal(false)} maxWidth={'4xl'}
              name={`Edit ${positionSelectedData && `${positionSelectedData.name}'s`} Permissions`}
            >
              <div style={{ color: theme.text }}>
                <form onSubmit={handleEditPositionPermissionsSubmit} className='flex flex-col gap-2'>
                  <div className='my-2 relative border-card p-1 grid grid-cols-3 max-h-96 overflow-y-auto' style={{ color: theme.text, borderColor: theme.border }}>
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
                          <span className='check w-4 h-4 inline-block rounded border' style={{ borderColor: theme.border }}></span>
                          <p className='capitalize text-sm'>{role.alias.replace(/_/g, " ")}</p>
                        </label>
                      )
                    })}
                  </div>
                  <button type="submit" className="ml-auto btn disable" disabled={!hasPermissions([102])}>Save Permissions</button>
                </form>
              </div>
            </Modal>
          </div>
        }
      </Layout>
    </AuthenticatedLayout >
  );
}

const cm_change = `All changes to users, roles, and positions require a system restart. The application will automatically restart after confirming. Are you sure you want to proceed?`;
const cm_deact = `Deactivating this user is irreversible. Once confirmed, the user will no longer have access to the system. Are you sure you want to proceed?`;
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