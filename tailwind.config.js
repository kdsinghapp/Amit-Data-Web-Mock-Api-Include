/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        mega: "0 20px 60px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
