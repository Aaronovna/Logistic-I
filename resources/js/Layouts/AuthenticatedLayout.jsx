import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStateContext } from '@/context/contextProvider';
import Dev from '@/Pages/Dev';
import Modal from '@/Components/Modal';

const AuthenticatedLayout = ({ user, children }) => {
  const { setUserPermissions, theme } = useStateContext();

  useEffect(() => {
    setUserPermissions(JSON.parse(user.permissions));
  }, []);

  const [openDDG, setOpenDDG] = useState(false);

  const closeModal = () => {
    setOpenDDG(false);
  };

  return (
    <div style={{ background: theme.background }}>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            padding: '18px',
            border: '1px solid',
            background: theme.background,
            color: theme.text,
            borderColor: theme.border,
          },
        }}
      />

      <div
        className="absolute border bottom-4 left-4 p-2 z-10 hover:opacity-100 opacity-30 duration-200 hover:cursor-pointer"
        style={{ background: theme.accent }}
        onClick={() => setOpenDDG(true)}
      >
        <p style={{ color: theme.background }}>DDG</p>
      </div>

      <Modal show={openDDG} onClose={closeModal}>
        <Dev></Dev>
      </Modal>

      {children}

    </div>
  );
}

export default AuthenticatedLayout;