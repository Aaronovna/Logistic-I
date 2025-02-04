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

  const [openDev, setOpenDev] = useState(false);

  const closeModal = () => {
    setOpenDev(false);
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

      {
        !hasAccess(user.type,[2050]) ? null :
        <div
          className="absolute border bottom-4 right-4 p-2 z-10 hover:opacity-100 opacity-30 duration-200 hover:cursor-pointer"
          style={{ background: theme.accent }}
          onClick={() => setOpenDev(true)}
        >
          <p style={{ color: theme.background }}>Dev</p>
        </div>
      }

      <Modal show={openDev} onClose={closeModal}>
        <Dev />
      </Modal>

      {children}

    </div>
  );
}

export default AuthenticatedLayout;