import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { Head } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';
import useRole from '@/hooks/useRole';

export default function Edit({ auth, mustVerifyEmail, status }) {
  const { theme } = useStateContext();
  const { getLayout } = useRole();
  
  const Layout = getLayout(auth.user.type);

  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Profile" />

      <Layout user={auth.user} header={<h2 className="font-medium md:text-3xl text-xl" style={{ color: theme.text }}>Profile</h2>}>
        <div className="py-8">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
            <div className="p-4 sm:p-8 shadow sm:rounded-lg border-card" style={{ borderColor: theme.border }}>
              <UpdateProfileInformationForm
                mustVerifyEmail={mustVerifyEmail}
                status={status}
                className="max-w-xl"
              />
            </div>

            <div className="p-4 sm:p-8 shadow sm:rounded-lg border-card" style={{ borderColor: theme.border }}>
              <UpdatePasswordForm className="max-w-xl" />
            </div>

            <div className="p-4 sm:p-8 shadow sm:rounded-lg border-card" style={{ borderColor: theme.border }}>
              <DeleteUserForm className="max-w-xl" />
            </div>
          </div>
        </div>
      </Layout>
    </AuthenticatedLayout>
  );
}
