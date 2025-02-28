import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { AgGridReact } from 'ag-grid-react';
import { useStateContext } from "@/context/contextProvider";

import useRole from "@/hooks/useRole";
import Status from "@/Components/Status";
import { filterArray } from "@/functions/filterArray";
import { requestStatus } from "@/Constants/status";
import { returnStatus } from "@/Constants/status";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const DepotHistory = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const { themePreference } = useStateContext();

  const [requests, setRequests] = useState([]);
  const fetchRequest = async () => {
    try {
      const response = await axios.get('/request/get/infrastructure/depot');
      setRequests(filterArray(response.data.data, 'status', ['Completed', 'Request Canceled', 'Request Rejected']));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const [returns, setReturns] = useState([]);
  const fetchReturns = async () => {
    try {
      const response = await axios.get('/return/request/get');
      setReturns(filterArray(response.data.data, 'status', ['Completed', 'Canceled']));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };


  useEffect(() => {
    fetchRequest();
    fetchReturns();
  }, []);

  return (
    <AuthenticatedLayout user={auth.user}>

      <Head title="Depot History" />
      <Layout
        user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Depot", "History"]}
          onClickHandlers={[
            () => router.get('/depot'),
            () => router.get('/depot/history')
          ]} />
        }
      >
        {!hasAccess(auth.user.type, [2050, 2051, 2053]) ? <Unauthorized /> :
          <div className="content">
            <p className="font-medium text-xl mb-2" id="request-section">Request History</p>
            <div className={`w-full h-96 ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}>
              <AgGridReact
                rowData={requests}
                columnDefs={colDefs}
                rowSelection='single'
                pagination={true}
              />
            </div>

            <p className="font-medium text-xl mb-2 mt-6" id="return-section">Return History</p>
            <div className={`w-full h-96 ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}>
              <AgGridReact
                rowData={returns}
                columnDefs={returnColDef}
                rowSelection='single'
                pagination={true}
              />
            </div>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  )
}

export default DepotHistory;

const colDefs = [
  { field: "user_name", filter: true, flex: 1, minWidth: 120, headerName: 'Requested by' },
  { field: "type", filter: true, flex: 1, minWidth: 120 },
  {
    field: "items", filter: true, flex: 1, minWidth: 120, headerName: 'Requested Material', autoHeight: true,
    cellRenderer: (params) => {
      const items = JSON.parse(params.data.items);

      return (
        <div>
          {
            items.map((item, index) => {
              return (
                <p key={index} className="w-full">{item.product_name} <span className="italic ml-4">qty. {item.quantity}</span></p>
              )
            })
          }
        </div>
      )
    }
  },
  {
    field: "status", flex: 1, minWidth: 120,
    cellRenderer: (params) => {
      return (
        <Status statusArray={requestStatus} status={params.data.status} className='leading-normal whitespace-nowrap p-1 px-3 rounded-full' />
      )
    }
  }
];

const returnColDef = [
  {
    field: 'requested_by_name',
    headerName: 'Requested by'
  },
  {
    field: 'comment', flex: 2,
  },
  {
    field: 'items', flex: 6, autoHeight: true,
    cellRenderer: (params) => {
      const items = JSON.parse(params.data.items);

      return (
        <div>
          <span className="w-full flex">
            <p className="w-2/6 font-medium text-gray-600">Category</p>
            <p className="w-2/6 font-medium text-gray-600">Name</p>
            <p className="w-2/6 font-medium text-gray-600">Assoc. Product</p>
            <p className="w-1/6 font-medium text-gray-600 text-right">Qty.</p>
          </span>
          {
            items.map((item, index) => {
              return (
                <span key={index} className="w-full flex">
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.category}</p>
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.name}</p>
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.assoc_product ? item.assoc_product : 'N/A'}</p>
                  <p className="w-1/6 text-right">{item.quantity}</p>
                </span>

              )
            })
          }
        </div>
      )
    }
  },
  {
    field: 'status',
    cellRenderer: (params) => {
      return (
        <Status statusArray={returnStatus} status={params.data.status} className='leading-normal whitespace-nowrap p-1 px-3 rounded-full' />
      )
    }
  },
];