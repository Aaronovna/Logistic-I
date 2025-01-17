import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import { useStateContext } from '@/context/contextProvider';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;
    const { theme } = useStateContext();

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    const submit = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900" style={{ color: theme.text }}>Profile Information</h2>

                <p className="mt-1 text-sm text-gray-600" style={{ color: theme.text }}>
                    Update your account's profile information and email address.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="name" style={{ color: theme.text }}>Name</label>

                    <input
                        id="name"
                        className="mt-1 block w-full border-card"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />

                    <p className='text-sm text-red-600'>
                        {errors.name}
                    </p>
                </div>

                <div>
                    <label htmlFor="name" style={{ color: theme.text }}>Email</label>

                    <input
                        id="email"
                        type="email"
                        className="mt-1 block w-full border-card"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <p className='text-sm text-red-600'>
                        {errors.email}
                    </p>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="text-sm mt-2 text-gray-800">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 font-medium text-sm text-green-600">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <button disabled={processing} className='border-card' style={{ color: theme.text }}>Save</button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm" style={{ color: theme.text }}>Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
