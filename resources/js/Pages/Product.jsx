import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { TbTruck } from "react-icons/tb";

export default function Product({ auth, suppliers }) {
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-medium text-3xl text-[#004369]">Product</h2>}
    >
      <Head title="Product" />

      <div className="m-4">
        <div className='flex gap-4'>
          <div className='shadow-lg rounded-lg p-2 w-40 h-44'>
            <p>Suppliers</p>
            {suppliers.length}
          </div>
          <div className='shadow-lg rounded-lg p-2 w-40 h-44'>
            <p>Products</p>
            <p>12</p>
          </div>
          <div className='shadow-lg rounded-lg p-2 w-40 h-44'>
            <p>Products</p>
            <p>12</p>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
