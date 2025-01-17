import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { router } from '@inertiajs/react';

import Modal from '@/Components/Modal';
import Dev from '@/Pages/Dev';
import { useStateContext } from '@/context/contextProvider';
import { convertPermissions } from '@/functions/permissionsConverter';

export default function Authenticated({ user, children }) {
  const { setUserPermissions, setUserType, userPermissions, userType, theme } = useStateContext(user.permissions ? convertPermissions(user.permissions) : null);

  const [loading, setLoading] = useState(true); // Added loading state

  const logout = () => {
    router.post('/logout', {}, {
      onFinish: () => {
        router.visit('/login');
      },
    });
  };

  useEffect(() => {
    setUserPermissions(convertPermissions(user.permissions));
  }, []);

  useEffect(() => {
    if (userPermissions && Array.isArray(userPermissions)) {
      if (userPermissions.some((permission) => permission["2050"] === true)) {
        console.log("Setting userType to admin");
        setUserType(2050);
      } else if (userPermissions.some((permission) => permission["2051"] === true)) {
        console.log("Setting userType to superadmin");
        setUserType(2051);
      } else if (userPermissions.some((permission) => permission["2052"] === true)) {
        console.log("Setting userType to system");
        setUserType(2052);
      } else if (userPermissions.some((permission) => permission["2053"] === true)) {
        console.log("Setting userType to staff");
        setUserType(2053);
      } else if (userPermissions.some((permission) => permission["2054"] === true)) {
        console.log("Setting userType to auditor");
        setUserType(2054);
      } else if (userPermissions.some((permission) => permission["2055"] === true)) {
        console.log("Setting userType to none");
        setUserType(2055);
      } else {
        if (!loading) {
          console.log("Setting userType to unknown");
          setUserType(3000);
          logout();
        }
      }
    } else {
      console.log("userPermissions is not valid:", userPermissions);
    }

    setLoading(false);
  }, [userPermissions]);

  useEffect(() => {
    console.log("userType changed:", userType);
  }, [userType]);

  const [openDDG, setOpenDDG] = useState(false);

  const closeModal = () => {
    setOpenDDG(false);
  };

  // Show a loading spinner while userType is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading, please wait...</p>
      </div>
    );
  }

  // Show a message if no valid permissions are assigned
  if (userType === 2055) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>NO PERMISSION ASSIGNED YET PLEASE TRY AGAIN LATER</p>
        <button className="border-card" onClick={logout}>
          Log Out
        </button>
      </div>
    );
  }

  // Skip rendering for unknown userType
  if (loading && userType === 3000) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>INVALID USER TYPE</p>
        <p>Logging out...</p>
      </div>
    );
  }

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
        className="absolute border bottom-4 right-2 p-2 z-10 hover:opacity-100 opacity-30 duration-200 hover:cursor-pointer"
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
