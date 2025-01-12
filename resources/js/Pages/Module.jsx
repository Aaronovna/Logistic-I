import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';

export default function Module({ auth }) {
    const { theme } = useStateContext();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="header" style={{ color: theme.text }}>Module</h2>}
        >
            <Head title="Module" />

            <div className="content">

            </div>
        </AuthenticatedLayout>
    );
}
