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
        "orange": "#FF6600",
        "orange-dark": "#cc5200",
        "fond": "#f8f8f8",
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
