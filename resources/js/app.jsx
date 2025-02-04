import './bootstrap';
import '../css/global.css';
import '../css/scrollbar.css';
import '../css/backgrounds.css';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { ContextProvider } from './context/contextProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Nexfleet Dynamics | Logistic I';

createInertiaApp({
    title: (title) => `${title} | ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ContextProvider>
                <App {...props} />
            </ContextProvider>
        );
    },
    progress: {
        color: '#004369',
    },
});
