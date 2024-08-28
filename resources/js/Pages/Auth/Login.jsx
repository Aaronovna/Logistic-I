import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className='flex'>
            <Head title="Log in" />
            <div className='w-1/2 h-screen py-1p'>
                <div className='bus-bg w-full h-full'></div>
            </div>
            {/* <img src="../../assets/images/bus-background-croped.png" alt="Background" className='w-1/2 h-screen py-1p'/> */}
            <div className='py-4 flex flex-col items-center w-1/2'>

                <div>
                    <p className='font-bold text-5xl w-full text-center mt-4 text-[#004369]'>BUS TRANSPORTATION</p>
                    <p className='font-bold text-5xl w-full text-center mt-4 text-[#004369]'>MANAGEMENT SYSTEM</p>
                </div>
                <p className='font-semibold text-3xl text-center mt-10 text-[#004369]'>Logistic I</p>

                <form onSubmit={submit} className='w-4/6 py-4 rounded-3xl shadow-lg shad mt-9 flex flex-col items-center'>
                    <p className='text-center mb-4 text-[#004369] text-xl'>Sign In</p>
                    <hr className='border-[#004369] w-full' />
                    <div className='mt-8 w-4/5'>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full placeholder:text-[#005F94]"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="Email"
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="mt-4 w-4/5">
                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full placeholder:text-[#005F94] "
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="w-4/5 flex justify-between mt-4 mb-24">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-[#004369]">Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm text-[#004369] hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Forgot your password?
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center mt-4 mb-8 w-4/5">
                        <button className="w-full bg-[#004369] text-white p-2 rounded-lg">
                            <p>Log In</p>
                        </button>
                    </div>
                    {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}
                </form>
            </div>
        </div>
    );
}
