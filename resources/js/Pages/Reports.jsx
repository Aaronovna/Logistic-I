import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

import useRole from '@/hooks/useRole';
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
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    try {
      const response = await axios.get('/user/get');
      setUsers(filterArray(response.data.data, 'type', [2054, 2055]));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [tasks, setTasks] = useState([]);
  const fetchTasks = async () => {
    try {
      const response = await axios.get('/audit/task/get');
      setTasks(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [reports, setReports] = useState([]);
  const fetchReports = async () => {
    try {
      const response = await axios.get('/audit/report/get');
      setReports(filterArray(response.data.data, 'review_status', ["Pending Review"]));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchTasks();
    fetchReports();
  }, [])

  const handleReportClick = (id) => {
    if (id) {
      router.get('/reports/view', { id: id });
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Reports" />
      <Layout user={auth.user} header={<NavHeader headerName="Reports" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2054, 2055]) ? <Unauthorized /> :
          <div className="content">
            <div className='flex gap-4'>
              <div className='overflow-hidden border-card p-0 w-1/2 h-64 flex flex-col shadow-md hover:shadow-xl hover:scale-[101%] duration-200 cursor-pointer pattern1 bg-cover'
                onClick={() => handleReportClick(reports[0]?.id)}
              >
                {reports && reports.length <= 0 ? <div className='w-full h-full flex items-center bg-gray-50/50'><p className='font-semibold text-2xl text-center w-full'>No Recent Reports</p></div> :
                  <>
                    <div className='flex m-4'>
                      <p className='text-xl font-medium text-white'>Recent Report</p>
                      <p className='text-lg font-medium ml-auto text-white'>{new Date(reports[0]?.created_at).toLocaleDateString(undefined, dateFormatShort)}</p>
                    </div>
                    <div className='bg-white mt-auto px-4 py-6 shadow-lg'>
                      <p>{reports[0]?.task_assigned_to_name}</p>
                      <p className='font-medium text-lg drop-shadow-lg'>{reports[0]?.task_title}</p>
                      <p className='mt-4 font-medium text-lg'>{reports[0]?.task_type}</p>
                    </div>
                  </>
                }
              </div>
              <div className='w-1/2 gap-4 h-64 flex flex-wrap'>
                <Card name='Auditors' data={users?.length} Icon={TbUserSearch} />
                <Card name='Tasks' data={tasks?.length} Icon={TbClipboardList} />
                <Card name='Reports' data={reports?.length} Icon={TbReport} />
              </div>
            </div>

            <div className='w-full flex mb-2 mt-8 items-end'>
              <div className='flex items-baseline ml-2'>
                <p className='font-semibold text-2xl'>Pending Reviews</p>
                <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('reports-history')}>History</Link>
              </div>
            </div>
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
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Reports;