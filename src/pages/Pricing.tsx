import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen px-6 pt-24 pb-16 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-xl text-center"
      >
        <Sparkles className="mx-auto h-6 w-6 text-accent" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Reprompta is 100% free</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Every feature — unlimited image and video analysis, history, model comparison, batch, and export — is now free for everyone.
          Just create an account to get started.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/analyze"
            className="flex h-11 items-center rounded-md bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Start analyzing
          </Link>
          <Link
            to="/auth"
            className="flex h-11 items-center rounded-md border border-border px-6 text-sm font-semibold transition-colors hover:bg-secondary"
          >
            Create account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
