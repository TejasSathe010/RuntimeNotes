import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-surface-light via-white to-surface-light dark:from-surface-dark dark:via-neutral-900 dark:to-surface-dark transition-colors duration-700">
      {/* ---------- Header Section ---------- */}
      <section className="relative overflow-hidden text-center pt-28 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(66,133,244,0.06),transparent_60%),_radial-gradient(ellipse_at_bottom_left,_rgba(52,168,83,0.06),transparent_60%)] pointer-events-none" />

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-4xl sm:text-5xl font-display font-extrabold tracking-tight
                     bg-gradient-to-r from-[#4285F4] via-[#34A853] via-40% via-[#FBBC05] to-[#EA4335]
                     bg-clip-text text-transparent animate-gradient-x"
        >
          About Daily Tech Chronicles
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 mt-6 max-w-2xl mx-auto text-lg leading-relaxed text-neutral-600 dark:text-neutral-400"
        >
          Hi, I’m <strong>Tejas Sathe</strong>. This blog is my personal journal, where I share what I learn
          about <strong>System Design</strong>, <strong>GenAI</strong>, <strong>Architecture</strong>, and{" "}
          <strong>DSA</strong> in a simple and practical way.
        </motion.p>
      </section>

      {/* ---------- Body Section ---------- */}
      <section className="max-w-3xl mx-auto px-6 sm:px-10 py-12 text-left text-neutral-700 dark:text-neutral-300">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <p>
            I started <strong>Daily Tech Chronicles</strong> to document my growth as a developer and to make
            complex topics easier for others to understand. It’s a space where I break down real-world
            engineering problems and share how I approach them.
          </p>

          <p>
            Most of what I write comes from hands-on experience: scaling APIs, working with distributed
            systems, building GenAI integrations, and solving challenging DSA problems.
          </p>

          <blockquote className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 rounded-lg px-5 py-4 not-italic">
            “Good architecture is about finding simplicity in complexity.”
          </blockquote>

          <h2 className="text-2xl font-semibold mt-10">What You’ll Find Here</h2>
          <ul>
            <li>🔹 Simple breakdowns of complex <strong>System Design</strong> concepts</li>
            <li>🔹 Hands-on projects using <strong>GenAI</strong> and modern frameworks</li>
            <li>🔹 Clean, example-driven <strong>code tutorials</strong></li>
            <li>🔹 Real lessons from building and debugging systems</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10">About Me</h2>
          <p>
            I’m a software developer who loves building systems that are both scalable and elegant. I’ve worked
            across backend, frontend, and AI pipelines, always looking for ways to connect theory with real-world
            engineering.
          </p>

          <p>
            When I’m not coding, I enjoy open-source work, mentoring developers, and learning from the amazing
            engineering community around the world.
          </p>

          <p>
            You can find my projects and updates on{" "}
            <a
              href="https://github.com/tejassathe010"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-medium"
            >
              GitHub
            </a>{" "}
            or connect with me on{" "}
            <a
              href="https://www.linkedin.com/in/tejas-sathe010/"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-medium"
            >
              LinkedIn
            </a>
            .
          </p>
        </motion.div>
      </section>
    </main>
  );
}
