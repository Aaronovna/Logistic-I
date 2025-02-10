import InventoryLayout from "@/Layouts/InventoryLayout";
import { Card2 } from "@/Components/Cards";
import { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { useStateContext } from "@/context/contextProvider";
import updateStatus from "@/api/updateStatus";
import Status from "@/Components/Status";
import { returnStatus } from "@/Constants/status";

const Return = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2052])) {
    return (
      <Unauthorized />
    )
  }
  const { themePreference } = useStateContext();

  const [returns, setReturns] = useState([]);
  const fetchReturns = async () => {
    try {
      const response = await axios.get('/return/request/get');
      setReturns(response.data);
    } catch (error) {

    }
  }

  const [returnedMaterials, setReturnedMaterials] = useState([]);
  const fetchReturnedMaterials = async () => {
    try {
      const response = await axios.get('/return/get');
      setReturnedMaterials(response.data);
    } catch (error) {

    }
  }

  useEffect(() => {
    fetchReturns();
    fetchReturnedMaterials();
  }, [])

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Return" />
      <InventoryLayout user={auth.user} header={<NavHeader headerName="Return" />}>
        <div className="content">
          <div>
            <Card2 name="Return Requests" data={returns?.length} className="w-fit" />
          </div>

          <div className={`${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '508px' }} >
            <AgGridReact
              rowData={returns}
              columnDefs={colDefs}
              rowSelection='single'
              pagination={true}
            />
          </div>
          <div className={`${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`} style={{ height: '508px' }} >
            <AgGridReact
              rowData={returnedMaterials}
              columnDefs={returnedMaterialColDefs}
              rowSelection='single'
              pagination={true}
            />
          </div>
        </div>
      </InventoryLayout>
    </AuthenticatedLayout>
  )
}

export default Return;

const acceptReturn = async (id) => {
  updateStatus(`/return/request/update/${id}`, { status: 'Request Approved' });
}

const deliverReturn = async (id) => {
  updateStatus(`/return/request/update/${id}`, { status: 'Delivered' });
}

const onAccept = async (id, data) => {
  const returnPromises = data.map(async (item) => {
    const payload = {
      return_id: id,
      name: item.name,
      category: item.category,
      weight: item.quantityType === 'wt' ? item.quantity : null,
      quantity: item.quantityType === 'qty' ? item.quantity : null,
      assoc_product: item.assoc_product,
    }
    try {
      const response = await axios.post(`/return/create`, payload)
      toast.success('success');
    } catch (error) {
      toast.error('error');
    }
  })

  const results = await Promise.all(returnPromises);

  const url = `/return/request/update/${id}`;
  updateStatus(url, { status: 'Completed' })
}

const colDefs = [
  {
    field: "created_at", headerName: 'Date', maxWidth: 100,
    cellRenderer: (params) => {
      return (
        <span>{new Date(params.data.created_at).toLocaleDateString()}</span>
      )
    }
  },
  {
    field: "infrastructure_name", headerName: "From", minWidth: 300,
  },
  {
    field: "items", autoHeight: true, flex: 1,
    cellRenderer: (params) => {
      const items = JSON.parse(params.data.items);

      return (
        <div>
          <span className="w-full flex">
            <p className="w-2/6 font-medium text-gray-600">Category</p>
            <p className="w-3/6 font-medium text-gray-600">Name</p>
            <p className="w-1/6 font-medium text-gray-600 text-right">Qty.</p>
          </span>
          {
            items.map((item, index) => {
              return (
                <span key={index} className="w-full flex">
                  <p className="w-2/6 overflow-hidden text-ellipsis">{item.category}</p>
                  <p className="w-3/6 overflow-hidden text-ellipsis">{item.name}</p>
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
        <Status statusArray={returnStatus} status={params.data.status} className="leading-normal whitespace-nowrap p-1 px-3 rounded-full" />
      )
    }
  },
  {
    field: 'Action', minWidth: 120,
    cellRenderer: (params) => {
      if (params.data.status === 'Waiting for Approval') {
        return (
          <button onClick={() => acceptReturn(params.data.id)} className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300" >
            Accept
          </button>
        )
      }

      const { debugMode } = useStateContext();
      if (debugMode && params.data.status === 'Request Approved') {
        return (
          <button onClick={() => deliverReturn(params.data.id)} className="italic leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300" >
            Mark as delivered
          </button>
        )
      }

      if (params.data.status === 'Delivered') {
        return (
          <button onClick={() => onAccept(params.data.id, JSON.parse(params.data.items))} className="leading-normal whitespace-nowrap p-1 px-3 rounded-lg bg-green-100 text-green-600 outline outline-1 outline-green-300" >
            Complete
          </button>
        )
      }

      return null;
    }
  }
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
    field: 'qty/wt', headerName: 'Quantity / Weight', flex: 1,
    cellRenderer: (params) => {
      return (
        <span>{params.data.quantity ? `${params.data.quantity} Qty.` : `${params.data.weight} Wt.`}</span>
      )
    }
  },
]