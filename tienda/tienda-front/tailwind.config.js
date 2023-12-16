/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'brandOne': '#EBE9E3',
        'brandTwo': '#2B2B2B',
        // ... tus colores personalizados
        'white': '#ffffff',
        'black': '#000000',
      },
      fontFamily: {
        // Asegúrate de incluir la fuente en tu proyecto o importarla desde una fuente externa
        'elegant': ['Poppins', 'sans-serif'],
      },
      // ... otras personalizaciones
    },
  },
  plugins: [],
}

