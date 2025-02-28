import { useState, useEffect } from 'react';
import useRole from '@/hooks/useRole';
import { router } from '@inertiajs/react';
import { filterArray } from '@/functions/filterArray';
import AuditAssignmentCard from '@/Components/cards/AuditAssignmentCard';

const AssignmentsHistory = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const [history, setHistory] = useState();
  const [tasks, setTasks] = useState([]);
  const fetchAuditorTasks = async (id) => {
    try {
      const response = await axios.get(`/audit/user/task/get/${id}`);
      setTasks(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    fetchAuditorTasks(auth.user.id);
  }, [auth]);

  useEffect(() => {
    if (tasks) {
      setHistory(filterArray(tasks, 'status', ['Completed', 'Canceled']));
    }
  }, [tasks])

  const handleCardClick = (id) => {
    router.get('/assignments/view', { id: id });
  };

  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="Report History" />
      <Layout user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Assignments", "History"]}
          onClickHandlers={[
            () => router.get('/assignments'),
            () => router.get('/assignments/history')
          ]}
        />
        }
      >
        <div className='content flex flex-col gap-2'>
          {history && history.map((task, index) => {
            return (
              <AuditAssignmentCard data={task} key={index} onClick={()=>handleCardClick(task.id)}/>
            )
          })}
        </div>
      </Layout>
    </AuthenticatedLayout>
  )
}

export default AssignmentsHistory;   