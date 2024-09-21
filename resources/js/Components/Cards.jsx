import { useStateContext } from "@/context/contextProvider";
import { gradients } from "@/Constants/themes";
import { useState } from "react";

import { TbDots } from "react-icons/tb";
import PopperMenu from "./PopperMenu";

const product_image_placeholder = 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png';

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

export const ProductCard = ({ product, isFlip = false, className = '' }) => {
  const { theme } = useStateContext();
  const [flip, setflip] = useState(isFlip);

  return (
    <div style={{ color: theme.text, borderColor: theme.border }}
      className={`p-2 flex mb-2 border rounded-lg overflow-hidden ` + className}
    >
      <div className="flex flex-col w-full">
        <div className="flex cursor-pointer" onClick={() => setflip(!flip)}>
          <div style={{ outlineColor: theme.border, background: `url(${product_image_placeholder})`, backgroundSize: '100%' }}
            className='w-24 h-24 aspect-square outline outline-1 rounded-md inline-block overflow-hidden'
          >
            <img
              src={product.image_url || `https://picsum.photos/seed/${product.id}/200/200`}
              className={`w-full h-full`}
            />
          </div>
          {!flip
            ? <div className='flex flex-col mx-4 h-fit w-96 select-none'>
              <p className='text-xl font-semibold'>{`${product.name} ${product.model}`}</p>
              <p className='font-medium text-gray-400'>{product.brand}</p>
              <p className='mt-5 text-gray-400'>{product.category_name}</p>
            </div>
            : <p className='m-4 mt-0 select-none'>{product.description}</p>
          }
          <p className='font-medium text-gray-300 ml-auto h-fit select-none'>{product.id}</p>
        </div>
      </div>

      <span className='h-auto rounded-sm mx-4' style={{ width: '2px', background: theme.border }}></span>

      <div className='w-96 h-fit'>
        <span className="flex justify-between">
          <p className='block mb-2 font-semibold'>{product.supplier_name}</p>
          <PopperMenu list={['Edit', 'Delete']} actions={[() => { alert('test!') }]}
            className=""
            containerStyle={{ background: theme.background, borderRadius: '0.375rem', border: '1px solid', borderColor: theme.border }}
            renderButton={() => {
              return (
                <span className={`flex h-fit cursor-pointer rounded-full px-1`}>
                  <TbDots size={18} />
                </span>
              )
            }}>
          </PopperMenu>
        </span>
        <span className='inline-block mr-8'>
          <p className='text-gray-400'>Stock</p>
          <p className='text-xl font-semibold inline' style={{ color: product.low_on_stock ? theme.danger : theme.text }}>{product.stock}</p>
          {product.low_on_stock
            ? <p className="inline ml-1 text-xs">low</p>
            : null
          }
        </span>
        <span className='inline-block'>
          <p className='text-gray-400'>Buying Price</p>
          <p className='text-xl font-semibold'>{product.price}</p>
        </span>
      </div>
    </div>
  )

}