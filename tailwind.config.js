/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {},
    fontFamily: {
      Vollkorn: ["Vollkorn", "serif"],
      WorkSans: ["Work Sans", "sans-serif"],
    },
    colors: {
      green: "#14b8a5",
      darkGreen: "#115e59",
      matte: "#161313",
      dark: "#000000",
      white: "#FFFFFF",
    },
  },
  plugins: [],
};
