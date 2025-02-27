import useRole from "@/hooks/useRole";
import { Card2 } from "@/Components/Cards";
import { useEffect, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { useStateContext } from "@/context/contextProvider";
import useUpdateStatus from "@/api/useUpdateStatus";
import Status from "@/Components/Status";
import { returnStatus } from "@/Constants/status";
import { dateFormatShort, dateTimeFormatShort } from "@/Constants/options";
import { TbX } from "react-icons/tb";
import { filterArray } from "@/functions/filterArray";

const Return = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const { themePreference, debugMode } = useStateContext();
  const { updateStatus } = useUpdateStatus();
  const [returns, setReturns] = useState([]);
  const fetchReturns = async () => {
    try {
      const response = await axios.get('/return/request/get');
      setReturns(filterArray(response.data.data, 'status', ['Completed', 'Canceled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [returnedMaterials, setReturnedMaterials] = useState([]);
  const fetchReturnedMaterials = async () => {
    try {
      const response = await axios.get('/return/get');
      setReturnedMaterials(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  useEffect(() => {
    fetchReturns();
    fetchReturnedMaterials();
  }, [])

  const [gridApi, setGridApi] = useState(null);

  const onGridReady = useCallback((params) => {
    setGridApi(params.api);
  }, []);

  const [selectedData, setSelectedData] = useState(null);
  const onSelectionChanged = (event) => {
    const selectedRows = event.api.getSelectedRows();
    setSelectedData(selectedRows[0] || null);
    setOpenDetailSection(true);
  };

  const [openDetailSection, setOpenDetailSection] = useState(false);

  const acceptReturn = async (id) => {
    const response = await updateStatus(`/return/request/update/${id}`, { status: 'Request Approved' });

    if (response.status === 200) {
      fetchReturns();
      fetchReturnedMaterials();
    }
  }

  const deliverReturn = async (id) => {
    const response = await updateStatus(`/return/request/update/${id}`, { status: 'Delivered' });

    if (response.status === 200) {
      fetchReturns();
      fetchReturnedMaterials();
    }
  }

  const onAccept = async (id, data) => {
    const materials = data.map(item => ({
      return_id: id,
      name: item.name,
      category: item.category,
      quantity: item.quantityType === 'qty' ? item.value : null,
      unit: item.quantityType === 'unit' ? item.value : null,
    }));

    try {
      const response = await axios.post('/return/create/bulk', { materials });
      toast.success(response.data.message);

      if (response.status === 200) {
        const url = `/return/request/update/${id}`;
        const updateResponse = await updateStatus(url, { status: 'Completed' });

        if (updateResponse.status === 200) {
          fetchReturns();
          fetchReturnedMaterials();
        }
      }

    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Return" />
      <Layout user={auth.user} header={<NavHeader headerName="Return" />}>
        {!hasAccess(auth.user.type, [2050, 2052]) ? <Unauthorized /> :
          <div className="content">
            <div>
              <Card2 name="Return Requests" data={returns?.length} className="w-fit" />
            </div>

            <div className='mt-8 flex items-end'>
              <p className='font-medium text-2xl'>Return Requests</p>
              <Link
                className='ml-auto font-medium border-card'
                href={route('return-history')}
              >
                View History
              </Link>
            </div>

            <div className="flex gap-4 mt-2">
              <div className={`h-[508px] ${openDetailSection ? 'w-4/6' : 'w-full'} ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} >
                <AgGridReact
                  rowData={returns}
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
                              {item.quantityType === 'qty' ? `${item.value} pcs.` : `${item.value}`}
                            </p>
                          </div>
                          <p className="bg-gray-100 text-sm px-2 pb-1 text-gray-600">{item.category}</p>
                        </div>
                      )
                    })}
                  </div>
                  <p className="text-sm italic p-1 mt-2">{selectedData?.comment}</p>
                </div>
                <div className="mt-auto">
                  {
                    selectedData?.status === 'Waiting for Approval' ?
                      <button onClick={() => acceptReturn(selectedData?.id)} className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300" >
                        Accept
                      </button> : null
                  }
                  {
                    debugMode && selectedData?.status === 'Request Approved' ?
                      <button onClick={() => deliverReturn(selectedData?.id)} className="italic leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300" >
                        Mark as delivered
                      </button> : null
                  }
                  {
                    selectedData?.status === 'Delivered' ?
                      <button onClick={() => onAccept(selectedData?.id, JSON.parse(selectedData?.items))} className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300" >
                        Complete
                      </button> : null
                  }
                </div>
              </div>
            </div>

            <p className="mt-6 text-xl font-semibold">Returned Materials</p>

            <div className={`mt-2 ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '508px' }} >
              <AgGridReact
                rowData={returnedMaterials}
                columnDefs={returnedMaterialColDefs}
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

export default Return;

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

const returnedMaterialColDefs = [
  {
    field: 'created_at', headerName: 'Date', flex: 1,
    cellRenderer: (params) => {
      return (
        <span>{new Date(params.data.created_at).toLocaleDateString()}</span>
      )
    }
  },
  {
    field: 'name', flex: 1,
  },
  {
    field: 'category', flex: 1,
  },
  {
    field: 'qty/unit', headerName: 'Quantity / Unit', flex: 1,
    cellRenderer: (params) => {
      return (
        <span>{params.data.quantity ? `${params.data.quantity} Qty.` : `${params.data.unit}`}</span>
      )
    }
  },
]