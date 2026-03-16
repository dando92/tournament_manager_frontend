/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 8s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      colors: {
        blu: "#359DD5",
        bianco: "#F3F9FD",
        giallo: "#FFCC07",
        nero: "#142739",
        grigio: "#E9E9E9",
        lower: "#2E9BD5",
        middle: "#256CAE",
        upper: "#0E1928",
        grigioQualifica: "#444443",
        gialloQualifica: "#FFC505",
        rossoTag: "#1F8DDE",
        rossoTesto: "#1565C0",
        sfondoPagina: "#ffffff",
      },
    },
  },
  plugins: [],
};
