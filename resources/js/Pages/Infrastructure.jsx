import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';

export default function Infrastructure({ auth }) {
    const { theme } = useStateContext();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="header" style={{ color: theme.text }}>Infrastructure</h2>}
        >
            <Head title="Infrastructure" />

            <div className="content">

            </div>
        </AuthenticatedLayout>
    );
}
