/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      minWidth: {
        290: "290px",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
