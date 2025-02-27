import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { AgGridReact } from 'ag-grid-react';
import InventoryLayout from '@/Layouts/InventoryLayout';
import { filterArray } from '@/functions/filterArray';
import { useStateContext } from '@/context/contextProvider';
import { dateTimeFormatShort } from '@/Constants/options';
import Status from '@/Components/Status';
import { requestStatus } from '@/Constants/status';

const DispatchHistory = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2052])) {
    return (
      <Unauthorized />
    )
  }

  const {themePreference} = useStateContext();

  const [history, setHistory] = useState([]);

  const [requests, setRequests] = useState();
  const fetchRequests = async () => {
    try {
      const response = await axios.get('/request/get');
      setRequests(response.data.data);
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [])

  useEffect(() => {
    if (requests) {
      setHistory(filterArray(requests, 'status', ['Completed', 'Request Rejected', 'Request Cancelled']));
    }
  }, [requests])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Dispatch History" />
      <InventoryLayout
        user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Dispatch", "History"]}
          onClickHandlers={[
            () => router.get('/dispatch'),
            () => router.get('/dispatch/history')
          ]}
        />
        }>
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

export default DispatchHistory;

const colDefs = [
  {
    field: 'created_at', headerName: 'Date', flex: 1,
    valueFormatter: (params) => new Date(params.value).toLocaleString(undefined, dateTimeFormatShort)
  },
  {
    field: 'infrastructure_name' , headerName: 'Request From', flex: 1,
  },
  {
    field: 'type', headerName: 'Purpose', flex: 1,
  },
  {
    field: 'status', flex: 1,
    cellRenderer: (params) => {
      return <Status statusArray={requestStatus} status={params.value}/>
    }
  }
]