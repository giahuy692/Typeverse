/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // rất quan trọng để Tailwind scan
  ],
  theme: {
    extend: {},
  },
  plugins: [PrimeUI],
}
