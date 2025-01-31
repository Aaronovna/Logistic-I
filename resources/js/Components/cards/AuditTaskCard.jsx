import { useStateContext } from "@/context/contextProvider";
import { dateTimeFormatShort } from "@/Constants/options";
import { auditTaskStatus } from "@/functions/status";

const AuditTaskCard = ({ data = {}, onClick = () => { } }) => {
  const { theme } = useStateContext();
  return (
    <div onClick={onClick} className='border-card p-4 hover:shadow-lg shadow-sm duration-200 h-48 flex flex-col overflow-hidden cursor-pointer'>
      <div className="flex justify-between">
        <div>
          <p className="text-gray-600 font-semibold text-ellipsis overflow-hidden whitespace-nowrap">{data.type}</p>
          <p className="text-gray-600 text-sm">{new Date(data.created_at).toLocaleString(undefined, dateTimeFormatShort)}</p>
        </div>

        <p className={`rounded-md py-1 px-2 h-fit w-fit ${auditTaskStatus.find(status => status.name === data.status)?.color}`} >{data.status}</p>
      </div>

      <hr className="my-2" />
      <p className="my-2 font-semibold text-ellipsis overflow-hidden whitespace-nowrap">{data.title}</p>
      {data.assigned_to ?
        <p className={`font-medium mt-auto`}>
          <span className="font-medium text-gray-500">Assigned to </span>
          {data.assigned_to_name}
        </p>
        :
        <p className="mt-auto font-medium text-gray-500 ">No Auditor Assigned yet</p>
      }

    </div>
  )
}

export default AuditTaskCard;