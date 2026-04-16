"use client";

import { useState } from "react";
import Link from "next/link";

interface MobileNavProps {
  parents: string[];
}

export default function MobileNav({ parents }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  function folderLabel(input: string): string {
    return input.replaceAll("_", " ").replace(/\b\w/g, (s) => s.toUpperCase());
  }

  return (
    <>
      {/* Hamburger Button - Mobile Only */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden p-2 rounded-md hover:bg-zinc-100 transition"
        aria-label="Toggle menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-10 bg-white border-b border-[var(--line)]">
          <nav className="mx-auto w-full max-w-7xl px-4 py-4 space-y-3">
            {/* Main Navigation */}
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/tools"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 transition"
            >
              Tools
            </Link>

            {/* Folder Links */}
            <hr className="my-2" />
            <p className="px-3 py-1 text-xs uppercase font-semibold text-zinc-600">
              Browse Export
            </p>
            <div className="space-y-1">
              {parents.map((folder) => (
                <Link
                  key={folder}
                  href={`/data/${folder}`}
                  onClick={() => setIsOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-orange-50 hover:text-orange-600 transition"
                >
                  {folderLabel(folder)}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
