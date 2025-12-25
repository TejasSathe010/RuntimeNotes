import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Github, Linkedin } from "lucide-react";

export default function About() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-[100dvh] bg-gradient-to-b from-surface-light via-white to-surface-light dark:from-surface-dark dark:via-neutral-950 dark:to-surface-dark transition-colors duration-700">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden">
        {/* subtle background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(66,133,244,0.12),transparent_55%),radial-gradient(ellipse_at_bottom,_rgba(52,168,83,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/75 via-white/60 to-white/85 dark:from-neutral-950/70 dark:via-neutral-950/40 dark:to-neutral-950/80" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-10 sm:pb-14">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="text-center"
          >
            <p className="text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase text-neutral-500 dark:text-neutral-400">
              About
            </p>

            <h1 className="mt-3 text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% via-[#FBBC05] to-[#EA4335] bg-clip-text text-transparent">
              Daily Tech Chronicles
            </h1>

            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-neutral-700/90 dark:text-neutral-300">
              Hi, I’m <span className="font-semibold text-neutral-900 dark:text-neutral-50">Tejas Sathe</span>.
              This is where I document real engineering lessons from building{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-50">systems</span>, not just
              shipping code.
            </p>

            {/* quick badges */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {["System Design", "GenAI", "Architecture", "DSA"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 px-3 py-1 text-xs font-semibold text-neutral-700 dark:text-neutral-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- CONTENT CARD ---------- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-900 shadow-[0_18px_55px_rgba(15,23,42,0.10)] dark:shadow-[0_18px_55px_rgba(0,0,0,0.45)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/8 via-transparent to-transparent" />

          <div className="grid gap-8 lg:grid-cols-[1fr_320px] p-6 sm:p-10">
            {/* left */}
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                What I write about
              </h2>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                I started <span className="font-semibold">Daily Tech Chronicles</span> to document my growth
                and to make complex topics feel approachable—without losing the real-world details.
              </p>

              <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
                Most posts come from building and debugging production-ish systems: scaling APIs, working with
                distributed flows, integrating Stripe-like billing models, and doing DSA the right way.
              </p>

              {/* quote */}
              <div className="mt-6 rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/70 dark:bg-neutral-950/35 p-5">
                <div className="border-l-2 border-primary/70 pl-4 text-sm sm:text-base leading-relaxed text-neutral-900 dark:text-neutral-50">
                  “Good architecture is about finding simplicity in complexity.”
                </div>
              </div>

              {/* list */}
              <h3 className="mt-8 text-sm font-semibold tracking-[0.14em] uppercase text-neutral-500 dark:text-neutral-400">
                You’ll find
              </h3>
              <ul className="mt-3 space-y-2 text-sm sm:text-base text-neutral-800 dark:text-neutral-200">
                {[
                  ["System Design", "clean breakdowns + real tradeoffs"],
                  ["GenAI", "hands-on integrations + pragmatic patterns"],
                  ["Code tutorials", "example-driven, readable, production-minded"],
                  ["Debug diaries", "what broke, why it broke, and what fixed it"],
                ].map(([k, v]) => (
                  <li key={k} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80 shrink-0" />
                    <span className="min-w-0">
                      <span className="font-semibold text-neutral-900 dark:text-neutral-50">{k}</span>{" "}
                      <span className="text-neutral-600 dark:text-neutral-400">— {v}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* right */}
            <aside className="lg:border-l lg:border-neutral-200/70 lg:dark:border-neutral-800/70 lg:pl-8">
              <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/50 p-5">
                <p className="text-[0.72rem] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                  About me
                </p>

                <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  I like building systems that stay fast, understandable, and resilient as they grow.
                </p>

                <div className="mt-4 grid gap-2">
                  <a
                    href="https://github.com/tejassathe010"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-between rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/60 px-4 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:border-primary/40 hover:text-primary transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </span>
                    <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </a>

                  <a
                    href="https://www.linkedin.com/in/tejas-sathe010/"
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center justify-between rounded-xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-900/60 px-4 py-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:border-blue-500/40 hover:text-blue-500 transition-colors"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Linkedin className="h-4 w-4" />
                      LinkedIn
                    </span>
                    <ArrowUpRight className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                  </a>
                </div>

                <div className="mt-5 rounded-xl bg-neutral-50/80 dark:bg-neutral-950/35 p-4">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-50">
                    Writing philosophy
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                    Clear mental models, practical patterns, and honest tradeoffs—no fluff.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
