import { TbClockExclamation } from 'react-icons/tb';
import Status from '@/Components/Status';
import { auditTaskStatus, taskPriorityLevel } from '@/Constants/status';
import { dateTimeFormatShort } from '@/Constants/options';

const AuditAssignmentCard = ({ data, onClick = () => { } }) => {
  const deadline = new Date(data.deadline) - new Date(data.startdate) <= 3 * 24 * 60 * 60 * 1000 ? true : false;

  return (
    <div className="p-4 hover:bg-gray-200 cursor-pointer border-card" onClick={onClick}>
      <div className="flex items-end">
        <p className="font-semibold text-lg">{data.title}</p>
        {!(deadline && (data.status !== "Completed" && data.status !== "Canceled")) ? null :
          <p className={`rounded-md py-1 px-2 h-fit w-fit text-red-600 bg-red-100 flex items-center ml-4`}><TbClockExclamation className="mr-1" />Deadline</p>
        }

        <Status statusArray={auditTaskStatus} status={data.status} className="ml-auto mr-2" />
        <Status statusArray={taskPriorityLevel} status={data.priority} suffix="Priority" />
      </div>

      <p className="font-medium text-gray-600 mt-3">Type <span className="font-medium text-black">{data.type}</span></p>
      <p className="font-medium text-gray-600">Assigned By <span className="font-medium text-black">{data.assigned_by_name}</span></p>

      <p className="mt-3 flex items-center">{`${new Date(data.startdate).toLocaleString(undefined, dateTimeFormatShort)} - ${new Date(data.deadline).toLocaleString(undefined, dateTimeFormatShort)}`}</p>
    </div>
  )
}

export default AuditAssignmentCard;