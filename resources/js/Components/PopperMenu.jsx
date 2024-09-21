import React, { useState, useRef, useEffect } from 'react';

const PopperMenu = ({ list = [''], actions = [() => { }], className = "", children, renderButton, containerStyle = {} }) => {
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
        onClick={togglePopper}
      >
        {renderButton ? renderButton() : <div className={className}>button</div>}
      </button>

      {open && (
        <div
          ref={popperRef}
          className={'absolute right-0 z-50 overflow-clip'}
          style={containerStyle}  
        >
          {children
            ? children
            : <ul>
              {list && list.map((item, index) => {
                return (
                  <li key={index} className="cursor-pointer text-nowrap py-1 px-2 hover:bg-gray-300/50 text-sm" onClick={actions[index]}
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
