import { useEffect, useState } from 'react';
import { useStateContext } from '@/context/contextProvider';
import { router } from '@inertiajs/react';

import AuditLayout from '@/Layouts/AuditLayout';
import AuditReportCard from '@/Components/cards/AuditReportCard';
import { filterArray } from '@/functions/filterArray';

import { TbUserSearch } from 'react-icons/tb';
import { TbClipboardList } from "react-icons/tb";
import { TbReport } from 'react-icons/tb';

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { dateFormatShort } from '@/Constants/options';

const Card = ({ name = "name", data = 0, Icon }) => {
  return (
    <div className='relative w-[48%] border-card shadow-sm flex flex-col'>
      <p className='font-semibold text-xl'>{name}</p>
      <p className='text-4xl font-bold text-gray-500 mt-auto ml-1 drop-shadow'>{data}</p>
      <span className='absolute bottom-2 right-2 text-gray-300 drop-shadow'>
        <Icon size={64} />
      </span>
    </div>
  )
}

const Reports = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2054, 2055])) {
    return (
      <Unauthorized />
    )
  }

  const { theme } = useStateContext();

  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/user/get');
      setUsers(filterArray(response.data, 'type', [2054, 2055]));
    } catch (error) {
      toast.error(error);
    }
  }

  const [tasks, setTasks] = useState([]);
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/audit/task/get');
      setTasks(response.data);
    } catch (error) {
      toast.error(error);
    }
  }

  const [reports, setReports] = useState([]);
  const fetchReports = async () => {
    try {
      const response = await axios.get('/audit/report/get');
      setReports(response.data);
    } catch (error) {
      toast.error(error);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchReports();
  }, [])

  useEffect(() => {
    if (users.length !== 0) {
      //console.log(convertPermissions(users[0].permissions)[0][100]);
    }
  }, [users])

  const handleReportClick = (id) => {
    router.get('/reports/view', { id: id });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Reports" />
      <AuditLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Reports</h2>}>
        <div className="content">
          <div className='flex gap-4'>
            <div className='overflow-hidden border-card p-0 w-1/2 h-64 flex flex-col shadow-md hover:shadow-xl hover:scale-[101%] duration-200 cursor-pointer pattern1 bg-cover' onClick={() => handleReportClick(reports[0]?.id)}>
              <div className='flex m-4'>
                <p className='text-xl font-medium text-white'>Recent Report</p>
                <p className='text-lg font-medium ml-auto text-white'>{new Date(reports[0]?.created_at).toLocaleDateString(undefined, dateFormatShort)}</p>
              </div>
              <div className='bg-white mt-16 px-4 py-2 shadow-lg'>
                <p>{reports[0]?.task_assigned_to_name}</p>
                <p className='font-medium text-lg drop-shadow-lg'>{reports[0]?.task_title}</p>
              </div>
              <p className='mt-auto font-medium text-lg text-white m-4'>{reports[0]?.task_type}</p>
            </div>

            <div className='w-1/2 gap-4 h-64 flex flex-wrap'>
              <Card name='Auditors' data={users?.length} Icon={TbUserSearch} />
              <Card name='Tasks' data={tasks?.length} Icon={TbClipboardList} />
              <Card name='Reports' data={reports?.length} Icon={TbReport} />
            </div>
          </div>

          <p className='font-semibold text-xl mt-8 mb-4'>Pending Reviews</p>
          <div className='flex flex-col gap-2'>
            {
              reports && reports.map((report, index) => {
                return (
                  <AuditReportCard data={report} key={index} onClick={() => handleReportClick(report.id)} />
                )
              })
            }
          </div>
        </div>
      </AuditLayout>
    </AuthenticatedLayout>
  );
}

export default Reports;

/* const auditorColDefs = [
  { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
  { field: "name", filter: true, flex: 2, minWidth: 200 },
  {
    field: "task", filter: true, flex: 1, minWidth: 70, maxWidth: 90,
    cellRenderer: (params) => {
      const [tasks, setTasks] = useState([]);
      useEffect(() => {
        const fetchUsers = async () => {
          try {
            const response = await axios.get(`/audit/user/task/get/${params.data.id}`);
            setTasks(response.data);
          } catch (error) {
            toast.error("Failed to fetch tasks");
          }
        };

        fetchUsers();
      }, [params.data.id]);
      return (
        <p>{tasks?.length === 0 ? 'none' : tasks?.length}</p>
      )
    }
  },
]; */