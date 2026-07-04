/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    // daisyuiを読み込む設定
    import('daisyui').then(m => m.default) || require("daisyui")
  ],
}