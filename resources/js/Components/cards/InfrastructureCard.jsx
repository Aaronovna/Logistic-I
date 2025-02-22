const pic = 'https://media.istockphoto.com/id/457796927/photo/warehouse-building.jpg?s=612x612&w=0&k=20&c=7B89_PjoILSAGcoq7XZYkQsLfXRMOzDlxQlcbyVcWDw=';

const InfrastructureCard = ({ data = {}, onClick = () => {} }) => {
  return (
    <div 
      className='relative h-52 p-4 border-card overflow-hidden bg-cover bg-center hover:cursor-pointer'
      style={{backgroundImage: `url(${data?.image_url})`}}
      onClick={onClick}
    >
      <div className='group hover:bg-black/50 z-10 absolute w-full h-full left-0 top-0 p-2 flex duration-200'>
        <p className='text-white font-semibold text-lg mt-auto z-10'>{data?.name}</p>
        <div className='absolute bottom-0 left-0 w-full h-14 t-d-grad group-hover:bg-transparent z-0'></div>
      </div>
    </div>
  )
}

export default InfrastructureCard;