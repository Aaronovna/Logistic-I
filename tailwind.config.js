import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    safelist: [
        'bg-yellow-100', 'text-yellow-600',
        'bg-blue-100', 'text-blue-600',
        'bg-green-100', 'text-green-600',
        'bg-purple-100', 'text-purple-600',
        'bg-red-100', 'text-red-600',
        'bg-lime-100', 'text-lime-600',
    ],

    plugins: [],
};
