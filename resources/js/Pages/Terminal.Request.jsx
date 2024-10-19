import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Terminal_Request({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>{`Terminal > Request`}</h2>}
    >
      <Head title="Terminal Request" />

      <div className="content">
          <p>Manage Request</p>
      </div>
    </AuthenticatedLayout>
  );
}
