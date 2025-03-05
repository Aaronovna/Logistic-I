import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useStateContext } from '@/context/contextProvider';
import Dev from '@/Pages/Dev';
import Modal from '@/Components/Modal';
import useRole from '@/hooks/useRole';

const AuthenticatedLayout = ({ user, children }) => {
  const { theme, themePreference, setUserPermissions, userPermissions } = useStateContext();
  const { hasAccess } = useRole();

  const [openDev, setOpenDev] = useState(false);

  useEffect(() => {
    const fetchUserPermissions = async (id) => {
      try {
        const response = await axios.get(`/position/get/${id}`);
        
        setUserPermissions(JSON.parse(response.data.data.permissions));
      } catch (error) {
        toast.error(`${error.status} ${error.response.data.message}`);
      }

    }
    if (user.position_id || userPermissions) {
      fetchUserPermissions(user.position_id);
    } else {
      toast.error('Permission failed to load, try again later or contact your Admin')
    }

  }, [])

  const closeModal = () => {
    setOpenDev(false);
  };

  return (
    <div className={`${themePreference === 'dark' ? 'dark' : 'null'} bg-background`}>
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
        !hasAccess(user.type, [2050]) ? null :
          <div
            className="absolute border bottom-4 right-4 p-2 z-10 hover:opacity-100 opacity-30 duration-200 hover:cursor-pointer"
            style={{ background: theme.accent }}
            onClick={() => setOpenDev(true)}
          >
            <p style={{ color: theme.background }}>Dev</p>
          </div>
      }

      <Modal show={openDev} onClose={closeModal} name='Developer Tools'>
        <Dev />
      </Modal>

      {children}

    </div>
  );
}

export default AuthenticatedLayout;