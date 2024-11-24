import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

import { useStateContext } from '@/context/contextProvider';

export default function Login({ status, canResetPassword }) {
  const { theme } = useStateContext();
  const { data, setData, post, processing, errors, reset } = useForm({
    email: 'ashleigh.koepp@example.net',
    password: 'password',
    remember: false,
  });

  const submit = (e) => {
    e.preventDefault();

    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div className='h-screen flex md:flex-row flex-col' style={{ background: theme.background, color: theme.accent }}>
      <Head title="Log in" />
      <div className='lg:w-3/5 h-screen py-1p lg:block hidden'>
        <div className='bus-bg bg-cover w-full h-full rounded-r-3xl'></div>
      </div>
      <div className='flex flex-col py-4 md:1/2 lg:w-2/5 w-full items-center'>

        <p className='font-bold lg:text-4xl text-2xl w-full text-center'>Bus Transportation Management System</p>
        <p className='font-semibold lg:text-3xl text-xl text-center mt-10'>Logistic I</p>

        <form onSubmit={submit}
          className='xl:w-4/6 lg:w-5/6 sm:w-2/3 py-4 rounded-3xl shadow-lg shad mt-10 flex flex-col items-center border'
          style={{ background: theme.background, color: theme.accent, borderColor: theme.border }}
        >
          <p className='text-center mb-4 text-xl'>Sign In</p>
          <hr className='border w-full' style={{ borderColor: theme.accent }} />
          <div className='mt-8 w-4/5'>
            <input
              id="email"
              type="email"
              name="email"
              value={data.email}
              className="mt-1 block w-full bg-transparent rounded-md p-2"
              style={{ borderColor: theme.border }}
              autoComplete="username"
              onChange={(e) => setData('email', e.target.value)}
              placeholder="Email"
            />

            <InputError message={errors.email} className="mt-2" />
          </div>

          <div className="mt-4 w-4/5">
            <input
              id="password"
              type="password"
              name="password"
              value={data.password}
              className="mt-1 block w-full bg-transparent rounded-md p-2"
              style={{ borderColor: theme.border }}
              autoComplete="current-password"
              onChange={(e) => setData('password', e.target.value)}
              placeholder="Password"
            />

            <InputError message={errors.password} className="mt-2" />
          </div>

          <div className="w-4/5 flex justify-between mt-4 lg:mb-12 mb-12">
            <label className="flex items-center">
              <Checkbox
                name="remember"
                checked={data.remember}
                onChange={(e) => setData('remember', e.target.checked)}
              />
              <span className="ms-2 text-sm">Remember me</span>
            </label>

            {canResetPassword && (
              <Link
                href={route('password.request')}
                className="text-sm hover:text-gray-300 rounded-md"
              >
                Forgot your password?
              </Link>
            )}
          </div>

          <div className="flex items-center mt-4 mb-8 w-4/5">
            <button className="w-full font-medium p-2 rounded-md border" style={{ background: theme.accent, color: theme.background, borderColor: theme.border }}>
              <p>Log In</p>
            </button>
          </div>
          {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
        </form>
      </div>
    </div>
  );
}
