/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customDark: '#292a3e',
        customDarker: '#1e202f',
        customGray: '#f2f2f2',
      },
    },
  },
  plugins: [],
}