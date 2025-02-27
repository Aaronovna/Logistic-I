import { useState, useEffect, useCallback } from 'react';
import { useStateContext } from '@/context/contextProvider';

import useRole from '@/hooks/useRole';
import { AgGridReact } from 'ag-grid-react';
import { router } from '@inertiajs/react';
import { dateFormatShort, dateTimeFormatShort } from '@/Constants/options';
import Status from '@/Components/Status';
import { returnStatus } from '@/Constants/status';
import { TbX } from "react-icons/tb";

const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

const ReturnHistory = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const { themePreference } = useStateContext();
  const [history, setHistory] = useState([]);
  const [gridApi, setGridApi] = useState(null);
  const [openDetailSection, setOpenDetailSection] = useState(false);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [returns, setReturns] = useState([]);
  const fetchReturns = async () => {
    try {
      const response = await axios.get('/return/request/get');
      setReturns(response.data.data);
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchReturns();
  }, [])

  useEffect(() => {
    if (returns) {
      setHistory(filterOrdersByStatuses(returns, ['Completed', 'Canceled']));
    }
  }, [returns])

  const [selectedData, setSelectedData] = useState(null);
  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
    setOpenDetailSection(true);
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Receipt History" />
      <Layout
        user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Return", "History"]}
          onClickHandlers={[
            () => router.get('/return'),
            () => router.get('/return/history')
          ]}
        />
        }
      >
        {!hasAccess(auth.user.type, [2050, 2052]) ? <Unauthorized /> :
          <div className="content flex-1 flex gap-2">
            <div className={`h-full ${openDetailSection ? 'w-4/6' : 'w-full'} ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} >
              <AgGridReact
                rowData={history}
                columnDefs={colDefs}
                rowSelection='single'
                pagination={true}
                onGridReady={onGridReady}
                onSelectionChanged={onSelectionChanged}
                getRowStyle={() => ({
                  cursor: "pointer",
                })}
              />
            </div>

            <div className={`w-2/6 border-card flex-1 p-4 ${openDetailSection ? 'block' : 'hidden'} flex flex-col shadow-lg`}>
              <div className="flex items-start">
                <p className="text-gray-600">{new Date(selectedData?.created_at).toLocaleString(undefined, dateTimeFormatShort)}</p>
                <button className="ml-auto" onClick={() => setOpenDetailSection(false)}><TbX size={20} /></button>
              </div>
              <div className="mt-8">
                <div className="flex justify-between mb-4 text-sm">
                  <p className="text-lg font-medium">Items List</p>
                  <Status statusArray={returnStatus} status={selectedData?.status} />
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {selectedData && JSON.parse(selectedData.items).map((item, index) => {
                    return (
                      <div key={index} className="w-full flex flex-col border mb-2 rounded-md">
                        <div className="w-full flex justify-between px-2 pt-1">
                          <p className="font-medium">{item.name}</p>
                          <p className="text-right font-medium text-gray-600 text-sm">
                            {item.quantityType === 'qty' ? `${item.value} pcs.` : `${item.value} kilo/s`}
                          </p>
                        </div>
                        <p className="bg-gray-100 text-sm px-2 pb-1 text-gray-600">{item.category}</p>
                      </div>
                    )
                  })}
                </div>
                <p className="text-sm italic p-1 mt-2">{selectedData?.comment}</p>
              </div>
            </div>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default ReturnHistory;

const colDefs = [
  {
    field: "created_at", headerName: 'Date', flex: 1, maxWidth: 150,
    valueFormatter: (params) => new Date(params.value).toLocaleString(undefined, dateFormatShort)
  },
  {
    field: "infrastructure_name", headerName: "From", flex: 1, minWidth: 200,
  },
  {
    field: "comment", flex: 2,
  },
  {
    field: 'status', flex: 1, minWidth: 200,
    cellRenderer: (params) => {
      return (
        <Status statusArray={returnStatus} status={params.data.status} className="leading-normal whitespace-nowrap p-1 px-3 rounded-full" />
      )
    }
  },
]