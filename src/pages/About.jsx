import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Sparkles,
  Layers,
  Bug,
  Rocket,
  BookOpen,
  ShieldCheck,
} from "lucide-react";
import ArchitecturalMesh from "../components/ArchitecturalMesh";
import ParticleField from "../components/ParticleField";

const TAGS = ["System Design", "GenAI", "Architecture", "DSA"];

const PILLARS = [
  {
    icon: Layers,
    title: "System Design",
    desc: "Clean mental models + real tradeoffs, with failure modes and scaling constraints.",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Sparkles,
    title: "GenAI in Practice",
    desc: "RAG, agents, evals, and patterns that survive real-world product constraints.",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Bug,
    title: "Debug Diaries",
    desc: "What broke, why it broke, and the smallest fix that actually holds in production.",
    color: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: BookOpen,
    title: "Readable Tutorials",
    desc: "Example-driven learning with structure, clarity, and copy-pasteable snippets.",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Truth over hype",
    desc: "Honest assumptions, edge cases, and why some 'best practices' don't generalize.",
  },
  {
    icon: Rocket,
    title: "Ship quality",
    desc: "Performance, accessibility, and maintainability — not just passing the happy path.",
  },
];

export default function About() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay },
  });

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-surface-light via-white to-surface-light dark:from-surface-dark dark:via-neutral-950 dark:to-surface-dark transition-colors duration-700">
      {/* Skip link */}
      <a
        href="#about-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[60]
                   rounded-md bg-white px-3 py-2 text-sm font-medium text-neutral-900 shadow-lg
                   ring-1 ring-neutral-200 dark:bg-neutral-950 dark:text-neutral-50 dark:ring-neutral-800"
      >
        Skip to content
      </a>

      {/* ---------- HERO ---------- */}
      <section className="relative isolate overflow-hidden border-b border-neutral-200/60 dark:border-neutral-800/60">
        {/* Background effects */}
        {!reduceMotion && (
          <div className="pointer-events-none absolute inset-0 z-0">
            <ParticleField quality="auto" />
            <div className="hidden sm:block">
              <ArchitecturalMesh quality="auto" />
            </div>
          </div>
        )}

        {/* Gradient overlays */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(66,133,244,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(52,168,83,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-white/85 dark:from-neutral-950/75 dark:via-neutral-950/50 dark:to-neutral-950/85" />
        </div>

        <div className="relative z-20 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16">
          {/* Top row */}
          <motion.div
            {...fadeUp(0)}
            className="flex items-center justify-between gap-3"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70 bg-white/80 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] uppercase text-neutral-600 dark:text-neutral-300 shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              About
            </p>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                         bg-white/80 dark:bg-neutral-900/60 px-3 py-1.5 text-xs font-medium
                         text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Explore posts <ArrowUpRight className="h-4 w-4 opacity-70" />
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div {...fadeUp(0.08)} className="mt-8 text-center">
            <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold tracking-tight leading-[1.04]">
              <span className="bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335] bg-clip-text text-transparent">
                RuntimeNotes
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-[1.05rem] sm:text-[1.15rem] leading-[1.75] text-neutral-700/90 dark:text-neutral-300">
              Hi, I'm{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                Tejas Sathe
              </span>
              . This is where I document real engineering lessons from building{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">
                systems
              </span>
              , not just shipping code.
            </p>

            {/* Quick tags */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
              {TAGS.map((t, idx) => (
                <motion.span
                  key={t}
                  {...fadeUp(0.12 + idx * 0.04)}
                  className="inline-flex items-center rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                             bg-white/85 dark:bg-neutral-900/60 px-4 py-1.5 text-sm font-semibold
                             text-neutral-700 dark:text-neutral-200 shadow-sm
                             hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {t}
                </motion.span>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.div {...fadeUp(0.2)}>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3
                             bg-primary text-black shadow-[0_14px_40px_rgba(66,133,244,0.20)] 
                             hover:shadow-[0_18px_55px_rgba(66,133,244,0.28)]
                             hover:-translate-y-0.5 transition-all duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 font-medium"
                >
                  Start reading <ArrowUpRight className="h-4 w-4" />
                </Link>
              </motion.div>

              <motion.div {...fadeUp(0.24)}>
                <a
                  href="https://github.com/tejassathe010"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3
                             border border-neutral-200/70 dark:border-neutral-800/70 bg-white/85 dark:bg-neutral-900/60
                             text-neutral-800 dark:text-neutral-200 hover:border-primary/40 hover:text-primary 
                             transition-colors duration-200
                             focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 font-medium"
                >
                  <Github className="h-4 w-4" />
                  GitHub
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- CONTENT ---------- */}
      <section
        id="about-content"
        className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
      >
        <motion.div
          {...fadeUp(0.1)}
          className="relative overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70
                     bg-white dark:bg-neutral-900 shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
        >
          {/* Top accent */}
          <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#EA4335] opacity-60" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] p-6 sm:p-10 lg:p-12">
            {/* LEFT */}
            <div className="min-w-0 space-y-8">
              <div>
                <h2
                  id="writing"
                  className="scroll-mt-28 text-[1.35rem] sm:text-[1.5rem] font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
                >
                  What I write about
                </h2>

                <p className="mt-4 text-[1.0rem] sm:text-[1.05rem] leading-[1.75] text-neutral-700 dark:text-neutral-300">
                  I started <span className="font-semibold text-neutral-900 dark:text-neutral-50">RuntimeNotes</span>{" "}
                  to make complex topics feel approachable—without losing the
                  real-world details.
                </p>

                <p className="mt-4 text-[1.0rem] sm:text-[1.05rem] leading-[1.75] text-neutral-700 dark:text-neutral-300">
                  Most posts come from building and debugging production-ish
                  systems: scaling APIs, distributed flows, billing models, and
                  doing DSA the right way.
                </p>
              </div>

              {/* Pillars */}
              <div className="grid gap-4 sm:grid-cols-2">
                {PILLARS.map(({ icon: PillarIcon, title, desc, color }, idx) => (
                  <motion.div
                    key={title}
                    {...fadeUp(0.15 + idx * 0.05)}
                    whileHover={reduceMotion ? undefined : { y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="group relative overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70
                               bg-gradient-to-br from-neutral-50/80 to-white dark:from-neutral-950/40 dark:to-neutral-900/60
                               p-5 hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                    <div className="relative flex items-start gap-4">
                      <div className="mt-0.5 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 
                                      bg-white/90 dark:bg-neutral-900/70 p-2.5 shadow-sm
                                      group-hover:border-primary/40 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors">
                        <PillarIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                          {title}
                        </p>
                        <p className="mt-2 text-sm leading-[1.65] text-neutral-600 dark:text-neutral-400">
                          {desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quote */}
              <motion.div
                {...fadeUp(0.3)}
                className="relative overflow-hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 
                           bg-gradient-to-br from-primary/5 via-transparent to-transparent
                           dark:from-primary/10 dark:via-transparent dark:to-transparent
                           p-6 shadow-sm"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-primary via-primary/60 to-transparent" />
                <div className="pl-5 text-[1.05rem] sm:text-[1.1rem] leading-[1.75] text-neutral-900 dark:text-neutral-50 font-medium">
                  "Good architecture is about finding simplicity in complexity."
                </div>
              </motion.div>

              {/* Principles */}
              <div>
                <h3
                  id="principles"
                  className="scroll-mt-28 text-xs font-semibold tracking-[0.16em] uppercase text-neutral-500 dark:text-neutral-400 mb-4"
                >
                  How I think about writing
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {PRINCIPLES.map(({ icon: PrincipleIcon, title, desc }, idx) => (
                    <motion.div
                      key={title}
                      {...fadeUp(0.35 + idx * 0.05)}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 
                                 bg-white/75 dark:bg-neutral-900/60 p-5
                                 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 
                                        bg-white/90 dark:bg-neutral-900/70 p-2.5 shadow-sm">
                          <PrincipleIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
                            {title}
                          </p>
                          <p className="mt-2 text-sm leading-[1.65] text-neutral-600 dark:text-neutral-400">
                            {desc}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile nav */}
              <div className="lg:hidden rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/75 dark:bg-neutral-900/60 p-5 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 mb-3">
                  Jump to
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { href: "#writing", label: "What I write" },
                    { href: "#principles", label: "Principles" },
                  ].map((s) => (
                    <a
                      key={s.href}
                      href={s.href}
                      className="inline-flex items-center rounded-full border border-neutral-200/70 dark:border-neutral-800/70
                                 bg-neutral-50/80 dark:bg-neutral-950/30 px-3 py-1.5 text-xs font-semibold
                                 text-neutral-700 dark:text-neutral-200 hover:border-primary/40 hover:text-primary 
                                 transition-colors duration-200
                                 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="lg:sticky lg:top-24 self-start space-y-4">
              <motion.div
                {...fadeUp(0.2)}
                className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 
                           bg-white/85 dark:bg-neutral-900/60 p-6 shadow-sm"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 mb-3">
                  About me
                </p>

                <p className="text-[0.95rem] leading-[1.7] text-neutral-700 dark:text-neutral-300">
                  I like building systems that stay fast, understandable, and
                  resilient as they grow.
                </p>

                {/* Quick nav (desktop) */}
                <div className="mt-6 hidden lg:block">
                  <p className="text-xs uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400 mb-3">
                    On this page
                  </p>
                  <nav className="space-y-1">
                    {[
                      { href: "#writing", label: "What I write" },
                      { href: "#principles", label: "Principles" },
                    ].map((s) => (
                      <a
                        key={s.href}
                        href={s.href}
                        className="block rounded-xl px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200
                                   hover:bg-neutral-100/70 dark:hover:bg-neutral-900/50 hover:text-primary 
                                   transition-colors duration-200
                                   focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {s.label}
                      </a>
                    ))}
                  </nav>
                </div>

                {/* Social links */}
                <div className="mt-6 grid gap-2.5">
                  <a
                    href="https://github.com/tejassathe010"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-between rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/75 dark:bg-neutral-900/60 px-4 py-2.5 text-sm font-medium
                               text-neutral-800 dark:text-neutral-200 hover:border-primary/40 hover:text-primary 
                               transition-colors duration-200
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </span>
                    <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/tejas-sathe010/"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-between rounded-xl border border-neutral-200/70 dark:border-neutral-800/70
                               bg-white/75 dark:bg-neutral-900/60 px-4 py-2.5 text-sm font-medium
                               text-neutral-800 dark:text-neutral-200 hover:border-blue-500/40 hover:text-blue-500 
                               transition-colors duration-200
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </span>
                    <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>

                {/* Philosophy card */}
                <div className="mt-6 rounded-xl bg-gradient-to-br from-neutral-50/80 to-white dark:from-neutral-950/40 dark:to-neutral-900/60 
                                p-4 border border-neutral-200/70 dark:border-neutral-800/70">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-50 mb-2">
                    Writing philosophy
                  </p>
                  <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Clear mental models, practical patterns, and honest
                    tradeoffs—no fluff.
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-6">
                  <Link
                    to="/"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3
                               bg-primary text-black shadow-[0_14px_40px_rgba(66,133,244,0.18)]
                               hover:shadow-[0_18px_55px_rgba(66,133,244,0.22)] hover:-translate-y-0.5 
                               transition-all duration-200
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 font-medium"
                  >
                    Read posts <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </aside>
          </div>
        </motion.div>
      </section>
    </main>
  );
}