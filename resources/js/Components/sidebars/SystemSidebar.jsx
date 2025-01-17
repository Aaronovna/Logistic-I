import React from "react";
import { useState } from "react";
import { useStateContext } from "@/context/contextProvider";

import NavLink from '@/Components/NavLink';
import NavLinkCategory from '@/Components/NavLinkCategory';

import { TbChartHistogram } from "react-icons/tb";
import { TbPackages } from "react-icons/tb";
import { TbClipboardCheck } from "react-icons/tb";
import { TbBuildingCommunity } from "react-icons/tb";
import { TbSettingsCog } from "react-icons/tb";

import { analyticsLinks, inventoryLinks, managementLinks, infrastructureLinks, auditLinks } from '@/Constants/navlinks';

const SystemSidebar = () => {
  const {theme, setThemePreference} = useStateContext();

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
    const handleSidebarMouseEnter = () => setIsSidebarHovered(true);
    const handleSidebarMouseLeave = () => setIsSidebarHovered(false);
  return (
    <aside
      className='w-80 hidden md:flex md:flex-col border m-4 mr-0 rounded-lg overflow-hidden'
      style={{ background: theme.background, borderColor: theme.border }}
    >
      <div className='logo m-4 mb-6 h-20 bg-no-repeat'></div>
      {/* <p className='m-4 mb-12 font-bold text-2xl text-center' style={{ color: theme.accent }}>NextFleet Dynamics</p> */}

      <div className={`flex flex-col h-auto overflow-hidden overflow-y-auto pr-4 gutter-stable duration-300 pb-10 ${isSidebarHovered ? 'scroll' : 'scroll-hide'}`}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <NavLinkCategory routes={analyticsLinks} Icon={TbChartHistogram} href='dashboard' label='Analytics' className='mr-4' />
        {analyticsLinks.map((link, index) => {
          return (
            <NavLink key={index} href={route(link.name)} active={route().current(link.name)}>
              <span className='flex items-center gap-1 px-1'>
                <link.Icon className='mr-1' />
                <p className=' capitalize'>{link.name}</p>
              </span>
            </NavLink>
          )
        })}

        <NavLinkCategory routes={inventoryLinks} Icon={TbPackages} href='receipt' label='Inventory' className='mr-4' />
        {inventoryLinks.map((link, index) => {
          return (
            <NavLink key={index} href={route(Array.isArray(link.name) ? link.name[0] : link.name)} active={Array.isArray(link.name) ? link.name.some(name => route().current(name)) : route().current(link.name)}>
              <span className='flex items-center gap-1 px-1'>
                <link.Icon className='mr-1' />
                <p className=' capitalize'>{Array.isArray(link.name) ? link.name[0] : link.name}</p>
              </span>
            </NavLink>
          )
        })}

        <NavLinkCategory routes={infrastructureLinks} Icon={TbBuildingCommunity} href='depot' label='Infrastructure' className='mr-4' />
        {infrastructureLinks.map((link, index) => {
          return (
            <NavLink key={index} href={route(Array.isArray(link.name) ? link.name[0] : link.name)} active={Array.isArray(link.name) ? link.name.some(name => route().current(name)) : route().current(link.name)}>
              <span className='flex items-center gap-1 px-1'>
                <link.Icon className='mr-1' />
                <p className=' capitalize'>{Array.isArray(link.name) ? link.name[0] : link.name}</p>
              </span>
            </NavLink>
          )
        })}

        <NavLinkCategory routes={auditLinks} Icon={TbClipboardCheck} href='audits' label='Auditing' className='mr-4' />
        {auditLinks.map((link, index) => {
          return (
            <NavLink key={index} href={route(link.name)} active={route().current(link.name)}>
              <span className='flex items-center gap-1 px-1'>
                <link.Icon className='mr-1' />
                <p className=' capitalize'>{link.name}</p>
              </span>
            </NavLink>
          )
        })}

        <NavLinkCategory routes={managementLinks} Icon={TbSettingsCog} href='user' label='Management' className='mr-4' />
        {managementLinks.map((link, index) => {
          return (
            <NavLink key={index} href={route(Array.isArray(link.name) ? link.name[0] : link.name)} active={Array.isArray(link.name) ? link.name.some(name => route().current(name)) : route().current(link.name)}>
              <span className='flex items-center gap-1 px-1'>
                <link.Icon className='mr-1' />
                <p className=' capitalize'>{Array.isArray(link.name) ? link.name[0] : link.name}</p>
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

export default SystemSidebar;