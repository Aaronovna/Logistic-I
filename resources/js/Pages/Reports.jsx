import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card2 } from '@/Components/Cards';
import { useEffect, useState } from 'react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import AuditReportCard from '@/Components/cards/AuditReportCard';
import { useStateContext } from '@/context/contextProvider';
const cardStyle = 'mb-2 snap-center mx-2 md:min-w-64 inline-block min-w-[100%]';
import AuditorLayout from '@/Layouts/AuditorLayout';
import { filterUsersByPermission } from '@/functions/filterArray';

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

  useEffect(() => {
    fetchUsers();
    fetchTasks();
  }, [])

  useEffect(() => {
    if (users.length !== 0) {
      //console.log(convertPermissions(users[0].permissions)[0][100]);
    }
  }, [users])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Reports" />
      <AuditorLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Reports</h2>}>
        <div className="content">
          <div className='flex gap-4'>
            <div className='border-card p-4 w-1/2 h-60'>
              <p className='font-semibold text-2xl'>Recent Report</p>
            </div>
            <div>
              <Card2 className={cardStyle} name='Auditors' data={users?.length} />
              <Card2 className={cardStyle} name='Task' data={tasks?.length} />
              <Card2 className={cardStyle} name='Reports' data={10} />
            </div>
          </div>

          <div className='px-2'>
            <div className='flex gap-4'>

              <div>
                <p className='font-semibold text-xl mb-2'>Reports</p>
                <div className='flex flex-col gap-2 pr-2 h-[420px] overflow-y-auto'>
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                </div>
              </div>

            </div>
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