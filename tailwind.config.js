/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937', // màu tối custom
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Bật chế độ tối
};
