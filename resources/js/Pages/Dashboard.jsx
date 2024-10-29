import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import Chart from '@/Components/Chart';

import { useStateContext } from '@/context/contextProvider';

export default function Dashboard({ auth }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(null);
  const [totalProductPieChartData, setTotalProductPieChartData] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/product/get');
      setProducts(response.data);
    } catch (error) {
      toast.error(productToastMessages.show.error, error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/category/get/count');
      setCategories(response.data);
    } catch (error) {
      console.error(categoryToastMessages.show.error, error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const series = [{
    type: 'pie',
    angleKey: 'total_product_category_stock',
    legendItemKey: 'category_name',
  }];

  useEffect(() => {
    if (categories && products) {
      setTotalProductPieChartData(groupProductsByCategory(products, categories));
    }
  }, [products, categories, totalProductPieChartData]);

  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Dashboard</h2>}
    >
      <Head title="Dashboard" />

      <div className="content">
        <Chart data={totalProductPieChartData} series={series} legendPosition='right' title='Product Stock' />
      </div>
    </AuthenticatedLayout>
  );
}

function groupProductsByCategory(products, categories) {
  const categoryMap = new Map();

  products.forEach(product => {
    const category = categories.find(cat => cat.id === product.category_id);
    if (!category) return;

    const { id: categoryId, name: categoryName } = category;

    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, {
        category_name: categoryName,
        total_product_category_stock: 0,
        products: []
      });
    }

    const categoryData = categoryMap.get(categoryId);

    categoryData.total_product_category_stock += product.stock;

    categoryData.products.push({
      name: product.name,
      model: product.model,
      brand: product.brand,
      price: product.price
    });
  });

  return Array.from(categoryMap.values());
}