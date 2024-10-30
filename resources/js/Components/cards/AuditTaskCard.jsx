import { useStateContext } from "@/context/contextProvider";

const AuditTaskCard = () => {
  const { theme } = useStateContext();
  return (
    <div className='border-card p-4 hover:shadow-md duration-200 h-48 flex flex-col'>
      <div className="flex justify-between">
        <p className="font-medium">Auto generated task from order</p>
        <p className="text-gray-600">Date: 10-29-24</p>
      </div>

      <hr className="my-2" />
      <p className="my-2 font-medium text-lg">Inventory Audit</p>
      <p className="text-ellipsis overflow-hidden whitespace-nowrap">ABCD ABCD ABCD ABCD ABCD ABCD ABCD ABCD ABCD ABCD ABCD ABCD</p>

      <div className='w-full flex mt-auto'>
        <p>Status</p>
        <span className='ml-auto'>
          <button className='font-medium mr-2' style={{ color: theme.primary }}>View Details</button>
          <button className='font-medium' style={{ color: theme.accent }}>Assign Auditor</button>
        </span>
      </div>
    </div>
  )
}

export default AuditTaskCard;