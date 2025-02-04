import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { AgGridReact } from 'ag-grid-react';
import { useStateContext } from "@/context/contextProvider";

import InfrastructureLayout from "@/Layouts/InfrastructureLayout";
import { filterArray } from "@/functions/filterArray";
import { requestStatus } from "@/Constants/status";
import { productToastMessages } from "@/Constants/toastMessages";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

const TerminalHistory = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2053])) {
    return (
      <Unauthorized />
    )
  }

  const { themePreference } = useStateContext();

  const [requests, setRequests] = useState([]);
  const fetchRequest = async () => {
    try {
      const response = await axios.get('/request/get/infrastructure/terminal');
      setRequests(filterArray(response.data, 'status', ['Completed', 'Request Canceled', 'Request Rejected']));
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  return (
    <AuthenticatedLayout user={auth.user}>

      <Head title="Depot History" />
      <InfrastructureLayout
        user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Depot", "History"]}
          onClickHandlers={[
            () => router.get('/depot'),
            () => router.get('/depot/history')
          ]}
        />
        }
      >
        <div className="p-4 flex-1">
          <div className={`w-full h-full ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}>
            <AgGridReact
              rowData={requests}
              columnDefs={colDefs}
              rowSelection='single'
              pagination={true}
            />
          </div>
        </div>
      </InfrastructureLayout>
    </AuthenticatedLayout>
  )
}

export default TerminalHistory;

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
        <div className='flex items-center h-full'>
          <p className={`leading-normal whitespace-nowrap p-1 px-3 rounded-full ${requestStatus.find(status => status.name === params.data?.status)?.color}`}>{params.data.status}</p>
        </div>
      )
    }
  }
];