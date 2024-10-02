import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Dispatch({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Dispatch</h2>}
    >
      <Head title="Receipt" />

      <div className="content">
          
      </div>
    </AuthenticatedLayout>
  );
}
