import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import { AgGridReact } from 'ag-grid-react';
import { router } from '@inertiajs/react';
import { dateTimeFormatShort } from '@/Constants/options';
import Status from '@/Components/Status';
import { shipmentStatus } from '@/Constants/status';
import useRole from '@/hooks/useRole';

const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true, // Use 12-hour format
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // User's local timezone
};

const ReceiptHistory = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const { theme, themePreference } = useStateContext();
  const [history, setHistory] = useState([]);

  const [receivedShipment, setReceivedShipment] = useState();
  const fetchReceivedShipment = async () => {
    try {
      const response = await axios.get('/receipt/get');
      setReceivedShipment(response.data.data);
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    fetchReceivedShipment();
  }, [])

  useEffect(() => {
    if (receivedShipment) {
      setHistory(filterOrdersByStatuses(receivedShipment, ['Success', 'Return']));
    }
  }, [receivedShipment])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Receipt History" />
      <Layout
        user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Receipt", "History"]}
          onClickHandlers={[
            () => router.get('/receipt'),
            () => router.get('/receipt/history')
          ]}
        />
        }
      > 
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
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
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default ReceiptHistory;

const colDefs = [
  {
    field: 'order_date', headerName: 'Date', flex: 1,
    cellRenderer: (params) => {
      return (
        <span>{new Date(params.data.order_date).toLocaleString(undefined, dateTimeFormatShort)}</span>
      )
    }
  },
  {
    field: 'order_warehouse', headerName: 'Warehouse'
  },
  {
    field: 'supplier',
    cellRenderer: (params) => {
      return (
        <span>{JSON.parse(params.data.supplier).name}</span>
      )
    }
  },
  {
    field: 'fleet', flex: 1,
    cellRenderer: (params) => {
      return (
        <span>{`${JSON.parse(params.data.fleet).plate} ${JSON.parse(params.data.fleet).name}`}</span>
      )
    }
  },
  {
    field: 'status',
    cellRenderer: (params) => {
      return (
        <Status statusArray={shipmentStatus} status={params.data.status} style={2} />
      )
    }
  },
]