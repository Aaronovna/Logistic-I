import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Card2 } from '@/Components/Cards';

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import AuditReportCard from '@/Components/cards/AuditReportCard';
import { useStateContext } from '@/context/contextProvider';
const cardStyle = 'mb-2 snap-center mx-2 md:min-w-64 inline-block min-w-[100%]';
import AuditorLayout from '@/Layouts/AuditorLayout';

const auditorDummy = [
  {
    id: 1000,
    task: 7,
    name: 'Johnny Bravo',
    email: 'johnny.bravo@example.net',
  },
  {
    id: 2000,
    task: 4,
    name: 'Danny Phantom',
    email: 'danny.phantom@example.net',
  }
]

export default function Auditors({ auth }) {
  const { theme, themePreference } = useStateContext();

  const auditorColDefs = [
    { field: "id", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "task", filter: true, flex: 1, minWidth: 70, maxWidth: 90, },
    { field: "name", filter: true, flex: 2, minWidth: 200 },
    { field: "email", filter: true, flex: 2, minWidth: 200 },
  ];
  return (
    <AuthenticatedLayout
      user={auth.user}
    >
      <Head title="Auditors" />
      <AuditorLayout user={auth.user} header={<h2 className="header" style={{ color: theme.text }}>Auditors</h2>}>
        <div className="content">
          <div>
            <Card2 className={cardStyle} name='Auditors' data={38} />
            <Card2 className={cardStyle} name='Task' data={12} />
            <Card2 className={cardStyle} name='Reports' data={10} />
          </div>

          <div className='px-2'>
            <div className='flex justify-end'>
              <button className='font-medium border-card mr-2' style={{background: theme.accent, color: theme.background, borderColor: theme.border }}>Manage Auditors</button>
              <button className='font-medium border-card' style={{background: theme.accent, color: theme.background, borderColor: theme.border }}>View Reports</button>
            </div>
            <div className='flex gap-4'>
              <div className='w-1/2'>
              <p className='font-semibold text-xl mb-2'>Auditors</p>
                <div className={`h-[420px] ${themePreference === 'light' ? 'ag-theme-quartz ' : 'ag-theme-quartz-dark'}`}>
                  <AgGridReact
                    rowData={auditorDummy}
                    columnDefs={auditorColDefs}
                    rowSelection='single'
                  /* onGridReady={onGridReady}
                  onSelectionChanged={onUserSelectionChanged} */
                  />
                </div>
              </div>

              <div className='w-1/2'>
                <p className='font-semibold text-xl mb-2'>Recent Reports</p>
                <div className='flex flex-col gap-2 pr-2 h-[420px] overflow-y-auto'>
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                  <AuditReportCard />
                </div>
              </div>

            </div>
          </div>
        </div>
      </AuditorLayout>
    </AuthenticatedLayout>
  );
}
