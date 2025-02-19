import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';

export default function Report({ auth }) {
    const { theme } = useStateContext();
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="header" style={{ color: theme.text }}>Report</h2>}
        >
            <Head title="Report" />

            <div className="content">

            </div>
        </AuthenticatedLayout>
    );
}