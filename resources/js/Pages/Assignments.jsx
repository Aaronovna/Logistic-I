import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import useRole from "@/hooks/useRole";
import { Card2 } from "@/Components/Cards";
import { TbCheckbox } from "react-icons/tb";
import { TbCheckupList } from "react-icons/tb";
import { filterArray } from "@/functions/filterArray";
import AuditAssignmentCard from "@/Components/cards/AuditAssignmentCard";

const Assignments = ({ auth }) => {
  const { hasAccess, getLayout, hasPermissions } = useRole();
  const Layout = getLayout(auth.user.type);

  const [tasks, setTasks] = useState([]);
  const fetchAuditorTasks = async (id) => {
    try {
      const response = await axios.get(`/audit/user/task/get/${id}`);
      setTasks(filterArray(response.data.data, 'status', ['Completed', 'Canceled'], true));
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  const handleCardClick = (id) => {
    router.get('/assignments/view', { id: id });
  };

  useEffect(() => {
    fetchAuditorTasks(auth.user.id);
  }, [auth]);
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Tasks" />
      <Layout user={auth.user} header={<NavHeader headerName="Assignments" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2054, 2055]) ? <Unauthorized /> :
          <div className="content">
            <div className="flex items-end gap-4">
              <Card2 data={filterArray(tasks, 'status', ['In Progress', 'Pending Review'])?.length} name="Active Tasks" className="w-full" Icon={TbCheckbox}/>
              <Card2 data={filterArray(tasks, 'status', ['Completed', 'Canceled'], true)?.length} name="Total Tasks" className="w-full" Icon={TbCheckupList}/>
            </div>
            <div className='w-full flex mb-2 mt-8 items-end'>
              <div className='flex items-baseline ml-2'>
                <p className='font-semibold text-2xl'>Assignments</p>
                <Link className='ml-2 text-sm hover:underline text-gray-600' href={route('assignments-history')}>History</Link>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {tasks && tasks.map((task, index) => {
                return (
                  <AuditAssignmentCard data={task} key={index} onClick={() => handleCardClick(task.id)} />
                )
              })}
            </div>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  )
}

export default Assignments;