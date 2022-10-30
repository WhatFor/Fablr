/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'media',
  theme: {
    fontFamily: {
      'display': [ "pixel_droid_console" ],
      'body': [ "pixel_droid_console" ],
      'mono': [ "pixel_droid_console" ],
      'sans': [ "pixel_droid_console" ]
    },
    fontSize: {
      'sm': '2rem',
      'base': '3rem',
      'xl': '3.5rem',
      '2xl': '4rem',
      '3xl': '6rem',
      '4xl': '8rem',
      '5xl': '10rem',
    },
    backgroundColor: theme => ({
      ...theme('colors'),
      'black': "#070707",
    }),
    borderColor: {
      'white': '#FEFEFE'
    },
    extend: {
      lineHeight: {
        'mono-head': '1rem'
      }
    },
    
  },
  variants: {
    extend: {
      fontColor: ['hover', 'disabled'],
      opacity: ['disabled'],
      cursor: ['hover', 'disabled'],
    },
  },
  plugins: [],
};
