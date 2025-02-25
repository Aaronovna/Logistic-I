import { useStateContext } from "@/context/contextProvider";

export const product_image_placeholder = 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png';

export const ProductCard = ({ product, className = '', onClick = () => { } }) => {
  const { theme } = useStateContext();

  return (
    <div style={{ color: theme.text, borderColor: theme.border }}
      className={`relative flex md:flex-row flex-col mb-2 border rounded-lg overflow-hidden md:h-28 cursor-pointer ` + className}
      onClick={onClick}
    >
      <div className="flex flex-col w-1/2 pr-2 md:border-r">
        <div className="relative flex h-28">
          <div style={{ outlineColor: theme.border, backgroundSize: '100%' }}
            className='w-28 aspect-square outline outline-1 rounded-l-md inline-block overflow-hidden product-placeholder'
          >
            <img
              src={product.image_url || product_image_placeholder/* `https://picsum.photos/seed/${product.id}/200/200` */}
              className={`w-full h-full`}
            />
          </div>

          <div className='flex flex-col mx-2 h-full flex-1 select-none py-1'>
            <p className='text-lg font-semibold'>{`${product.name} ${product.model}`}</p>
            <p className='text text-gray-400'>{product.brand}</p>
            <p className='mt-auto md:text-base text-sm text-gray-400'>{product.category_name}</p>
          </div>

        </div>
      </div>

      <div className='md:pl-2 pl-0 md:w-1/2 w-full md:border-none border-t h-full py-1'>
        <span className="flex ml-4 md:ml-0">
          <p className='block md:mb-2 mb-0 font-semibold'>{product.supplier_name}</p>
        </span>
        <div className="flex">
          <span className='inline-block ml-4 md:ml-0'>
            <p className='text-gray-400 md:text-base text-sm'>Stock</p>
            <p className='md:text-xl text-lg font-semibold inline' style={{ color: product.low_on_stock ? theme.danger : theme.text }}>{product.stock}</p>
            {product.low_on_stock
              ? <p className="inline ml-1 text-xs" style={{ color: product.low_on_stock ? theme.danger : theme.text }}>{product.stock === 0 ? 'out of stock' : 'low'}</p>
              : null
            }
          </span>
          <span className='inline-block ml-auto mr-4 md:mr-2'>
            <p className='text-gray-400 md:text-base text-sm'>Buying Price</p>
            <p className='md:text-xl text-lg font-semibold'>{product.price}</p>
          </span>
        </div>
      </div>
    </div>
  )

}