/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class', // Enforce manual dark mode toggling instead of system preference
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}
