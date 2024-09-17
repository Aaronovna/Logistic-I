import { useStateContext } from "@/context/contextProvider";
import { gradients } from "@/Constants/themes";

export const Card = ({ data, Icon, name }) => {
  const { theme, themePreference } = useStateContext();
  return (
    <div className='flex rounded-xl py-3 px-4 items-center justify-between w-fit border' style={{ background: theme.secondary, borderColor: theme.border }}>
      <span className='flex justify-center items-center rounded-md p-2 aspect-square w-fit h-fit' style={{ background: theme.accent, color: theme.background }}>
        <Icon size={32} title={name} />
      </span>
      <span className='ml-4'>
        <p className='font-semibold text-2xl text-right' style={{ color: theme.accent }}>{data ? data : '-'}</p>
        <p className={`text-sm ${themePreference === 'light' ? 'text-black/50' : 'text-white/50'}`}>{name}</p>
      </span>
    </div>
  )
}

export const Card2 = ({ data, Icon, name, className = '' }) => {
  const { theme } = useStateContext();
  return (
    <div className={'rounded-xl pl-4 py-4 pr-20 w-fit ' + className}
      style={{ background: gradients.blue_raspberry, borderColor: theme.border }}
    >
      <div className="mb-4 w-fit p-2 rounded-xl" style={{ background: gradients.blue_raspberry }}>
        <Icon color={'white'} size={32} />
      </div>
      <p className='text-sm font-medium text-white/80'>{name}</p>
      <p className='font-medium text-3xl text-white'>{data ? data : '-'}</p>
    </div>
  )
}

export const ProductCard = ({ product }) => {
  const { theme } = useStateContext();

  return (
    <div
      className='p-2 flex h-28 mb-2 hover:shadow-md cursor-pointer duration-200 hover:my-4 border rounded-lg'
      style={{ color: theme.text, borderColor: theme.border }}
    >
      <div
        className='w-24 aspect-square outline outline-1 rounded-md inline-block overflow-hidden'
        style={{ outlineColor: theme.border }}
      >
        <img
          src={`https://picsum.photos/seed/${product.id}/200/200`}
          alt={product.name}
          className={`w-full h-full`}
        />
      </div>
      <div className='flex flex-col mx-4'>
        <p className='text-xl font-semibold'>{`${product.name} ${product.model}`}</p>
        <p className='font-medium text-gray-400'>{product.brand}</p>
        <p className='mt-auto text-gray-400'>{product.category_name}</p>
      </div>
      <span className='h-full bg-gray-300 rounded-sm ml-auto mx-4' style={{ width: '2px', background: theme.border }}></span>
      <div className='w-96'>
        <p className='block mb-2 font-semibold'>{product.supplier_name}</p>
        <span className='inline-block mr-8'>
          <p className='text-gray-400'>Stock</p>
          <p className='text-xl font-semibold'>{product.stock}</p>
        </span>
        <span className='inline-block'>
          <p className='text-gray-400'>Buying Price</p>
          <p className='text-xl font-semibold'>{product.price}</p>
        </span>
      </div>
    </div>
  )

}