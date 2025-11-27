'use client';

import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroProps {
  onScrollToApp: () => void;
}

// Mini example cards to show the concept
function MiniCard({ name, calories, protein, highlighted }: { name: string; calories: number; protein: number; highlighted?: boolean }) {
  return (
    <div className={`w-24 sm:w-32 p-2.5 sm:p-3 rounded-lg border ${highlighted ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
      <div className="text-[10px] sm:text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate mb-2">
        {name}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-[9px] sm:text-[10px]">
          <span className="text-zinc-500">calories</span>
          <span className={`font-medium ${highlighted ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{calories}</span>
        </div>
        <div className="flex justify-between text-[9px] sm:text-[10px]">
          <span className="text-zinc-500">protein</span>
          <span className={`font-medium ${highlighted ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-700 dark:text-zinc-300'}`}>{protein}g</span>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ onScrollToApp }: HeroProps) {
  return (
    <section className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-between px-6 pt-12 bg-zinc-50 dark:bg-zinc-950"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 4rem)' }}
    >
      {/* Spacer for top */}
      <div className="flex-1" />

      {/* Main content - centered */}
      <div className="max-w-md mx-auto text-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3"
        >
          food battle
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed"
        >
          compare nutrition facts side by side.
          <br />
          make informed food choices.
        </motion.p>

        {/* Example UI */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center gap-3 mb-8"
        >
          <MiniCard name="chicken breast" calories={165} protein={31} />
          <div className="flex items-center text-zinc-300 dark:text-zinc-600 text-lg font-light">vs</div>
          <MiniCard name="salmon fillet" calories={208} protein={20} highlighted />
        </motion.div>

        {/* Hint text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-xs text-zinc-400 dark:text-zinc-500"
        >
          add foods to compare their macros
        </motion.p>
      </div>

      {/* Spacer + scroll indicator at bottom */}
      <div className="flex-1 flex flex-col justify-end">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={onScrollToApp}
          className="flex flex-col items-center gap-1 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
        >
          <span className="text-xs">start comparing</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
}
