/** @type {import('tailwindcss').Config} */
module.exports = {
 content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#07a495',
        secondary: '#059687',
        dark: '#000000',
      },
    },
  },
  plugins: [],
}

