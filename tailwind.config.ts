import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bleu": "#1B4F9B",
        "bleu-dark": "#153d7a",
        // Palette orange complète : DEFAULT = couleur de marque BoosterVO.
        // Les nuances 50-900 sont la palette Tailwind par défaut (remplacée
        // par la couleur marque au 500) pour permettre bg-orange-100,
        // text-orange-700, etc.
        "orange": {
          DEFAULT: "#FF6600",
          50:  "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#FF6600",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          dark: "#cc5200",
        },
        "fond": "#f8f8f8",
        "creme": "#FBF7EF",
        "creme-dark": "#f3ede0",
      },
      fontFamily: {
        nunito: ["var(--font-nunito)", "sans-serif"],
        opensans: ["var(--font-opensans)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
