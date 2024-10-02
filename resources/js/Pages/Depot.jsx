import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Depot({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Depot</h2>}
    >
      <Head title="Receipt" />

      <div className="content">
          
      </div>
    </AuthenticatedLayout>
  );
}
