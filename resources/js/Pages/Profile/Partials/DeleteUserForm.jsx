import { useRef, useState } from 'react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useStateContext } from '@/context/contextProvider';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });
    const { theme } = useStateContext();
    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Delete Account</h2>

                <p className="mt-1 text-sm text-gray-600">
                    Once your account is deleted, all of its resources and data will be permanently deleted. Before
                    deleting your account, please download any data or information that you wish to retain.
                </p>
            </header>

            <button className='border-card' onClick={confirmUserDeletion}>Delete Account</button>

            <Modal show={confirmingUserDeletion} onClose={closeModal} name='Are you sure you want to delete your account?'>
                <form onSubmit={deleteUser} >

                    <p className="mt-1 text-sm text-gray-600">
                        Once your account is deleted, all of its resources and data will be permanently deleted. Please
                        enter your password to confirm you would like to permanently delete your account.
                    </p>

                    <div className="mt-6">
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="mt-1 block w-full border-card"
                            placeholder="Password"
                        />

                        <p className='text-sm text-red-600'>
                            {errors.password}
                        </p>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button className="border-card mr-2" onClick={closeModal}>Cancel</button>

                        <button className="border-card" disabled={processing}>
                            Delete Account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
