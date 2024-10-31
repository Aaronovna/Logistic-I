const AuditReportCard = () => {
  return (
    <div className='border-card p-4 hover:shadow-md hover:cursor-pointer'>
      <div className='flex justify-between'>
        <p>Johnny Bravo</p>
        <p>31-10-24</p>
      </div>
      <p className='font-medium'>Inventory Audit</p>
    </div>
  )
}

export default AuditReportCard;