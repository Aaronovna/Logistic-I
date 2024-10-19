import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Depot_Inventory({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>{`Depot > Maintenance`}</h2>}
    >
      <Head title="Depot Maintenance" />

      <div className="content">
          <p>Manage Maintenance</p>
      </div>
    </AuthenticatedLayout>
  );
}
