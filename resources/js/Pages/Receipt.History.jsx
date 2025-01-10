import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';


const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

export default function Receipt_History({ auth }) {
  const { theme, ordersDummyData } = useStateContext();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(filterOrdersByStatuses(ordersDummyData, ['Accepted', 'Rejected']));
  }, [ordersDummyData])
  
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>{`Receipt > History`}</h2>}
    >
      <Head title="Receipt History" />

      <div className="content">
        {
          history?.map((data, index) => {
            return (
              <p key={index}>{`${data.id} ${data.supplier} ${data.status}`}</p>
            )
          })
        }
      </div>
    </AuthenticatedLayout>
  );
}
