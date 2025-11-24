'use client';

import { useState } from 'react';

export default function InfoHoverCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="fixed top-4 left-4 z-50"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="text-sm text-zinc-700 dark:text-zinc-300 cursor-default">
        @ctondryk.dev
      </div>

      {isOpen && (
        <>
          {/* Invisible bridge to prevent hover gap */}
          <div className="absolute top-full left-0 w-80 h-2" />
          <div
            className="absolute top-full left-0 mt-2 w-80 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              @ctondryk.dev
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              a food nutrition and comparison tool.            </p>
            <a
              href="https://ctondryk.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              portfolio.ctondryk.dev
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
