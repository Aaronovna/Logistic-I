import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';


const filterOrdersByStatuses = (orders, statuses) => {
  return orders.filter(order => statuses.includes(order?.status));
};

const options = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
  hour12: true, // Use 12-hour format
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // User's local timezone
};

export default function Dispatch_History({ auth }) {
  const { theme } = useStateContext();
  const [history, setHistory] = useState([]);

  const [receivedShipment, setReceivedShipment] = useState();
  const fetchReceivedShipment = async () => {
    try {
      const response = await axios.get('/receipt/get');
      setReceivedShipment(response.data);
    } catch (error) {
      console.error('error');
    }
  };

  useEffect(() => {
    fetchReceivedShipment();
  }, [])

  useEffect(() => {
    if (receivedShipment) {
      setHistory(filterOrdersByStatuses(receivedShipment, ['Success', 'Return']));
    }
  }, [receivedShipment])

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Dispatch History" />
      <DefaultLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>{`Dispatch > History`}</h2>}>
        <div className="content">
          {
            history?.map((data, index) => {
              return (
                <p key={index}>{`${data.id} ${new Date(data.order_date + 'Z').toLocaleString('en-PH', options)} ${data.supplier_id} ${data.status}`}</p>
              )
            })
          }
        </div>
      </DefaultLayout>
    </AuthenticatedLayout>
  );
}
