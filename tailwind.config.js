import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["Inter", "system-ui", "sans-serif"], // Use Inter for headings too for cleaner look
        mono: ["Fira Code", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Sapphire / Indigo Primary (Deep, Trusted, Premium)
        primary: {
          DEFAULT: "#4338ca", // indigo-700
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4338ca",
          700: "#4338ca", // Anchor
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        // Tinted Neutrals (Cool Slate feels more engineered than Warm Gray)
        neutral: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // Semantic Surfaces
        surface: {
          light: "#fcfcff", // Ultra-subtle cool tint (not #ffffff)
          "light-alt": "#f1f5f9", // Slate-100 for secondary surfaces
          dark: "#0b101b", // Deep blue-black
          "dark-alt": "#161b26",
        },
        // Modern Accents (Micro-usage only)
        accent: {
          teal: "#14b8a6", // Teal-500
          cyan: "#06b6d4", // Cyan-500
          amber: "#f59e0b", // Amber-500
          rose: "#f43f5e", // Rose-500
        }
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
        sm: ["0.8125rem", { lineHeight: "1.25rem" }], // 13px (Elite Detail)
        base: ["0.875rem", { lineHeight: "1.5rem" }], // 14px (Dense UI)
        md: ["1rem", { lineHeight: "1.6rem" }], // 16px (Body)
        lg: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
        xl: ["1.5rem", { lineHeight: "2rem" }], // 24px
        "2xl": ["2rem", { lineHeight: "2.5rem" }], // 32px (Header)
        "3xl": ["2.5rem", { lineHeight: "1.15" }], // 40px (Hero)
      },
      borderRadius: {
        lg: "12px", // Button/Input
        xl: "14px", // Card (User mandated 14-16)
        "2xl": "16px", // Card Alt
        "3xl": "24px", // Modal
      },
      boxShadow: {
        // "2 elevations" rule
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        DEFAULT: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        glow: "0 0 20px -5px var(--tw-shadow-color)",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.neutral.600"),
            fontFamily: theme("fontFamily.sans"),
            fontSize: "1.0625rem", // 17px base for serious reading
            lineHeight: "1.75",
            letterSpacing: "-0.011em",
            maxWidth: "65ch", // Optimal reading measure (God-Level constraint)
            marginLeft: "auto",
            marginRight: "auto",

            /* ---------- Paragraphs ---------- */
            p: {
              marginTop: "1.5em",
              marginBottom: "1.5em",
              textAlign: "left",
              lineHeight: "1.75",
              color: theme("colors.neutral.700"), // Slightly darker than 600
            },
            "p + p": {
              marginTop: "1.5em",
            },

            /* ---------- Headings ---------- */
            h1: {
              fontFamily: theme("fontFamily.display"),
              fontWeight: "700",
              fontSize: "2.5rem", // ~40px
              marginTop: "0",
              marginBottom: "0.8em",
              lineHeight: "1.15",
              color: theme("colors.neutral.950"), // Near black
              letterSpacing: "-0.035em",
            },
            h2: {
              position: "relative",
              fontFamily: theme("fontFamily.display"),
              fontWeight: "600",
              fontSize: "1.625rem", // ~26px
              marginTop: "2.5em",
              marginBottom: "0.8em",
              paddingBottom: "0.3em",
              borderBottom: "1px solid theme('colors.neutral.200')",
              scrollMarginTop: "6rem",
              color: theme("colors.neutral.900"),
              letterSpacing: "-0.025em",
            },
            "h2::before": {
              content: "'#'",
              color: theme("colors.primary.400"),
              fontWeight: "400",
              marginRight: "0.3em",
              opacity: "0.0", // Hide initially, show on group hover if handled in CSS
              fontSize: "0.85em",
              position: "absolute",
              left: "-1.2em",
            },
            h3: {
              fontWeight: "600",
              fontSize: "1.25rem", // 20px
              marginTop: "2.2em",
              marginBottom: "0.6em",
              color: theme("colors.neutral.900"),
              scrollMarginTop: "6rem",
              letterSpacing: "-0.02em",
            },

            /* ---------- Lists ---------- */
            "ul, ol": {
              marginTop: "1rem",
              marginBottom: "1rem",
              paddingLeft: "1.6rem",
            },
            li: {
              marginTop: "0.3em",
              marginBottom: "0.3em",
              paddingLeft: "0",
            },
            "ul li::marker": {
              color: theme("colors.primary.500"),
            },

            /* ---------- Quick Quotes ---------- */
            blockquote: {
              marginTop: "2em",
              marginBottom: "2em",
              padding: "1rem 1.5rem",
              borderLeftWidth: "3px",
              borderLeftColor: theme("colors.primary.500"),
              backgroundColor: theme("colors.neutral.50"),
              borderRadius: "0.5rem",
              fontStyle: "italic",
              fontWeight: "500",
              color: theme("colors.neutral.700"),
              quotes: '"\\201C""\\201D""\\2018""\\2019"',
            },
            "blockquote p:first-of-type::before": { content: "open-quote" },
            "blockquote p:last-of-type::after": { content: "close-quote" },

            /* ---------- Code ---------- */
            code: {
              backgroundColor: theme("colors.neutral.100"),
              color: theme("colors.rose.600"),
              padding: "0.2em 0.4em",
              borderRadius: "0.375rem",
              fontSize: "0.875em",
              fontWeight: "600",
              border: "1px solid theme('colors.neutral.200')",
            },
            pre: {
              backgroundColor: "#1e1e2e", // Catppuccin Mocha / VS Code Dark
              color: "#cdd6f4",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
              overflowX: "auto",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              lineHeight: "1.7",
              marginTop: "1.75em",
              marginBottom: "1.75em",
              fontSize: "0.9rem",
              border: "1px solid rgba(255,255,255,0.1)",
            },
            "pre code": {
              backgroundColor: "transparent",
              color: "inherit",
              padding: "0",
              border: "none",
              fontSize: "inherit",
            },

            /* ---------- Links ---------- */
            a: {
              color: theme("colors.primary.600"),
              fontWeight: "500",
              textDecoration: "none",
              borderBottom: "1px solid transparent",
              transition: "border-color 0.2s, color 0.2s",
              "&:hover": {
                borderBottomColor: theme("colors.primary.400"),
                color: theme("colors.primary.700"),
              },
            },

            /* ---------- HR ---------- */
            hr: {
              borderColor: theme("colors.neutral.200"),
              marginTop: "3em",
              marginBottom: "3em",
              borderTopWidth: "1px",
            },
          },
        },
        // DARK MODE PROSE
        invert: {
          css: {
            color: theme("colors.neutral.400"),
            "h1,h2,h3,h4": { color: theme("colors.neutral.100") },
            "h2::before": { color: theme("colors.primary.400") },
            a: {
              color: theme("colors.primary.400"),
              "&:hover": {
                color: theme("colors.primary.300"),
                borderBottomColor: theme("colors.primary.500")
              },
            },
            code: {
              backgroundColor: theme("colors.neutral.800"),
              color: theme("colors.rose.300"),
              borderColor: theme("colors.neutral.700"),
            },
            blockquote: {
              backgroundColor: "rgba(255,255,255,0.03)", // Subtle tint
              color: theme("colors.neutral.300"),
              borderLeftColor: theme("colors.primary.400"),
            },
            hr: {
              borderColor: theme("colors.neutral.800"),
            },
          },
        },
      }),
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".8" },
        },
      }
    },
  },
  plugins: [typography],
};
