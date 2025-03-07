import { useState, useEffect } from 'react';

import Chart from '@/Components/Chart';
import useRole from '@/hooks/useRole';

function getTop(count = 5, data) {
  return data
    .sort((a, b) => b.total - a.total)
    .slice(0, count);
}

export default function Dashboard({ auth }) {
  const { hasAccess, getLayout } = useRole();
  const Layout = getLayout(auth.user.type);

  const [productEachCategory, setProductEachCategory] = useState();
  const [productEachSupplier, setProductEachSupplier] = useState();
  const [lowProducts, setLowProducts] = useState();
  const [outProducts, setOutProducts] = useState();

  const [leastExp, setLeastExp] = useState();
  const [mostExp, setMostExp] = useState();
  const [assetValue, setAssetValue] = useState();

  const [recentProducts, setRecentProducts] = useState();

  const [stockCountPerPeriod, setStockCountPerPeriod] = useState();

  const fetchStats = async () => {
    try {
      const response = await axios.get('/products/category');
      const processedData = response.data.data.map(category => ({
        category_name: category.category_name,
        product_count: category.products.length, // Correct numeric field
      }));

      setProductEachCategory(processedData);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/products/supplier');
      setProductEachSupplier(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/inventory/low/stock/5');
      setLowProducts(response.data.data);
    } catch (error) {
    }

    try {
      const response = await axios.get('/inventory/out/stock/5');
      setOutProducts(response.data.data);
    } catch (error) {
    }

    try {
      const response = await axios.get('/products/most/2');
      setMostExp(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/products/least/2');
      setLeastExp(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }

    try {
      const response = await axios.get('/inventory/total/value');
      setAssetValue(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }



    try {
      const response = await axios.get('/products/recent/2');
      setRecentProducts(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const [categories, setCategories] = useState();
  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category/get');
      setCategories(response.data.data)
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  }

  const pieSeriesTop = [{
    type: 'donut',
    angleKey: 'total_stock',
    calloutLabelKey: 'name',
    innerRadiusRatio: 0.7,
  }];
  const pieSeries = [{
    type: 'pie',
    angleKey: 'product_count',
    legendItemKey: 'category_name',
  }];
  const barSeries = [
    {
      type: 'bar',
      xKey: 'supplier_name',
      yKey: 'products.length',
      yName: 'Products'
    }
  ];

  const [productExpSwitch, setProductExpSwitch] = useState(true);

  const [availableDate, setAvailableDate] = useState([]);
  const fetchAvailableDate = async () => {
    try {
      const response = await axios.get('/inventory/years');
      setAvailableDate(response.data.data);
    } catch (error) {
      toast.error(`${error.status} ${error.response.data.message}`);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchAvailableDate();
    fetchLineData();
  }, []);

  const [lineSeries, setLineSeries] = useState();

  const periods = [
    'year',
    'quarter',
    'month',
  ];

  const fetchLineData = async (period = 'year', year = new Date().getFullYear()) => {
    try {
      const response = await axios.get(`/inventory/stock/${period}/${year}`);
      setStockCountPerPeriod(response.data.data);
    } catch (error) {
      toast.error(`${error.response?.status || 'Error'}: ${error.response?.data?.message || 'Failed to fetch data'}`);
    }
  };

  const [period, setPeriod] = useState('year');
  const onPeriodChange = async (e) => {
    setPeriod(e.target.value);
  }
  const [date, setDate] = useState(new Date().getFullYear());
  const onDateChange = async (e) => {
    setDate(e.target.value);
  }

  useEffect(() => {
    fetchLineData(period, date);
  }, [period, date]);
  useEffect(() => {
    if (categories) {
      setLineSeries(generateLineSeries(categories, period));
    }
  }, [categories, period]);

  const [topProdInCat, setTopProdInCat] = useState();
  const fetchTopProductInCategory = async (cat_id = 1000) => {
    try {
      const response = await axios.get(`/inventory/top/products/${cat_id}`);
      setTopProdInCat(response.data.data);
    } catch (error) {

    }
  }
  const onCatChange = (e) => {
    fetchTopProductInCategory(e.target.value);
  }
  useEffect(() => {
    fetchTopProductInCategory();
  }, []);

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Dashboard" />

      <Layout user={auth.user} header={<NavHeader headerName="Dashboard" />}>
        {!hasAccess(auth.user.type, [2050, 2051, 2052]) ? <Unauthorized /> :
          <div className="content">
            <div className='flex gap-4'>
              <Chart data={productEachCategory} series={pieSeries} legendPosition='right' title='Product Stock' className='w-1/2 border rounded-3xl bg-background' />
              <Chart data={productEachSupplier && getTop(8, productEachSupplier)} series={barSeries} legendPosition='right' title='Supplier Distribution' className='w-1/2 border rounded-3xl bg-background' />
            </div>

            <div className='mt-4 w-full border rounded-3xl bg-background pt-4 text-text'>
              <select name="availdate" id="availdate" className='border-none py-2 px-4 bg-background' onChange={onDateChange}>
                {
                  availableDate && availableDate.map((date, index) => <option value={date} key={index}>{date}</option>)
                }
              </select>
              <select name="period" id="period" className='border-none py-2 px-4 bg-background' onChange={onPeriodChange}>
                {
                  periods.map((period, index) => <option value={period} key={index}>{period}</option>)
                }
              </select>
              <Chart data={stockCountPerPeriod && stockCountPerPeriod} series={lineSeries} title='Stock Levels' className='' />
            </div>

            <div className='flex gap-4 h-80 mt-4'>
              <div className='w-2/3 flex flex-col gap-2'>
                <div className='flex gap-4'>
                  <div className='w-full border rounded-3xl bg-background text-text p-4 select-none cursor-pointer' onClick={() => setProductExpSwitch(!productExpSwitch)}>
                    {productExpSwitch ?
                      <>
                        <p className='font-bold tracking-widest text-3xl'>Most Expensive Products</p>
                        <div className='flex mt-4 gap-2'>
                          <div className='w-1/2 hover:bg-hbg rounded-3xl p-2'>
                            <p className='text-5xl quicksand truncate'>{mostExp && mostExp[0]?.name}</p>
                            <p className='text-3xl tracking-widest quicksand ml-auto w-fit'>{mostExp && mostExp[0]?.price}</p>
                          </div>
                          <div className='w-1/2 hover:bg-hbg rounded-3xl p-2'>
                            <p className='text-5xl quicksand truncate'>{mostExp && mostExp[1]?.name}</p>
                            <p className='text-3xl tracking-widest quicksand ml-auto w-fit'>{mostExp && mostExp[1]?.price}</p>
                          </div>
                        </div>
                      </> :
                      <>
                        <p className='font-bold tracking-widest text-3xl'>Least Expensive Products</p>
                        <div className='flex mt-4 gap-2'>
                          <div className='w-1/2 hover:bg-hbg rounded-3xl p-2'>
                            <p className='text-5xl quicksand truncate'>{leastExp && leastExp[0]?.name}</p>
                            <p className='text-3xl tracking-widest quicksand ml-auto w-fit'>{leastExp && leastExp[0]?.price}</p>
                          </div>
                          <div className='w-1/2 hover:bg-hbg rounded-3xl p-2'>
                            <p className='text-5xl quicksand truncate'>{leastExp && leastExp[1]?.name}</p>
                            <p className='text-3xl tracking-widest quicksand ml-auto w-fit'>{leastExp && leastExp[1]?.price}</p>
                          </div>
                        </div>
                      </>
                    }
                  </div>
                </div>

                <div className='border rounded-3xl bg-background text-text flex-1 p-4'>
                  <p className='font-bold tracking-widest text-3xl'>Total Asset Value</p>
                  <p className='text-4xl tracking-widest quicksand ml-auto w-fit mt-4'>{assetValue && formatValue(assetValue.total_stock_value)}</p>
                </div>
              </div>

              <div className='border rounded-3xl bg-background text-text w-1/3'>
                <p className='text-center my-2 '>Out of Stock</p>
                <div className='overflow-y-auto h-64'>
                  {
                    outProducts && outProducts.map((product, index) => {
                      return (
                        <div className='p-1 flex hover:bg-hbg rounded-full cursor-default select-none' key={index}>
                          <img src={product.image_url || 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png'}
                            alt={product.name} className='w-16 h-16 rounded-full border p-1'
                          />
                          <div className='ml-4 text-sm'>
                            <p className='font-medium text-base truncate'>{product.name} <span className='text-gray-500 text-xs'>{product.model}</span></p>
                            <p className='text-gray-500'>Restock Point <span className='text-text font-semibold'>{product.restock_point}</span></p>
                            <p className='text-gray-500'>Price <span className='text-text font-semibold'>{product.price}</span></p>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>

            <div className='flex gap-2 h-80 mt-4'>
              <div className='border rounded-3xl bg-background text-text w-1/3'>
                <p className='text-center my-2 '>Low on Stock</p>
                <div className='overflow-y-auto h-64'>
                  {
                    lowProducts && lowProducts.map((product, index) => {
                      return (
                        <div className='p-1 flex hover:bg-hbg rounded-full cursor-default select-none' key={index}>
                          <img src={product.image_url || 'https://psediting.websites.co.in/obaju-turquoise/img/product-placeholder.png'}
                            alt={product.name} className='w-16 h-16 rounded-full border p-1'
                          />
                          <div className='ml-4 text-sm'>
                            <p className='font-medium text-base truncate'>{product.name} <span className='text-gray-500 text-xs'>{product.model}</span></p>
                            <p className='text-gray-500'>Restock Point <span className='text-text font-semibold'>{product.restock_point}</span></p>
                            <p className='text-gray-500'>Price <span className='text-text font-semibold'>{product.price}</span></p>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              </div>
              <div className='w-1/2 border rounded-3xl bg-background text-text flex flex-col'>
                <Chart data={topProdInCat} series={pieSeriesTop} legendPosition='right' title='Top Products' className='h-3/4' />
                <select name="cat" id="cat" className='border-none py-2 px-4 bg-background mx-2 mt-auto mb-4 z-10' onChange={onCatChange}>
                  {
                    categories && categories.map((cat, index) => <option key={index} value={cat.id} className='text-sm'>{cat.name}</option>)
                  }
                </select>
              </div>

              <div className='w-2/3 flex gap-2'>

              </div>
            </div>
          </div>
        }
      </Layout>

    </AuthenticatedLayout>
  );
}

const formatValue = (value) => {
  if (value) {
    const formattedValue = new Intl.NumberFormat('fil-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);

    return formattedValue;
  }

  return 0;
}

function generateLineSeries(categories, period) {
  let xKey;

  switch (period) {
    case "month":
      xKey = "day";
      break;
    case "quarter":
      xKey = "quarter";
      break;
    case "year":
    default:
      xKey = "month";
      break;
  }

  return categories.map(category => ({
    type: "line",
    xKey: xKey,
    yKey: category.name, // Match category name from API response
    yName: category.name, // Display name for the chart legend
    interpolation: {
      type: 'smooth'
    },
    connectMissingData: true,
  }));
}