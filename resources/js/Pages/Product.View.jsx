import useRole from '@/hooks/useRole';
import { usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { TbSparkles } from 'react-icons/tb';
import useGemini from '@/hooks/useGemini';
import { product_intruction } from '@/Constants/instructions';
import { useConfirmation } from '@/context/confirmationProvider';

import IMAGE_PLACEHOLDER from "../../../public/assets/images/image-placeholder.png"

export default function Product_View({ auth }) {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);
  const { prompt, promptBuilder, loading } = useGemini();
  const { confirm } = useConfirmation();

  const { props } = usePage();
  const { id } = props;

  const handleClick1 = () => {
    router.get('/product');
  };

  const handleClick2 = (id) => {
    router.get('/product/view', { id: id });
  };

  const [product, setProduct] = useState();

  const fetchProduct = async (id) => {
    try {
      const response = await axios.get(`/product/get/${id}`);
      setProduct(response.data.data);
    } catch (error) {
      handleClick1();
    }
  };

  const [turnover, setTurnover] = useState();
  const [critical, setCritical] = useState();
  const [reorder, setReorder] = useState();

  const fetchProductStats = async () => {
    try {
      const response = await axios.get(`/inventory/critical/${id}`);
      setCritical(response.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get(`/inventory/reorder/${id}`);
      setReorder(response.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get(`/inventory/turnover/${id}/90`);
      setTurnover(response.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [response, setResponse] = useState('');
  const generateReport = () => {
    if (!response) {
      prompt(promptBuilder('Product', product, product_intruction), setResponse);
    }
  }

  useEffect(() => {
    fetchProduct(id);
    fetchProductStats();
  }, []);

  useEffect(() => {
    if (product) {
      generateReport();
    }
  }, [product]);

  const handleDeleteProduct = async (id) => {
    try {
      const response = await axios.delete(`/product/delete/${id}}`);
      toast.success(response.data.message);
      fetchProducts();
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="View Product" />
      <Layout user={auth.user}
        header={<BreadCrumbsHeader
          headerNames={["Product", "View"]}
          onClickHandlers={[
            () => handleClick1(),
            () => handleClick2(id)
          ]} />}
      >
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content text-text">
            <div className='flex gap-4'>
              <div className='overflow-hidden w-96 border-card'>
                <img src={product?.image_url || IMAGE_PLACEHOLDER} alt={product?.name} className='object-cover' />
              </div>

              <div className='flex flex-col flex-1'>
                <p className='border-card text-xl font-medium mb-4'>{product?.name} <span className='text-neutral font-medium'>{product?.id}</span></p>
                <div className='flex gap-20'>
                  <div className='flex-1'>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Price</span> {product?.price}</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Model</span> {product?.model}</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Brand</span> {product?.brand}</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Auto Replenish</span> {product?.auto_replenish ? 'True' : 'False'}</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Perishable</span>{`${product?.perishable ? 'True' : 'False'} ${product?.perishable ? `(${product?.shelf_life} days)` : ''}`}</p>
                  </div>
                  <div className='flex-1'>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Stocks</span> {product?.total_stock}</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' title='manual (auto)'><span className='text-neutral'>Restock Point</span> {product?.restock_point} ({reorder?.reorder_point})</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Turnover Rate</span> {turnover?.turnover_category} ({turnover?.inventory_turnover.toFixed(2)})</p>
                    <p className='font-medium mb-1 p-2 rounded-md flex justify-between pr-4' ><span className='text-neutral'>Critical Level</span> {critical?.critical_level}</p>
                    <p className='font-medium p-2 rounded-md flex justify-between pr-4' title='AI (simple)'>
                      <span className='text-neutral flex'>Safe Stock Level<TbSparkles className='mr-2 text-orange-300' /></span>
                      ({reorder?.safety_stock})
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-4 h-10 flex items-end'>
              {
                tabs.map((tab, index) => {
                  return (
                    <button className={`px-4 rounded-t-md border-t font-medium border-x ${activeTab === tab ? 'bg-accent py-1 text-background' : 'bg-hbg'}`}
                      key={index} onClick={() => setActiveTab(tab)}
                    >{tab}</button>
                  )
                })
              }
            </div>

            <div className='border-card rounded-tl-none h-96'>
              <p className='text-xl font-medium mb-4'>{product?.category_name} <span className='text-neutral font-medium'>{product?.supplier_name}</span></p>
              {activeTab === 'Description' &&
                <div>
                  <p>{product?.description}</p>
                </div>
              }

              {activeTab === 'Report' &&
                <div>
                  <p>{response}</p>
                </div>
              }
            </div>

            <div className='mt-2'>
              <button className='btn bg-red-300 hover:bg-red-600' onClick={()=>confirm(cm_delete, ()=>handleDeleteProduct(id))}>Delete Product</button>
            </div>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

const tabs = ['Description', 'Report'];
const cm_delete = `Are you sure you want to delete this product entry?`;