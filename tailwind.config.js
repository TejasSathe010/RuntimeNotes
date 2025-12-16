// tailwind.config.js
import { defineConfig } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default defineConfig({
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      colors: {
        primary: { DEFAULT: "#1a73e8" }, // Google Blue
        surface: { light: "#fafafa", dark: "#0d1117" },
        accent: "#34A853",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme("colors.neutral.800"),
            fontFamily: theme("fontFamily.sans"),
            fontSize: "1.07rem",
            lineHeight: "1.85",
            letterSpacing: "-0.01em",
            maxWidth: "78ch",
            marginLeft: "auto",
            marginRight: "auto",

            /* ---------- Paragraphs ---------- */
            p: {
              marginTop: "1.3em",
              marginBottom: "1.3em",
              textAlign: "justify",
              lineHeight: "1.9",
              textIndent: "1.75em",
            },
            "p:first-of-type": {
              textIndent: "0",
              fontSize: "1.14rem",
              color: theme("colors.neutral.900"),
            },

            /* ---------- Headings ---------- */
            h1: {
              fontFamily: theme("fontFamily.display"),
              fontWeight: "800",
              fontSize: "2.5rem",
              marginTop: "0",
              marginBottom: "1.2em",
              lineHeight: "1.3",
              color: theme("colors.neutral.900"),
              letterSpacing: "-0.02em",
            },
            h2: {
              position: "relative",
              fontFamily: theme("fontFamily.display"),
              fontWeight: "700",
              fontSize: "1.75rem",
              marginTop: "3em",
              marginBottom: "1em",
              paddingBottom: "0.4em",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
              scrollMarginTop: "7rem",
            },
            "h2::before": {
              content: "'# '",
              color: theme("colors.primary.DEFAULT"),
              fontWeight: "600",
              marginRight: "0.4em",
            },
            h3: {
              fontWeight: "600",
              fontSize: "1.25rem",
              marginTop: "2em",
              marginBottom: "0.75em",
              color: theme("colors.neutral.800"),
              scrollMarginTop: "6.5rem",
            },
            "h3::before": {
              content: "'› '",
              color: theme("colors.primary.DEFAULT"),
              fontWeight: "600",
              marginRight: "0.3em",
            },

            /* ---------- Lists ---------- */
            "ul, ol": {
              marginTop: "1.2em",
              marginBottom: "1.2em",
              paddingLeft: "1.75em",
            },
            li: {
              marginTop: "0.4em",
              marginBottom: "0.4em",
              lineHeight: "1.8",
              paddingLeft: "0.2em",
            },
            "ul li::marker": {
              color: theme("colors.primary.DEFAULT"),
            },

            /* ---------- Blockquotes ---------- */
            blockquote: {
              marginTop: "2em",
              marginBottom: "2em",
              padding: "1.2rem 1.6rem",
              borderLeft: `4px solid ${theme("colors.primary.DEFAULT")}`,
              backgroundColor: "rgba(26,115,232,0.03)",
              borderRadius: "0.75rem",
              fontStyle: "normal",
              fontWeight: "400",
              color: theme("colors.neutral.700"),
              quotes: '"“" "”" "‘" "’"',
            },
            "blockquote p:first-of-type::before": { content: "open-quote" },
            "blockquote p:last-of-type::after": { content: "close-quote" },

            /* ---------- Code ---------- */
            code: {
              backgroundColor: "rgba(26,115,232,0.08)",
              color: theme("colors.primary.DEFAULT"),
              padding: "0.25rem 0.45rem",
              borderRadius: "6px",
              fontSize: "0.9em",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "#0d1117",
              color: "#f8fafc",
              borderRadius: "0.75rem",
              padding: "1.5rem 2rem",
              overflowX: "auto",
              boxShadow: "0 3px 18px rgba(0,0,0,0.25)",
              lineHeight: "1.7",
              marginTop: "2em",
              marginBottom: "2em",
              fontSize: "0.95rem",
              border: "1px solid rgba(255,255,255,0.05)",
            },

            /* ---------- Links ---------- */
            a: {
              color: theme("colors.primary.DEFAULT"),
              fontWeight: "500",
              textDecoration: "none",
              borderBottom: "1px dashed rgba(26,115,232,0.4)",
              "&:hover": {
                borderBottom: "1px solid rgba(26,115,232,0.8)",
                color: theme("colors.primary.DEFAULT"),
              },
            },

            /* ---------- Emphasis ---------- */
            "em,strong,b": {
              color: theme("colors.neutral.900"),
              fontWeight: "600",
            },

            /* ---------- Horizontal rule ---------- */
            hr: {
              border: "none",
              height: "1px",
              background:
                "linear-gradient(to right, transparent, rgba(26,115,232,0.4), transparent)",
              margin: "3em 0",
            },
          },
        },
        invert: {
          css: {
            color: theme("colors.neutral.200"),
            "h1,h2,h3,h4": { color: theme("colors.white") },
            "h2::before, h3::before": { opacity: "0.6" },
            a: {
              color: "#60a5fa",
              borderBottomColor: "rgba(96,165,250,0.5)",
              "&:hover": { borderBottomColor: "rgba(96,165,250,0.9)" },
            },
            code: {
              backgroundColor: "rgba(96,165,250,0.15)",
              color: "#93c5fd",
            },
            pre: {
              backgroundColor: "#111827",
              borderColor: "#1f2937",
            },
            blockquote: {
              backgroundColor: "rgba(26,115,232,0.05)",
              color: "#ddd",
              borderLeftColor: "#60a5fa",
            },
          },
        },
      }),
      extend: {
  keyframes: {
    "pulse-slow": {
      "0%, 100%": { opacity: "0.6", transform: "translateY(0px)" },
      "50%": { opacity: "1", transform: "translateY(-10px)" },
    },
    "pulse-slower": {
      "0%, 100%": { opacity: "0.5", transform: "translateY(0px)" },
      "50%": { opacity: "1", transform: "translateY(10px)" },
    },
    "gradient-x": {
      "0%, 100%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
    },
  },
  animation: {
    "pulse-slow": "pulse-slow 8s ease-in-out infinite",
    "pulse-slower": "pulse-slower 14s ease-in-out infinite",
    "gradient-x": "gradient-x 8s ease infinite",
  },
}
    },
  },
  plugins: [typography],
});
