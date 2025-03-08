import useRole from '@/hooks/useRole';
import useGemini from '@/hooks/useGemini';
import { useState, useEffect } from 'react';
import Chart from '@/Components/Chart';
import { TPI_I } from '@/Constants/instructions';

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
  useEffect(() => {
    fetchCategories();
    fetchTopProductInCategory();
  }, []);

  const [topProdInsight, setTopProdInsight] = useState();

  const generateInsight = () => {
    prompt(promptBuilder('Top Product in Category Insight', topProdInCat2, TPI_I), setTopProdInsight);
  }
  useEffect(() => {
    if (topProdInCat2) {
      generateInsight();
    }
  }, [topProdInCat2]);
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Insight" />

      <Layout user={auth.user} header={<NavHeader headerName="Insight" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className='content text-text'>
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
                <p className={`text-justify ${loading ? 'blur-sm': null}`}>{topProdInsight}</p>
              </div>
            </div>
          </div>
        }
      </Layout>
    </AuthenticatedLayout>
  );
}

export default Insight;