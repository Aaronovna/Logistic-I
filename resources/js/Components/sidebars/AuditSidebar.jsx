import React from "react";
import { useState } from "react";
import { useStateContext } from "@/context/contextProvider";

import NavLink from '@/Components/NavLink';
import NavLinkCategory from '@/Components/NavLinkCategory';
import { TbClipboardCheck } from "react-icons/tb";

import Logo from "../Logo";

import { auditLinks } from '@/Constants/navlinks';

const AuditSidebar = () => {
  const { theme, setThemePreference } = useStateContext();

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const handleSidebarMouseEnter = () => setIsSidebarHovered(true);
  const handleSidebarMouseLeave = () => setIsSidebarHovered(false);
  return (
    <aside
      className='w-80 hidden md:flex md:flex-col border m-4 mr-0 rounded-lg overflow-hidden'
      style={{ background: theme.background, borderColor: theme.border }}
    >
      <div className='m-4 mb-6 h-20'>
        <Logo color={theme.accent} />
      </div>

      <div className={`flex flex-col h-auto overflow-hidden overflow-y-auto pr-4 gutter-stable duration-300 pb-10 ${isSidebarHovered ? 'scroll' : 'scroll-hide'}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >

        <NavLinkCategory routes={auditLinks} Icon={TbClipboardCheck} href='tasks' label='Auditing' className='mr-4' />
        {auditLinks.map((link, index) => {
          return (
            <NavLink key={index} href={route(Array.isArray(link.name) ? link.name[0] : link.name)} active={Array.isArray(link.name) ? link.name.some(name => route().current(name)) : route().current(link.name)}>
              <span className='flex items-center gap-1 px-1'>
                <link.Icon className='mr-1' />
                <p className=' capitalize'>{Array.isArray(link.name) ? link.name[0] : link.name}</p>
                {/* <p className=' capitalize'>{link.name.replace(/-/g, ' ')}</p> */}
              </span>
            </NavLink>
          )
        })}

      </div>

      <button
        className='p-2 border-t mt-auto'
        style={{ color: theme.text, borderColor: theme.border }}
        onClick={() => { setThemePreference(theme._type === 'light' ? 'dark' : 'light'); }}
      >
        {theme._type === 'light' ? 'Dark Mode' : 'Light Mode'}
      </button>

    </aside>
  )
}

export default AuditSidebar;