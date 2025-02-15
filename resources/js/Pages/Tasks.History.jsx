import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import InventoryLayout from '@/Layouts/InventoryLayout';
import { AgGridReact } from 'ag-grid-react';
import { router } from '@inertiajs/react';
import Status from '@/Components/Status';
import { filterArray } from '@/functions/filterArray';
import { auditTaskStatus } from '@/Constants/status';
import { dateTimeFormatShort } from '@/Constants/options';

const TasksHistory = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2054, 2055])) {
    return (
      <Unauthorized />
    )
  }

  const { theme, themePreference } = useStateContext();
  const [history, setHistory] = useState([]);

  const [tasks, setTasks] = useState();
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/audit/task/get');
      setTasks(response.data);
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [])

  useEffect(() => {
    if (tasks) {
      setHistory(filterArray(tasks, 'status', ['Completed', 'Canceled']));
    }
  }, [tasks])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Task History" />
      <InventoryLayout
        user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Task", "History"]}
          onClickHandlers={[
            () => router.get('/tasks'),
            () => router.get('/tasks/history')
          ]}
        />
        }
      >
        <div className="content flex-1">
          <div className={`h-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} >
            <AgGridReact
              rowData={history}
              columnDefs={colDefs}
              rowSelection='single'
              pagination={true}
            />
          </div>
        </div>
      </InventoryLayout>
    </AuthenticatedLayout>
  );
}

export default TasksHistory;

const colDefs = [
  {
    field: 'startdate', minWidth: 220, headerName: 'Start Date',
    valueFormatter: (params) => new Date(params.value + 'Z').toLocaleString(undefined, dateTimeFormatShort)
  },
  {
    field: 'type', flex: 1
  },
  {
    field: 'assigned_to_name', headerName: 'Assigned To'
  },
  {
    field: 'deadline', minWidth: 220, headerName: 'Deadline',
    valueFormatter: (params) => new Date(params.value + 'Z').toLocaleString(undefined, dateTimeFormatShort)
  },
  {
    field: 'status', maxWidth: 150,
    cellRenderer: (params) => <Status statusArray={auditTaskStatus} status={params.value} />
  },
]