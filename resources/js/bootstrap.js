import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import { Link } from '@inertiajs/react';
window.Link = Link;

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
window.AuthenticatedLayout = AuthenticatedLayout;

import { Head } from '@inertiajs/react';
window.Head = Head;

import toast from 'react-hot-toast';
window.toast = toast;
