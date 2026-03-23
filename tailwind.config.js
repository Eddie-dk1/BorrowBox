/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f8f6f2',
        charcoal: '#1f1f1d',
        warm: '#FF0090',
        line: '#e7e2d9'
      }
    }
  },
  plugins: []
};
