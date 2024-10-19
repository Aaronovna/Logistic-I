import './bootstrap';
import '../css/global.css';
import '../css/scrollbar.css';
import '../css/backgrounds.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

import { ContextProvider } from './context/contextProvider';

const appName = import.meta.env.VITE_APP_NAME || 'Logistic I';

createInertiaApp({
    title: (title) => `${appName} | ${title}`,
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
