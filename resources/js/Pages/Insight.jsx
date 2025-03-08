import useRole from '@/hooks/useRole';
import useGemini from '@/hooks/useGemini';
import { useState, useEffect } from 'react';
import Chart from '@/Components/Chart';
import { LPI_I, TPI_I } from '@/Constants/instructions';

const Insight = ({ auth }) => {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);
  const { prompt, promptBuilder, loading } = useGemini();

  const pieSeriesTop = [{
    type: 'donut',
    angleKey: 'total_stock',
    calloutLabelKey: 'name',
    innerRadiusRatio: 0.7,
  }];

  const [categories, setCategories] = useState();
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category/get');
      setCategories(response.data.data)
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [topProdInCat, setTopProdInCat] = useState();
  const [topProdInCat2, setTopProdInCat2] = useState();
  const fetchTopProductInCategory = async (cat_id = 1000) => {
    try {
      const response = await axios.get(`/inventory/top/products/${cat_id}`);
      setTopProdInCat(response.data.data);
      setTopProdInCat2(response.data);
    } catch (error) {

    }
  }
  const onCatChange = (e) => {
    fetchTopProductInCategory(e.target.value);
  }

  const [topProdInsight, setTopProdInsight] = useState();

  const generateInsight = () => {
    prompt(promptBuilder('Top Product in Category Insight', topProdInCat2, TPI_I), setTopProdInsight);
  }
  useEffect(() => {
    if (topProdInCat2) {
      generateInsight();
    }
  }, [topProdInCat2]);

  const [lowProducts, setLowProducts] = useState();
  const fetchLow = async () => {
    try {
      const response = await axios.get('/inventory/low/stock/5');
      setLowProducts(response.data.data);
    } catch (error) {
    }
  }

  const [lowProdInsight, setLowProdInsight] = useState();
  const [selectedLow, setSelectedLow] = useState();
  const generateLowInsight = () => {
    prompt(promptBuilder('Low on Stock Insight', selectedLow, LPI_I), setLowProdInsight);
  }
  useEffect(() => {
    if (selectedLow) {
      generateLowInsight();
    }
  }, [selectedLow]);

  useEffect(() => {
    fetchCategories();
    fetchTopProductInCategory();
    fetchLow();
  }, []);
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Insight" />

      <Layout user={auth.user} header={<NavHeader headerName="Insight" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className='content text-text pb-20'>
            <div className='flex gap-4 g2 rounded-3xl overflow-hidden shadow-xl'>
              <div className='w-1/2 text-text flex flex-col'>
                <Chart data={topProdInCat} series={pieSeriesTop} legendPosition='right' title='Top Products' className='h-3/4' />
                <select name="cat" id="cat" className='border-none py-2 px-4 mx-2 mt-auto mb-4 z-10 bg-background' onChange={onCatChange}>
                  {
                    categories && categories.map((cat, index) => <option key={index} value={cat.id} className='text-sm'>{cat.name}</option>)
                  }
                </select>
              </div>
              <div className={`p-4 w-1/2 overflow-y-auto`}>
                <p className={`text-justify`}>{topProdInsight}</p>
              </div>
            </div>

            <div className='flex gap-4 border rounded-3xl bg-background text-text w-full mt-8 overflow-hidden g3'>
              <div className='w-1/2'>
                <p className='text-center my-2 '>Low on Stock</p>
                <div className='overflow-y-auto h-64 px-2'>
                  {
                    lowProducts && lowProducts.map((product, index) => {
                      return (
                        <div className='p-1 flex hover:bg-hbg rounded-full select-none cursor-pointer' key={index} onClick={() => setSelectedLow(product)}>
                          <img src={product.image_url || 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png'}
                            alt={product.name} className='w-16 h-16 rounded-full border p-1'
                          />
                          <div className='ml-4 text-sm'>
                            <p className='font-medium text-base truncate'>{product.name} <span className='text-neutral text-xs'>{product.model}</span></p>
                            <p className='text-neutral'>Stock Left <span className='text-text font-semibold'>{product.quantity}</span></p>
                            <div className='flex gap-2'>
                              <p className='text-neutral'>Restock Point <span className='text-text font-semibold'>{product.restock_point}</span></p>
                              <p className='text-neutral'>Price <span className='text-text font-semibold'>{product.price}</span></p>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              <div className='w-1/2 p-4 overflow-y-auto'>
                <p className='font-semibold mb-2'>{selectedLow?.name} <span className='text-neutral'>{selectedLow?.model}</span></p>
                <p className='text-justify'>{lowProdInsight}</p>
              </div>
            </div>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Insight;