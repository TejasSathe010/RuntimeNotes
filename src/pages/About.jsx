import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  Linkedin,
  MapPin,
  Mail,
  Sparkles,
  Command,
} from "lucide-react";

export default function About() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1], delay },
  });

  return (
    <main className="min-h-[85vh] flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6 py-12 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[500px]"
      >
        {/* Profile Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm p-8 sm:p-10">

          {/* Subtle Gradient Glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-100/30 dark:bg-primary-900/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center text-center">

            {/* Avatar */}
            <motion.div
              {...fadeUp(0.1)}
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="relative h-24 w-24 rounded-full border-2 border-white dark:border-neutral-800 shadow-md overflow-hidden"
            >
              <img
                src="https://github.com/tejassathe010.png"
                alt="Tejas Sathe"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 dark:ring-white/10 rounded-full" />
            </motion.div>

            {/* Name & Role */}
            <motion.div {...fadeUp(0.2)} className="mt-6">
              <h1 className="text-2xl font-display font-bold text-neutral-900 dark:text-neutral-50 tracking-tight">
                Tejas Sathe
              </h1>
              <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                Software Engineer
              </p>
            </motion.div>

            {/* Bio */}
            <motion.div {...fadeUp(0.3)} className="mt-6 max-w-sm mx-auto">
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Building systems that scale. Writing about the messy reality of engineering failures, tradeoffs, and patterns that stick.
              </p>
            </motion.div>

            {/* Traits / Stats */}
            <motion.div {...fadeUp(0.4)} className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                { icon: Sparkles, label: "System Design" },
                { icon: Command, label: "GenAI" },
                { icon: MapPin, label: "Austin, TX" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/70 dark:border-neutral-800/70 bg-neutral-50/50 dark:bg-neutral-800/50 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  <item.icon className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                  {item.label}
                </div>
              ))}
            </motion.div>

            {/* Links */}
            <motion.div {...fadeUp(0.5)} className="mt-10 flex items-center justify-center gap-3 w-full">
              <a
                href="https://github.com/tejassathe010"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 active:translate-y-px transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/tejas-sathe010/"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-neutral-900 dark:bg-white text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 active:translate-y-px transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
              >
                <Linkedin className="h-4 w-4" />
                Connect
              </a>
            </motion.div>

            {/* Footer Note */}
            <motion.div {...fadeUp(0.6)} className="mt-8 pt-8 border-t border-neutral-100 dark:border-neutral-800 w-full">
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-wider"
              >
                Read the notes <ArrowUpRight className="h-3 w-3" />
              </Link>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </main>
  );
}