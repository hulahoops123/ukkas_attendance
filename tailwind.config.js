/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway'],
        staatliches: ['Staatliches'],
      },
      keyframes: {
        bubbleRise:{
          '0%': { transform: ' scale(0) translateY(200%)' },
          // '50%': { transform: 'scale(3)' },
          '100%': { transform: ' scale(1) translateY(0%)' },
        },
                popfade: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.1)', opacity: '0.7' },
          '100%': { transform: 'scale(1.2)', opacity: '0' },
        }
      },
      animation: {
        bubbleRise: 'bubbleRise 2s linear  1',
                popfade: 'popfade 0.4s ease forwards',
      }
    },
  },
  plugins: [],
}

