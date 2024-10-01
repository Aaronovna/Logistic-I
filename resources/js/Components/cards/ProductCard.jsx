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
      className={`p-2 flex mb-2 border rounded-lg overflow-hidden ` + className}
    >
      <div className="flex flex-col w-full">
        <div className="flex cursor-pointer" onClick={() => setflip(!flip)}>
          <div style={{ outlineColor: theme.border, background: `url(${product_image_placeholder})`, backgroundSize: '100%' }}
            className='w-24 h-24 aspect-square outline outline-1 rounded-md inline-block overflow-hidden'
          >
            <img
              src={product.image_url || `https://picsum.photos/seed/${product.id}/200/200`}
              /* src={product.image_url} */
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
        <div className="flex">
          <span className='inline-block mr-8'>
            <p className='text-gray-400'>Stock</p>
            <p className='text-xl font-semibold inline' style={{ color: product.low_on_stock ? theme.danger : theme.text }}>{product.stock}</p>
            {product.low_on_stock
              ? <p className="inline ml-1 text-xs" style={{ color: product.low_on_stock ? theme.danger : theme.text }}>{product.stock === 0 ? 'out of stock' : 'low'}</p>
              : null
            }
          </span>
          <span className='inline-block ml-auto mr-10'>
            <p className='text-gray-400'>Buying Price</p>
            <p className='text-xl font-semibold'>{product.price}</p>
          </span>
        </div>
      </div>

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