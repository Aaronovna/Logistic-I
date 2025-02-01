import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import AuditReportCard from '@/Components/cards/AuditReportCard';
import { useStateContext } from '@/context/contextProvider';
const cardStyle = 'mb-2 snap-center mx-2 md:min-w-64 inline-block min-w-[100%]';
import AuditorLayout from '@/Layouts/AuditorLayout';
import { filterUsersByPermission } from '@/functions/filterArray';
import { TbUserSearch } from 'react-icons/tb';
import { TbClipboardList } from "react-icons/tb";
import { TbReport } from 'react-icons/tb';
import { router } from '@inertiajs/react';


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

export default function Report({ auth }) {
  const { theme } = useStateContext();

  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/user/get');
      setUsers(filterUsersByPermission(response.data, ["2054"]));
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
      <AuditorLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Reports</h2>}>
        <div className="content">
          <div className='flex gap-10'>
            <div className='border-card p-4 w-1/2 h-64 flex flex-col shadow-md hover:shadow-lg duration-200 cursor-pointer' onClick={()=>handleReportClick(reports[0]?.id)}>
              <div className='flex'>
                <p className='text-xl font-semibold drop-shadow-lg'>Recent Report</p>
                <p className='text-lg font-semibold text-gray-600 ml-auto'>{new Date(reports[0]?.created_at).toLocaleDateString()}</p>
              </div>
              <p className='mt-10'>{reports[0]?.task_type}</p>
              <p className='font-medium text-lg drop-shadow-lg'>{reports[0]?.task_title}</p>
              <p className='mt-auto font-medium text-lg text-gray-600'>{reports[0]?.task_assigned_to_name}</p>
            </div>

            <div className='w-1/2 gap-4 h-64 flex flex-wrap'>
              <Card name='Auditors' data={users?.length} Icon={TbUserSearch} />
              <Card name='Tasks' data={tasks?.length} Icon={TbClipboardList} />
              <Card name='Reports' data={reports?.length} Icon={TbReport} />
            </div>
          </div>

          <p className='font-semibold text-xl mt-8 mb-4'>Reports</p>
          <div className='flex flex-col gap-2'>
            {
              reports && reports.map((report, index)=>{
                return (
                  <AuditReportCard data={report} key={index} onClick={()=>handleReportClick(report.id)}/>
                )
              })
            }
          </div>
        </div>
      </AuditorLayout>
    </AuthenticatedLayout>
  );
}

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