module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        "grid-green-400/30":
          "linear-gradient(to right, #4ade80/30 1px, transparent 1px), linear-gradient(to bottom, #4ade80/30 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        "grid-8": "8px 8px",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        float: {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(5deg)" },
          "100%": { transform: "translateY(0px) rotate(0deg)" },
        },
        "float-delayed": {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-15px) rotate(-5deg)" },
          "100%": { transform: "translateY(0px) rotate(0deg)" },
        },
        "float-slow": {
          "0%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
          "100%": { transform: "translateY(0px) rotate(0deg)" },
        },
        steam: {
          "0%": {
            transform: "translateY(0) translateX(0) scale(1)",
            opacity: 0.3,
          },
          "50%": {
            transform: "translateY(-15px) translateX(5px) scale(1.2)",
            opacity: 0.2,
          },
          "100%": {
            transform: "translateY(-30px) translateX(10px) scale(1.4)",
            opacity: 0,
          },
        },
        "steam-delayed": {
          "0%": {
            transform: "translateY(0) translateX(0) scale(1)",
            opacity: 0.3,
          },
          "50%": {
            transform: "translateY(-20px) translateX(-5px) scale(1.2)",
            opacity: 0.2,
          },
          "100%": {
            transform: "translateY(-40px) translateX(-10px) scale(1.4)",
            opacity: 0,
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 5s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        steam: "steam 3s ease-in-out infinite",
        "steam-delayed": "steam-delayed 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
