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
        console.log("Setting userType to system");
        setUserType("system");
      } else if (userPermissions.some((permission) => permission["2051"] === true)) {
        console.log("Setting userType to staff");
        setUserType("staff");
      } else if (userPermissions.some((permission) => permission["2052"] === true)) {
        console.log("Setting userType to auditor");
        setUserType("auditor");
      } else if (userPermissions.some((permission) => permission["2053"] === true)) {
        console.log("Setting userType to none");
        setUserType("none");
      } else {
        console.log("Setting userType to unknown");
        setUserType("unknown");
        logout();
      }
    } else {
      console.error("userPermissions is not valid:", userPermissions);
    }
    setLoading(false); // Mark loading as complete after processing
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
  if (!userType || userType === "none") {
    return (
      <div className="p-4">
        <p>NO PERMISSION ASSIGNED YET PLEASE TRY AGAIN LATER</p>
        <button className="border-card" onClick={logout}>
          Log Out
        </button>
      </div>
    );
  }

  // Skip rendering for unknown userType
  if (userType === "unknown") {
    return null;
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
