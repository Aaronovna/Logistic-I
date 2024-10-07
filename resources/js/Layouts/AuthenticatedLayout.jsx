import { useEffect, useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import NavLinkCategory from '@/Components/NavLinkCategory';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

import { TbChartHistogram } from "react-icons/tb";
import { TbPackages } from "react-icons/tb";
import { TbClipboardCheck } from "react-icons/tb";
import { TbBuildingCommunity } from "react-icons/tb";
import { TbSettingsCog } from "react-icons/tb";


import { Toaster } from 'react-hot-toast';

import { useStateContext } from '@/context/contextProvider';
import { convertPermissions } from '@/functions/permissionsConverter';

import { analyticsLinks, inventoryLinks, managementLinks, infrastructureLinks, auditLinks } from '@/Constants/navlinks';

const pages = [
  'dashboard', 'report',
  'product',
  'category', 'user',
]

export default function Authenticated({ user, header, children }) {
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const { setUserPermissions, theme, setThemePreference } = useStateContext(user.permissions ? convertPermissions(user.permissions) : null);

  useEffect(() => {
    setUserPermissions(convertPermissions(user.permissions));
  }, [])

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const handleSidebarMouseEnter = () => setIsSidebarHovered(true);
  const handleSidebarMouseLeave = () => setIsSidebarHovered(false);

  return (
    <div className="flex h-screen" style={{ background: theme.background }}>
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

      <div className='w-full h-4 absolute z-30 -left-2' style={{ background: theme.background }}></div>
      <div className='w-full h-4 absolute z-30 bottom-0 -left-2' style={{ background: theme.background }}></div>

      <aside
        className='w-80 hidden md:flex md:flex-col border m-4 mr-0 rounded-lg overflow-hidden'
        style={{ background: theme.background, borderColor: theme.border }}
      >

        <p className='m-4 mb-12 font-bold text-2xl text-center' style={{ color: theme.accent }}>NextFleet Dynamics</p>

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

          <NavLinkCategory routes={inventoryLinks} Icon={TbPackages} href='product' label='Inventory' className='mr-4' />
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
              <NavLink key={index} href={route(link.name)} active={route().current(link.name)}>
                <span className='flex items-center gap-1 px-1'>
                  <link.Icon className='mr-1' />
                  <p className=' capitalize'>{link.name}</p>
                </span>
              </NavLink>
            )
          })}

          <NavLinkCategory routes={auditLinks} Icon={TbClipboardCheck} href='product' label='Auditing' className='mr-4' />
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

          <NavLinkCategory routes={managementLinks} Icon={TbSettingsCog} href='category' label='Management' className='mr-4' />
          {managementLinks.map((link, index) => {
            return (
              <NavLink key={index} href={route(link.name)} active={route().current(link.name)}>
                <span className='flex items-center gap-1 px-1'>
                  <link.Icon className='mr-1' />
                  <p className=' capitalize'>{link.name}</p>
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

      <div className='relative flex flex-col w-full h-screen overflow-y-scroll overflow-hidden'>
        <nav className='sticky w-auto top-4 z-20 backdrop-blur-sm border-card m-4 h-fit'
          style={{ backgroundColor: theme.blur }}>
          <div className="flex w-full">
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
                className="inline-flex items-center justify-center p-2 rounded-md transition duration-150 ease-in-out"
                style={{ color: theme.accent }}
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path
                    className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                  <path
                    className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="relative flex justify-between w-full">
              {header && (
                <div className="mx-4 my-4">{header}</div>
              )}
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="m-4 md:inline-flex hidden">
                    <button
                      type="button"
                      style={{ color: theme.text }}
                      className="inline-flex items-center px-3 py-2 font-medium transition ease-in-out duration-150"
                    >
                      {user.name}

                      <svg
                        className="ms-2 -me-0.5 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </span>
                </Dropdown.Trigger>

                <Dropdown.Content>
                  <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                  <Dropdown.Link href={route('logout')} method="post" as="button">
                    Log Out
                  </Dropdown.Link>
                </Dropdown.Content>
              </Dropdown>
            </div>
          </div>
        </nav>

        <div
          className={(showingNavigationDropdown ? 'flex' : 'hidden') + ' p-4 w-full fixed flex-col h-screen z-40 backdrop-blur-lg'}
          style={{ backgroundColor: theme.blur }}
        >
          <button
            onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
            className="inline-flex items-center justify-center p-2 rounded-md transition duration-150 ease-in-out w-fit my-2"
            style={{ color: theme.accent }}
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path
                className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="">
            {pages && pages.map((page, index) => {
              return (
                <ResponsiveNavLink key={index} href={route(page)} active={route().current(page)} className='capitalize'>
                  {page}
                </ResponsiveNavLink>
              )
            })}
          </div>
          <div className="mt-auto border-t" style={{ borderColor: theme.border }}>
            <div className="px-2">
              <div className="font-medium" style={{ color: theme.accent }}>{user.name}</div>
              <div className="font-medium text-sm" style={{ color: theme.secondary }}>{user.email}</div>
            </div>

            <div className="">
              <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
              <ResponsiveNavLink method="post" href={route('logout')} as="button">
                Log Out
              </ResponsiveNavLink>
            </div>
          </div>
        </div>

        {children}

      </div>
    </div>
  );
}
