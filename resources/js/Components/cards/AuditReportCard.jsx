const AuditReportCard = ({ data = {}, onClick = () => { } }) => {
  return (
    <div className='border-card p-4 hover:shadow-md hover:cursor-pointer' onClick={onClick}>
      <div className='flex justify-between'>
        <p className='font-medium text-lg'>{data.task_type}</p>
        <p className="font-medium text-gray-600">{new Date(data.created_at).toLocaleDateString()}</p>
      </div>
      <p className="text-sm">{data.location}</p>
      <p className="mt-4">{data.task_assigned_to_name}</p>
    </div>
  )
}

export default AuditReportCard;