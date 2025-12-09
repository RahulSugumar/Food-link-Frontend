/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand': {
                    orange: '#FF6B00',
                    green: '#2ECC71',
                    teal: '#1ABC9C',
                    blue: '#3498DB',
                    dark: '#2C3E50',
                }
            }
        },
    },
    plugins: [],
}
