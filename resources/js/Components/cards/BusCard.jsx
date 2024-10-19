export default function ({data, x}) {
    return (
        <div className='border-card p-4 flex gap-4'>
        <div className='bus-1 h-20 w-20 bg-no-repeat bg-contain'></div>
        <div className='w-4/5'>
          <p>AKE 3442</p>
          <p>On trip</p>
          <p className='text-ellipsis overflow-hidden whitespace-nowrap'>{x}</p>
        </div>
      </div>
    )
}