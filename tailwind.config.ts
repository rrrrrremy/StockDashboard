import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'stock-green': '#4caf50',
        'stock-red': '#f44336',
      },
      fontSize: {
        'xxs': '.65rem',
      },
      maxHeight: {
        '128': '32rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
}

export default config