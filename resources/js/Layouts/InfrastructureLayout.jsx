import { useState } from "react";
import { useStateContext } from "@/context/contextProvider";

import InfrastructureSidebar from "@/Components/sidebars/InfrastructureSidebar";
import AdminSidebar from "@/Components/sidebars/AdminSidebar";
import Dropdown from '@/Components/Dropdown';
import { getPages } from "@/functions/getPages";
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

import { TbChevronDown } from "react-icons/tb";
import { TbMenu2 } from "react-icons/tb";
import { TbX } from "react-icons/tb";


const DefaultLayout = ({ user, header, children }) => {
    const pages = getPages(user.type);
  const { theme } = useStateContext();
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  return (
    <div className="flex h-screen relative">
      <div className='w-full h-4 absolute z-30 -left-2' style={{ background: theme.background }}></div>
      <div className='w-full h-4 absolute z-30 bottom-0 -left-2' style={{ background: theme.background }}></div>

      { user.type === 2053 ? <InfrastructureSidebar /> : null }
      { user.type === 2051 ? <AdminSidebar /> : null }

      <div className='relative flex flex-col w-full h-screen overflow-y-scroll overflow-hidden'>
        <nav className='sticky w-auto top-4 z-20 backdrop-blur-sm border-card m-4 h-fit'
          style={{ backgroundColor: theme.blur }}>
          <div className="flex w-full items-center">
            <button
              onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
              className="inline-flex md:hidden items-center justify-center p-2 rounded-md transition duration-150 ease-in-out"
              style={{ color: theme.accent }}
            >
              <span className="inline-flex md:hidden"><TbMenu2 size={22} /></span>
            </button>

            {header && <div className="ml-auto md:mx-4 mr-4 md:my-4">{header}</div>}

            <div className="ml-auto md:inline-flex hidden">
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="m-4 md:inline-flex hidden">
                    <button
                      type="button"
                      style={{ color: theme.text }}
                      className="inline-flex items-center px-3 py-2 font-medium transition ease-in-out duration-150"
                    >
                      {user.name}
                      { user.type === 2053 ? ' (Infrastructure)' : null }
                      { user.type === 2051 ? ' (Admin)' : null }
                      <TbChevronDown size={22} />
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
            className="inline-flex items-center justify-center p-2 m-2 rounded-md transition duration-150 ease-in-out w-fit my-2"
            style={{ color: theme.accent }}
          >
            <TbX size={22}/>
          </button>

          <div className="overflow-y-auto">
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
              <div className="font-light text-sm" style={{ color: theme.accent }}>{user.email}</div>
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
  )
}

export default DefaultLayout;
