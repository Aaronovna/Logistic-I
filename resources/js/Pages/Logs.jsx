import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { AgGridReact } from 'ag-grid-react';

import useRole from '@/hooks/useRole';
import { dateTimeFormatShort } from '@/Constants/options';

const Logs = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);
  const { themePreference } = useStateContext();

  const [logs, setLogs] = useState([]);

  const fetchLogs = async (model = 'inventory') => {
    try {
      const response = await axios.get(`/audit/get/${model}`)
      setLogs(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [selectedModel, setSelectedModel] = useState();
  useEffect(() => {
    if (selectedModel !== 'none') {
      fetchLogs(selectedModel);
    }
  }, [selectedModel])

  const colDefs = [
    {
      field: "created_at", filter: true, width: 200,
      valueFormatter: (params) => new Date(params.value).toLocaleString(undefined, dateTimeFormatShort)
    },
    {
      field: "user_name", filter: true, flex: 1, headerName: 'User (IP)',
      valueFormatter: (params) => `${params.data.user_name} (${params.data.ip_address})`
    },
    { field: "action", minWidth: 120, maxWidth: 150, filter: true, },
    {
      field: "model", width: 175, filter: true, headerName: 'Model (ID)',
      valueFormatter: (params) => `${params.data.model} (${params.data.model_id})`
    },
    { field: "message", flex: 1, filter: true, },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Logs" />

      <Layout user={auth.user} header={<NavHeader headerName="Logs" />}>
        {!hasAccess(auth.user.type, [2050, 2051]) ? <Unauthorized /> :
          <div className="content flex-1">
            <select name="model" id="model" className='border-card w-1/2' onChange={(e) => setSelectedModel(e.target.value)}>
              <option value={'none'}>select model</option>
              {
                models.map((model, index) => <option value={model.model} key={index}>{model.name}</option>)
              }
            </select>

            <div className={`h-full mt-4 ${themePreference === 'light' ? 'ag-theme-quartz' : 'ag-theme-quartz-dark'}`}>
              <AgGridReact
                rowData={logs}
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

export default Logs;

const models = [
  {
    name: 'Audit Report',
    model: 'auditreport',
  },
  {
    name: 'Audit Task',
    model: 'audittask',
  },
  {
    name: 'Category',
    model: 'category',
  },
  {
    name: 'Dispatch Material',
    model: 'dispatchmaterial',
  },
  {
    name: 'File',
    model: 'file',
  },
  {
    name: 'Infrastructure',
    model: 'infrastructure',
  },
  {
    name: 'Inventory',
    model: 'inventory',
  },
  {
    name: 'Position',
    model: 'position',
  },
  {
    name: 'Product',
    model: 'product',
  },
  {
    name: 'Receipt',
    model: 'receipt',
  },
  {
    name: 'Request Material',
    model: 'requestmaterial',
  },
  {
    name: 'Return Material',
    model: 'returnmaterial',
  },
  {
    name: 'Return Request',
    model: 'returnrequest',
  },
  {
    name: 'User',
    model: 'user',
  },
]