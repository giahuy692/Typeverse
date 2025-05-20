/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /animate-dog-walk-\[\d+s\]/,
    },
  ],
};
