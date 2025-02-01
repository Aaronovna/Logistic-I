import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Chart from '@/Components/Chart';
import { generateRandomNumber } from '@/functions/numberGenerator';
import DefaultLayout from '@/Layouts/InventoryLayout';
import toast from 'react-hot-toast';

import { useStateContext } from '@/context/contextProvider';

function getTop5(data) {
  return data
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
}

export default function Dashboard({ auth }) {
  const { theme } = useStateContext();
  const [productStats, setProductStats] = useState({});

  const fetchProductStats = async () => {
    try {
      const response = await axios.get('/product/stats');
      setProductStats(response.data);
    } catch (error) {
      toast.error('product stat error', error);
    }
  };

  useEffect(() => {
    fetchProductStats();
  }, []);

  const pieSeries = [{
    type: 'pie',
    angleKey: 'total',
    legendItemKey: 'category_name',
  }];
  const barSeries = [
    {
      type: 'bar',
      xKey: 'supplier_name',
      yKey: 'total',
    }
  ];
  const lineSeries = [
    {
      type: "line",
      xKey: "quarter",
      yKey: "a",
      yName: "Bus Parts and Components"
    },
    {
      type: "line",
      xKey: "quarter",
      yKey: "b",
      yName: "Maintenance Supplies"
    },
    {
      type: "line",
      xKey: "quarter",
      yKey: "c",
      yName: "Operational Supplies"
    },
    {
      type: "line",
      xKey: "quarter",
      yKey: "d",
      yName: "Bus Accessories"
    },
    {
      type: "line",
      xKey: "quarter",
      yKey: "e",
      yName: "Documentation and Records"
    },
    {
      type: "line",
      xKey: "quarter",
      yKey: "f",
      yName: "Fuel and Fluids"
    },
    {
      type: "line",
      xKey: "quarter",
      yKey: "g",
      yName: "Packaging Materials"
    },
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Dashboard" />

      <DefaultLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Dashboard</h2>}>
        <div className="content">
          <div className='flex gap-4'>
            <Chart data={productStats?.productsByCategory} series={pieSeries} legendPosition='right' title='Product Stock' className='border-card w-1/2 shadow-md' />
            <Chart data={productStats?.productsBySupplier && getTop5(productStats?.productsBySupplier)} series={barSeries} legendPosition='right' title='Supplier Distribution' className='border-card w-1/2 shadow-md' />
          </div>

          <div className='mt-4 flex gap-4 h-80'>
            <Chart data={data} series={lineSeries} title='Stock Levels' className='border-card w-3/4 shadow-md' />
            <div className='border-card shadow-md w-1/4 h-80' style={{ background: theme.background, borderColor: theme.border }}>
              <p className='text-center my-2'>Out of Stock</p>
              <div className='overflow-y-auto h-60'>
                {
                  productStats?.outOfStockProducts?.map((product, index) => {
                    return (
                      <div className='p-1' key={index}>
                        <div className='mb-2 py-2'>
                          <p className='font-semibold text-lg'>{`${product.name} ${product.model}`}</p>
                        </div>
                        <hr />
                      </div>
                    )
                  })
                }
              </div>
            </div>
          </div>

          <div>
            <div className='flex gap-2'>
              <div className='border-card shadow-md mt-4 w-1/2' style={{ background: theme.background, borderColor: theme.border }}>
                <p className='text-center my-4'>Low on Stock</p>
                <div className='overflow-y-auto h-80'>
                  {
                    productStats?.lowStockProducts?.map((product, index) => {
                      return (
                        <div className='p-1' key={index}>
                          <div className='mb-2 py-2'>
                            <p className='font-semibold text-lg'>{`${product.name} ${product.model}`}</p>
                            <span className='flex justify-between'>
                              <p>restock point <span className='font-semibold'>{product.restock_point}</span></p>
                              <p>stock <span className='font-semibold'>{product.stock}</span></p>
                            </span>
                          </div>
                          <hr />
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </DefaultLayout>

    </AuthenticatedLayout>
  );
}

const data = [
  {
    quarter: "Q1",
    a: generateRandomNumber(3),
    b: generateRandomNumber(3),
    c: generateRandomNumber(3),
    d: generateRandomNumber(3),
    e: generateRandomNumber(3),
    f: generateRandomNumber(3),
    g: generateRandomNumber(3),
  },
  {
    quarter: "Q2",
    a: generateRandomNumber(3),
    b: generateRandomNumber(3),
    c: generateRandomNumber(3),
    d: generateRandomNumber(3),
    e: generateRandomNumber(3),
    f: generateRandomNumber(3),
    g: generateRandomNumber(3),
  },
  {
    quarter: "Q3",
    a: generateRandomNumber(3),
    b: generateRandomNumber(3),
    c: generateRandomNumber(3),
    d: generateRandomNumber(3),
    e: generateRandomNumber(3),
    f: generateRandomNumber(3),
    g: generateRandomNumber(3),
  },
  {
    quarter: "Q4",
    a: generateRandomNumber(3),
    b: generateRandomNumber(3),
    c: generateRandomNumber(3),
    d: generateRandomNumber(3),
    e: generateRandomNumber(3),
    f: generateRandomNumber(3),
    g: generateRandomNumber(3),
  },
];