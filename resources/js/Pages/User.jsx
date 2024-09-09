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

import Card from '@/Components/Card';

export default function User({ auth }) {

  const [users, setUsers] = useState(null);
  const [positions, setPositions] = useState(null);
  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
  };

  const userColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 1 },
    { field: "email", filter: true, flex: 1 },
    { field: "action",
      minWidth: 70,
      maxWidth: 90,
      cellrender: (params) => {
        return {
          
        }
      }
     }
  ];

  const positionColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 1 },
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
 
        <div className='flex gap-8'>

          <div className="w-2/3"> 
            <span className='flex justify-between h-14 items-center'>
              <p className='text-xl text-[#004369] font-semibold h-fit'>Users</p>
              <button className='bg-[#004369] text-white m-2 mr-0 p-2 rounded-md flex items-center gap-1'>
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
          <div className="w-1/3">
          <span className='flex justify-between h-14 items-center'>
              <p className='text-xl text-[#004369] font-semibold h-fit'>Positions</p>
              <button className='bg-[#004369] text-white m-2 mr-0 p-2 rounded-md flex items-center gap-1'>
                <TbPlus size={24} />
                </button>
            </span>
            <div className='ag-theme-quartz' style={{ height: '400px' }}>
              <AgGridReact
                rowData={positions}
                columnDefs={positionColDefs}
                rowSelection='single'
                onGridReady={onGridReady}
              /* onSelectionChanged={} */
              />
            </div>
          </div>
        </div>
        
        <div className='border-card my-8'>Roles</div>
      </div>
    </AuthenticatedLayout>
  );
}
