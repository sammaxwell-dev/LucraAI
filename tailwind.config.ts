import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './lib/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                background: '#050505',
                surface: '#0f0f10',
                surfaceHighlight: '#1a1a1c',
                border: '#27272a',
            },
            fontFamily: {
                sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 40px -10px rgba(255, 255, 255, 0.1)',
                'orb': 'inset -10px -10px 20px rgba(0,0,0,0.5), inset 10px 10px 20px rgba(255,255,255,0.4), 0 0 30px rgba(100,100,255,0.3)',
            }
        }
    },
    plugins: [],
}

export default config
