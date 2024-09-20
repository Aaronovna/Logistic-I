import React, { useState, useRef, useEffect } from 'react';

const PopperMenu = ({ list = [''], actions = [() => { }], className = "", children }) => {
  const [open, setOpen] = useState(false);
  const popperRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popperRef.current &&
        !popperRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const togglePopper = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={togglePopper}
      >
        Options
      </button>

      {open && (
        <div
          ref={popperRef}
          className={'absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50 overflow-clip ' + className}  
        >
          {children
            ? children
            : <ul>
              {list && list.map((item, index) => {
                return (
                  <li key={index} className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={actions[index]}
                  >
                    {item}
                  </li>
                )
              })}
            </ul>
          }

        </div>
      )}
    </div>
  );
};

export default PopperMenu;
