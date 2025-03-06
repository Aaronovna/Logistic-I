import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { useStateContext } from '@/context/contextProvider';
import { TbX } from 'react-icons/tb';

export default function Modal({name = "Modal Name", children, show = false, maxWidth = '2xl', closeable = true, onClose = () => { } }) {
  const { themePreference } = useStateContext();
  const close = () => {
    if (closeable) {
      onClose();
    }
  };

  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  }[maxWidth];

  return (
    <Transition show={show} leave="duration-200">
      <Dialog
        as="div"
        id="modal"
        className={`${themePreference === 'dark' ? 'dark' : 'null'} fixed inset-0 flex overflow-y-auto px-4 py-6 sm:px-0 items-center z-40 transform transition-all`}
        onClose={close}
      >
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="absolute inset-0 backdrop-blur-sm" />
        </TransitionChild>

        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <DialogPanel
            style={{ padding: '1rem' }}
            className={`bg-background border-card backdrop-blur-sm rounded-lg overflow-hidden shadow-xl transform transition-all sm:w-full sm:mx-auto ${maxWidthClass}`}
          >
            <div className='flex mb-4'>
              <p className='text-xl font-medium mt-2 pb-2 tracking-wider text-text'>{name}</p>
              {closeable ? <button onClick={onClose} className='ml-auto text-text'><TbX size={32}/></button> : null}
            </div>
              {children}
          </DialogPanel>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}