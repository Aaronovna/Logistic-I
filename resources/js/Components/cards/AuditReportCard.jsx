import { dateTimeFormatShort } from "@/Constants/options";
import { TbClockExclamation } from "react-icons/tb";
import Status from "../Status";
import { taskPriorityLevel } from "@/Constants/status";

const AuditReportCard = ({ data = {}, onClick = () => { } }) => {
  const deadline = new Date(data.task_deadline) - new Date(data.task_startdate) <= 3 * 24 * 60 * 60 * 1000 ? true : false;

  return (
    <div className={`p-4 hover:bg-gray-200 cursor-pointer border-card ${(deadline && data.review_status === "Pending Review")  ? 'border-x-red-600 border-x-4' : null}`} onClick={onClick}>
      <div className="flex items-end">
        <p className="font-semibold text-lg">{data.task_title}</p>
        {!(deadline && data.review_status === "Pending Review") ? null :
          <p className={`rounded-md py-1 px-2 h-fit w-fit text-red-600 bg-red-100 flex items-center ml-4`}><TbClockExclamation className="mr-1" />Deadline</p>
        }
        <Status statusArray={taskPriorityLevel} status={data.task_priority} suffix="Priority" className={'ml-auto'} />
      </div>

      <p className="font-medium text-gray-600 mt-3">Type <span className="font-medium text-black">{data.task_type}</span></p>
      <p className="font-medium text-gray-600">Assigned By <span className="font-medium text-black">{data.task_assigned_by_name}</span></p>

      <p className="mt-3 flex items-center">{`${new Date(data.task_startdate).toLocaleString(undefined, dateTimeFormatShort)} - ${new Date(data.task_deadline).toLocaleString(undefined, dateTimeFormatShort)}`}</p>
    </div>
  )
}

export default AuditReportCard;