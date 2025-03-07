import { createContext, useContext, useState } from "react";
import Modal from "@/Components/Modal";

const ConfirmationContext = createContext();

export const ConfirmationProvider = ({ children }) => {
  const [dialog, setDialog] = useState({ isOpen: false, message: "", onConfirm: null });

  const confirm = (message, onConfirm) => {
    setDialog({ isOpen: true, message, onConfirm });
  };

  const handleClose = () => {
    setDialog({ isOpen: false, message: "", onConfirm: null });
  };

  return (
    <ConfirmationContext.Provider value={{ confirm }}>
      {children}
      <Modal name="Confirm Action" show={dialog.isOpen} closeable={false} onClose={handleClose} maxWidth="lg">
        <p className="text-text mb-8">{dialog.message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={handleClose} className="btn bg-red-400 hover:bg-red-500 w-full">Cancel</button>
          <button className="btn w-full"
            onClick={() => {
              dialog.onConfirm();
              handleClose();
            }}
          >
            Confirm
          </button>
        </div>
      </Modal>
    </ConfirmationContext.Provider>
  );
};

// Custom Hook to use in components
export const useConfirmation = () => {
  return useContext(ConfirmationContext);
};
