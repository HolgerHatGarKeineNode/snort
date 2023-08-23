/** @type {import('tailwindcss').Config} */

const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./src/**/*.{html,js,tsx}"],
  theme: {
    extend: {
      dropShadow: {
        "3xl": "0 3px 3px rgba(245, 158, 11, 0.25)",
      },
      fontFamily: {
        sans: ["Inconsolata", ...defaultTheme.fontFamily.sans],
        mono: ["Inconsolata", ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
};
