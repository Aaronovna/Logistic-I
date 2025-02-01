import { useState, useEffect } from 'react';
import { useStateContext } from '@/context/contextProvider';

import InventoryLayout from '@/Layouts/InventoryLayout';

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

const DispatchHistory = ({ auth }) => {
  if (!hasAccess(auth.user.type, [2050, 2051, 2052])) {
    return (
      <Unauthorized />
    )
  }

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
      <InventoryLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>{`Dispatch > History`}</h2>}>
        <div className="content">
          {
            history?.map((data, index) => {
              return (
                <p key={index}>{`${data.id} ${new Date(data.order_date + 'Z').toLocaleString('en-PH', options)} ${data.supplier_id} ${data.status}`}</p>
              )
            })
          }
        </div>
      </InventoryLayout>
    </AuthenticatedLayout>
  );
}

export default DispatchHistory;