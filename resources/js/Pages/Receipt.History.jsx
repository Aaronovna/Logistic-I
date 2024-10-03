import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Receipt_History({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>{`Receipt > History`}</h2>}
    >
      <Head title="Receipt History" />

      <div className="content">
          <p>asddsa</p>
      </div>
    </AuthenticatedLayout>
  );
}
