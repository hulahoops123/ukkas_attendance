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
        }
      },
      animation: {
        bubbleRise: 'bubbleRise 2s linear  1',
      }
    },
  },
  plugins: [],
}

