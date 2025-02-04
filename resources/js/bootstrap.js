import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import { Link } from '@inertiajs/react';
window.Link = Link;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
window.AuthenticatedLayout = AuthenticatedLayout;

import Header from './Components/Header';
window.NavHeader = Header;

import { BreadCrumbsHeader } from './Components/Header';
window.BreadCrumbsHeader = BreadCrumbsHeader;

import { Head } from '@inertiajs/react';
window.Head = Head;

import toast from 'react-hot-toast';
window.toast = toast;

import Modal from './Components/Modal';
window.Modal = Modal;

import Unauthorized from './Pages/Unauthorized';
window.Unauthorized = Unauthorized;

const hasAccess = (value, allowedValues) => {
  if (allowedValues == null) return false;

  const valuesArray = Array.isArray(allowedValues) ? allowedValues : [allowedValues];
  return valuesArray.includes(value);
};
window.hasAccess = hasAccess;