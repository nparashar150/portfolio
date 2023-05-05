/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
    fontFamily: {
      Vollkorn: ["Vollkorn", "serif"],
      WorkSans: ["Work Sans", "sans-serif"],
    },
    colors: {
      green: "#1ED291",
      darkGreen: "#00754B",
      matte: "#161313",
      dark: "#000000",
      white: "#FFFFFF",
    },
  },
  plugins: [],
};
