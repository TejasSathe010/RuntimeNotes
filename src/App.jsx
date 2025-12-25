import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./components/Navbar";
import { RouteEffects } from "./RouteEffects";
import { AnimatedRoutes } from "./AnimatedRoutes";
import { Footer } from "./Footer";

export default function App() {
  return (
    <Router>
      <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        <Navbar />
        <RouteEffects />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedRoutes />
        </div>

        <Footer />
      </div>
    </Router>
  );
}
