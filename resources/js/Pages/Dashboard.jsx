import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Chart from '@/Components/Chart';

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
      const response = await axios.get('/product/get/stats');
      setProductStats(response.data);
    } catch (error) {
      toast.error('product stat error', error);
    }
  };

  useEffect(() => {
    fetchProductStats();
  }, []);

  useEffect(() => {
    console.log(productStats);
  }, [productStats]);

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

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Dashboard</h2>}
    >
      <Head title="Dashboard" />

      <div className="content">
        <div className='flex gap-4'>
          <Chart data={productStats?.productsByCategory} series={pieSeries} legendPosition='right' title='Product Stock' />
          <Chart data={productStats.productsBySupplier && getTop5(productStats?.productsBySupplier)} series={barSeries} legendPosition='right' title='Supplier Distribution' />
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
