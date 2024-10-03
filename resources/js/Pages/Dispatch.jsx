import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

import { Card2 } from '@/Components/Cards';
import RequestsFolder from '@/Components/cards/RequestsFolder';
import Request from '@/Components/cards/Request';

export default function Dispatch({ auth }) {
  const { theme } = useStateContext();
  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="header" style={{ color: theme.text }}>Dispatch</h2>}
    >
      <Head title="Dispatch" />

      <div className="content">
          <div className='flex gap-4'>
            <Card2 name='Total Requests' />
            <Card2 name='Total Deliveries' />
          </div>

          <p className='font-medium text-2xl mt-8 mb-4' style={{color: theme.text}}>Requests</p>
          <div className='grid gap-4 grid-cols-3'>
            <RequestsFolder data={dummyRequest} name='Depot'/>
            <RequestsFolder data={dummyRequest} name='Terminal'/>
            <RequestsFolder data={dummyRequest} name='Office'/>
            <RequestsFolder data={dummyRequest} name='Maintenance'/>
            <RequestsFolder data={dummyRequest} name='Other'/>
          </div>

          <div className='mt-8 grid gap-4 grid-cols-2'>
            {dummyRequest.map((request, index)=> {
              return (
                <Request data={request} key={index} />
              )
            })}
          </div>
      </div>
    </AuthenticatedLayout>
  );
}

const dummyRequest = [
  {
    name: 'Dummy Request 1',
    date: '10-02-24',
    requested: [
      {name: 'Goods 1'},
      {name: 'Goods 2'},
      {name: 'Goods 3'},
    ],
  },
  {
    name: 'Dummy Request 2',
    date: '10-02-24',
    requested: [
      {name: 'Goods 1'},
      {name: 'Goods 2'},
      {name: 'Goods 3'},
    ],
  },
  {
    name: 'Dummy Request 3',
    date: '10-02-24',
    requested: [
      {name: 'Goods 1'},
      {name: 'Goods 2'},
      {name: 'Goods 3'},
    ],
  },
  {
    name: 'Dummy Request 4',
    date: '10-02-24',
    requested: [
      {name: 'Goods 1'},
      {name: 'Goods 2'},
      {name: 'Goods 3'},
    ],
  },
  {
    name: 'Dummy Request 5',
    date: '10-02-24',
    requested: [
      {name: 'Goods 1'},
      {name: 'Goods 2'},
      {name: 'Goods 3'},
    ],
  },
]