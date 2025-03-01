import React from "react";
import { router } from "@inertiajs/react";

const logout = () => {
    router.post('/logout', {}, {
      onFinish: () => {
        router.visit('/login');
      },
    });
  };
  
const Unauthorized = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-500 text-xl font-medium tracking-wider">Access Denied. You do not have permission to access this page.</p>
        {/* <button onClick={logout} className="border-card">
          logout
        </button> */}
      </div>
    )
}

export default Unauthorized;