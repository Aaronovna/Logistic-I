import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';
import { gradients } from "@/Constants/themes";
import AuditTaskCard from '@/Components/cards/AuditTaskCard';

export default function Audits({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Audits</h2>}
    >
      <Head title="Audits" />

      <div className="content">
        <div className='relative rounded-xl p-4 flex h-44 overflow-hidden shadow-xl' style={{ background: gradients.evening_night }}>
          <div className='absolute audit w-44 scale-125 top-4 right-10 h-full bg-no-repeat'></div>
          <div className='flex flex-col'>
            <p className='font-semibold text-3xl text-white tracking-wider'>Audit Board</p>
            <p className='font-medium text-2xl text-white mt-auto'>12 needs an audit</p>
          </div>
        </div>

        <div className='mt-8 border-card p-4'>
          <div className='flex w-full justify-between mb-4'>
            <p className='font-medium text-3xl' style={{ color: theme.text }}>Task</p>
            <button className='font-medium border-card' style={{background: theme.accent, color: theme.background, borderColor: theme.border }}>Create Task</button>
          </div>
          <div className='grid gap-4 grid-cols-2'>
            <AuditTaskCard />
            <AuditTaskCard />
            <AuditTaskCard />
            <AuditTaskCard />
            <AuditTaskCard />
            <AuditTaskCard />
            <AuditTaskCard />
          </div>
        </div>
        
      </div>
    </AuthenticatedLayout>
  );
}
