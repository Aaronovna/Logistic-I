export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                text: 'var(--text)',
                background: 'var(--background)',
                primary: 'var(--primary)',
                secondary: 'var(--secondary)',
                accent: 'var(--accent)',
                neutral: 'var(--neutral)',
                hbg: 'var(--hbg)',
            },
        },
    },

    variants: {
        extend: {
            opacity: ['disabled'],
            backgroundColor: ['disabled'],
            textColor: ['disabled'],
            cursor: ['disabled'],
        },
    },

    safelist: [
        'bg-yellow-100', 'text-yellow-600', 'bg-yellow-200',
        'bg-blue-100', 'text-blue-600',
        'bg-green-100', 'text-green-600', 'bg-green-200',
        'bg-purple-100', 'text-purple-600',
        'bg-red-100', 'text-red-600', 'bg-red-200',
        'bg-lime-100', 'text-lime-600',
        'bg-pink-100', 'text-pink-600',
    ],

    plugins: [],
};
