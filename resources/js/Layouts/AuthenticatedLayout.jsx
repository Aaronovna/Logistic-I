import { useState } from 'react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import NavLinkCategory from '@/Components/NavLinkCategory';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';

import { TbLayoutDashboard } from "react-icons/tb";
import { TbChartHistogram } from "react-icons/tb";
import { TbBuildingWarehouse } from "react-icons/tb";
import { TbClipboardList } from "react-icons/tb";
import { TbSettingsCog } from "react-icons/tb";
import { TbCategory } from "react-icons/tb";
import { TbUserCog } from "react-icons/tb";

import { Toaster } from 'react-hot-toast';

const analyticsRoutes = ['dashboard', 'report'];
const inventoryRoutes = [ 'product'];
const managementRoutes = ['category', 'user'];

export default function Authenticated({ user, header, children }) {
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

  return (
    <div className="flex h-screen">
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          className: 'border-card',
          style: {
            padding: '18px',
            marginRight: '1%',
          },
        }}
      />

      <aside className='bg-[#F3F8FF] w-80 hidden md:block border border-gray-300'>

        <p className='m-4 mb-16 font-bold text-xl text-center'>BTMS - Logistic I</p>

        <div className="flex flex-col">

          <NavLinkCategory routes={analyticsRoutes} Icon={TbChartHistogram} href='dashboard' label='Analytics' className='mr-4' />
          <NavLink href={route('dashboard')} active={route().current('dashboard')}>
            <span className='flex items-center gap-1 px-1'>
              <TbLayoutDashboard className='mr-1' />
              <p>Dashboard</p>
            </span>
          </NavLink>
          <NavLink href={route('report')} active={route().current('report')}>
            <span className='flex items-center gap-1 px-1'>
              <TbClipboardList className='mr-1' />
              <p>Report</p>
            </span>
          </NavLink>

          <NavLinkCategory routes={inventoryRoutes} Icon={TbBuildingWarehouse} href='product' label='Analytics' className='mr-4' />
          <NavLink href={route('product')} active={route().current('product')}>
            Product
          </NavLink>

          <NavLinkCategory routes={managementRoutes} Icon={TbSettingsCog} href='category' label='Management' className='mr-4' />
          <NavLink href={route('category')} active={route().current('category')}>
            <span className='flex items-center gap-1 px-1'>
              <TbCategory className='mr-1' />
              <p>Category</p>
            </span>
          </NavLink>
          <NavLink href={route('user')} active={route().current('user')}>
            <span className='flex items-center gap-1 px-1'>
              <TbUserCog className='mr-1' />
              <p>User</p>
            </span>
          </NavLink>
        </div>

      </aside>

      <div className='flex flex-col w-full h-screen overflow-y-scroll'>
        <nav className='sticky top-0 z-10 bg-white-10/50 backdrop-blur-sm'>
          <div className="flex w-full">
            <div className="relative flex justify-between w-full">
              {header && (
                <header>
                  <div className="mx-8 my-4">{header}</div>
                </header>
              )}
              <Dropdown>
                <Dropdown.Trigger>
                  <span className="inline-flex m-4">
                    <button
                      type="button"
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
          <hr />

          <div className="-me-2 flex items-center sm:hidden">
            <button
              onClick={() => setShowingNavigationDropdown((previousState) => !previousState)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 focus:text-gray-500 transition duration-150 ease-in-out"
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

          <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
            <div className="pt-2 pb-3 space-y-1">
              <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                Dashboard
              </ResponsiveNavLink>
            </div>

            <div className="pt-4 pb-1 border-t border-gray-200">
              <div className="px-4">
                <div className="font-medium text-base text-gray-800">{user.name}</div>
                <div className="font-medium text-sm text-gray-500">{user.email}</div>
              </div>

              <div className="mt-3 space-y-1">
                <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                <ResponsiveNavLink method="post" href={route('logout')} as="button">
                  Log Out
                </ResponsiveNavLink>
              </div>
            </div>
          </div>
        </nav>

        {children}

      </div>
    </div>
  );
}
