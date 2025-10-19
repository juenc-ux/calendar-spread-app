module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 25px 60px rgba(79, 70, 229, 0.35)',
      },
      backgroundImage: {
        'aurora-light':
          'radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.25), transparent 55%), radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.18), transparent 50%), radial-gradient(circle at 15% 80%, rgba(16, 185, 129, 0.2), transparent 45%)',
        'aurora-dark':
          'radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.2), transparent 55%), radial-gradient(circle at 85% 15%, rgba(236, 72, 153, 0.16), transparent 50%), radial-gradient(circle at 30% 90%, rgba(16, 185, 129, 0.12), transparent 45%)',
      },
    },
  },
  plugins: [],
}
