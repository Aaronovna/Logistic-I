import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import { useStateContext } from "@/context/contextProvider";
import Status from "@/Components/Status";
import AuditLayout from "@/Layouts/AuditLayout";
import { Card2 } from "@/Components/Cards";
import { auditTaskStatus } from "@/Constants/status";
import { dateTimeFormatShort } from "@/Constants/options";
import { filterArray } from "@/functions/filterArray";
import { TbClockExclamation, TbCalendar } from "react-icons/tb";

const Assignments = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2054, 2055])) {
    return (
      <Unauthorized />
    )
  }

  const { theme } = useStateContext();

  const [tasks, setTasks] = useState([]);
  const fetchUsers = async (id) => {
    try {
      const response = await axios.get(`/audit/user/task/get/${id}`);
      setTasks(response.data);
    } catch (error) {
      toast.error("Failed to fetch tasks");
    }
  };

  const handleCardClick = (id) => {
    router.get('/assignments/view', { id: id });
  };

  useEffect(() => {
    fetchUsers(auth.user.id);
  }, [auth]);
  return (
    <AuthenticatedLayout user={auth.user}>
      <Head title="My Tasks" />
      <AuditLayout user={auth.user} header={<NavHeader headerName="Assignments"/>}>
        <div className="content">
          <div className="flex items-end gap-4">
            <Card2 data={filterArray(tasks, 'status', ['In Progress', 'Pending Review'])?.length} name="Active Task" className="w-full" />
            <Card2 data={tasks?.length} name="Total Task" className="w-full" />
          </div>
          <button>History</button>
          <div className="mt-8 flex flex-col gap-2">
            {tasks && tasks.map((task, index) => {
              return (
                <div className="p-4 hover:bg-gray-200 cursor-pointer border-card" key={index} onClick={() => handleCardClick(task?.id)}>
                  <div className="flex items-end">
                    <p className="font-semibold text-lg">{task.title}</p>
                    {new Date(task.deadline) - new Date(task.startdate) <= 3 * 24 * 60 * 60 * 1000 ?
                      <p className={`rounded-md py-1 px-2 h-fit w-fit text-red-600 bg-red-100 flex items-center ml-4`}><TbClockExclamation className="mr-1" />Deadline</p>
                      : null}

                    <Status statusArray={auditTaskStatus} status={task?.status} className="ml-auto" />
                  </div>

                  <p className="font-medium text-gray-600 mt-3">Type <span className="font-medium text-black">{task.type}</span></p>
                  <p className="font-medium text-gray-600">Assigned By <span className="font-medium text-black">{task.assigned_by_name}</span></p>

                  <p className="mt-3 flex items-center">{`${new Date(task.startdate).toLocaleString(undefined, dateTimeFormatShort)} - ${new Date(task.deadline).toLocaleString(undefined, dateTimeFormatShort)}`}</p>
                </div>
              )
            })}
          </div>
        </div>
      </AuditLayout>
    </AuthenticatedLayout>
  )
}

export default Assignments;