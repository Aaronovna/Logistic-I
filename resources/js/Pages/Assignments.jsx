import AuditLayout from "@/Layouts/AuditLayout";
import { useStateContext } from "@/context/contextProvider";
import { useState, useEffect } from "react";
import { dateTimeFormatLong } from "@/Constants/options";
import { router } from "@inertiajs/react";
import { auditTaskStatus } from "@/functions/status";
import { Card2 } from "@/Components/Cards";

const Assignments = ({ auth }) => {
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
      <AuditLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Assignments</h2>}>
        <div className="content">
          <div className="flex items-end">
            <Card2 data={tasks?.length} name="Your Task"/>
            <button>History</button>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            {tasks && tasks.map((task, index) => {
              return (
                <div className="p-4 hover:bg-gray-200 cursor-pointer border-card" key={index} onClick={()=>handleCardClick(task?.id)}>
                  <div className="flex justify-between">
                    <p className="font-semibold text-lg">{task.title}</p>
                    <p className="text-gray-600">{new Date(task.created_at).toLocaleString(undefined, dateTimeFormatLong)}</p>  
                  </div>
                  <div className="mt-4 flex">
                    <p className="font-medium mr-4">Type <span className="font-medium text-gray-600">{task.type}</span></p>
                    <p className="font-medium">Assigned By <span className="font-medium text-gray-600">{task.assigned_by_name}</span></p>
                  </div>
                  <p className={`mt-2 rounded-md py-1 px-2 h-fit w-fit ${auditTaskStatus.find(status => status.name === task?.status)?.color}`}>{task?.status}</p>
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