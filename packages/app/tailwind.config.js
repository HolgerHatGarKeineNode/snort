/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
    content: ["./src/**/*.{html,js,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inconsolata',
                    ...defaultTheme.fontFamily.sans
                ],
                mono: [
                    'Inconsolata',
                    ...defaultTheme.fontFamily.mono
                ],
            }
        },
    },
    plugins: [],
}

