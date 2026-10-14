/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fcp: {
          bg: '#161616',
          panel: '#202020',
          header: '#282828',
          border: '#333333',
          borderLight: '#444444',
          accent: '#007aff',
          accentHover: '#0062cc',
          videoClip: '#1e3a5f',
          videoClipBorder: '#3b82f6',
          audioClip: '#1e4d3a',
          audioClipBorder: '#10b981',
          titleClip: '#4a2868',
          titleClipBorder: '#a855f7',
          gapClip: '#2a2a2a',
          skimmer: '#f59e0b',
          playhead: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'ui-monospace', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}
