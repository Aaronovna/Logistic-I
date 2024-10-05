import { useState, useEffect } from "react";
import axios from "axios";
import Modal from "../Modal";
import { TbDots } from "react-icons/tb";
import PopperMenu from "../PopperMenu";
import { useStateContext } from "@/context/contextProvider";
import toast from "react-hot-toast";
import { productToastMessages } from "@/Constants/toastMessages";

const product_image_placeholder = 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png';

export const ProductCard = ({ product, isFlip = false, className = '', categories, suppliers, update }) => {
  const [openEditProductModal, setOpenEditProductModal] = useState(false);
  const { theme } = useStateContext();
  const [flip, setflip] = useState(isFlip);

  const [editProductFormData, setEditProductFormData] = useState({});

  const handleEditProductInputChange = (e) => {
    const { name, value } = e.target;
    setEditProductFormData({ ...editProductFormData, [name]: value });
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.patch(`/product/update/${product.id}`, editProductFormData);
      toast.success(productToastMessages.update.success);
      update();
      setOpenEditProductModal(false);
    } catch (error) {
      toast.error(productToastMessages.update.error, error);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await axios.delete(`/product/delete/${id}}`);
      update();
      toast.success(productToastMessages.destroy.success);
    } catch (error) {
      toast.error(productToastMessages.destroy.error, error);
    }
  };

  useEffect(() => {
    setEditProductFormData({
      name: product.name,
      model: product.model,
      brand: product.brand,
      description: product.description,
      image_url: product.image_url,
      price: product.price,
      restock_point: product.restock_point,
      category_id: product.category_id,
      supplier_id: product.supplier_id,
    })
  }, [product]);


  return (
    <div style={{ color: theme.text, borderColor: theme.border }}
      className={`relative flex md:flex-row flex-col mb-2 border rounded-lg overflow-hidden md:h-28 ` + className}
    >
      <div className="flex flex-col w-full pr-2 md:border-r">
        <div className="relative flex cursor-pointer h-28" onClick={() => setflip(!flip)}>
          <div style={{ outlineColor: theme.border, background: `url(${product_image_placeholder})`, backgroundSize: '100%' }}
            className='w-28 aspect-square outline outline-1 rounded-l-md inline-block overflow-hidden'
          >
            <img
              src={product.image_url || `https://picsum.photos/seed/${product.id}/200/200`}
              /* src={product.image_url} */
              className={`w-full h-full`}
            />
          </div>
          {!flip
            ? <div className='flex flex-col mx-4 h-full w-3/5 select-none'>
              <p className='md:text-xl font-semibold'>{`${product.name} ${product.model}`}</p>
              <p className='font-medium md:text-base text-sm text-gray-400'>{product.brand}</p>
              <p className='mt-auto md:text-base text-sm text-gray-400'>{product.category_name}</p>
            </div>
            : <p className='m-4 mt-0 select-none text-wrap w-3/5 h-full'>{product.description}</p>
          }
          <p className='font-medium text-gray-300 h-fit select-none absolute right-0 bottom-0 hidden md:block'>{product.id}</p>
        </div>
      </div>

      <div className='md:pl-2 pl-0 md:w-1/2 w-full md:border-none border-t h-full'>
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

      <span className="absolute right-0">
        <PopperMenu list={['Edit', 'Delete']} actions={[() => { setOpenEditProductModal(true) }, () => handleDeleteProduct(product.id)]}
          containerStyle={{ background: theme.background, borderRadius: '0.375rem', border: '1px solid', borderColor: theme.border }}
          renderButton={() => {
            return (
              <span className={`flex h-fit cursor-pointer rounded-full px-1 hover:bg-gray-300/50`}>
                <TbDots size={18} />
              </span>
            )
          }} />
      </span>

      <Modal show={openEditProductModal} onClose={() => setOpenEditProductModal(false)} maxWidth={'2xl'}>
        <div className='p-4'>
          <p className='font-semibold text-xl mt-2 mb-4' style={{ color: theme.text }}>Edit Product</p>
          <form onSubmit={handleEditProductSubmit}>
            <div className='flex gap-2 mb-4'>
              <div className='w-52 aspect-square border-card overflow-hidden'
                style={{ background: `url(${product_image_placeholder})`, backgroundSize: '100%' }}>
                {editProductFormData.image_url === ''
                  ? null
                  : <img className='w-full h-full' src={editProductFormData.image_url} alt="Can't load image :(" />
                }
              </div>
              <div className='flex flex-col flex-1 gap-2'>
                <select className='border-card' name="category_id" id="category_id" onChange={handleEditProductInputChange}>
                  <option value={null}>Select Category</option>
                  {categories.map((category, index) => {
                    return (
                      <option key={index} value={category.id}>{category.name}</option>
                    )
                  })}
                </select>
                <select className='border-card' name="supplier_id" id="supplier_id" onChange={handleEditProductInputChange}>
                  <option value={null}>Select Supplier</option>
                  {suppliers.map((supplier, index) => {
                    return (
                      <option key={index} value={supplier.id}>{supplier.name}</option>
                    )
                  })}
                </select>
                <div className='flex gap-2'>
                  <input type="number" name="price" id="price" placeholder="Price"
                    className='border-card'
                    value={editProductFormData.price}
                    onChange={handleEditProductInputChange}
                  />
                  <input type="number" name="restock_point" id="restock_point" placeholder="Restock Point"
                    className='border-card'
                    value={editProductFormData.restock_point}
                    onChange={handleEditProductInputChange}
                  />
                </div>
                <input type="text" name="image_url" id="image_url" placeholder="Image URL"
                  className='border-card'
                  value={editProductFormData.image_url}
                  onChange={handleEditProductInputChange}
                />
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <div className='flex gap-2'>
                <input type="text" name="name" id="name" placeholder="Name"
                  className='border-card w-2/3'
                  value={editProductFormData.name}
                  onChange={handleEditProductInputChange}
                />
                <input type="text" name="model" id="model" placeholder="Model"
                  className='border-card w-1/3'
                  value={editProductFormData.model}
                  onChange={handleEditProductInputChange}
                />
              </div>
              <input type="text" name="brand" id="brand" placeholder="Brand"
                className='border-card w-full'
                value={editProductFormData.brand}
                onChange={handleEditProductInputChange}
              />
              <textarea type="text" name="description" id="description" placeholder="Description"
                rows={6}
                className='border-card w-full resize-none'
                value={editProductFormData.description}
                onChange={handleEditProductInputChange}
              />
              <button
                style={{ background: theme.primary, borderColor: theme.border }}
                className='border-card p-2 font-medium ml-auto text-white'>
                Update
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )

}