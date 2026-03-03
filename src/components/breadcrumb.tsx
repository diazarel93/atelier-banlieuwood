"use client";

import Link from "next/link";
import { motion } from "motion/react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm"
      aria-label="Navigation"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-2">
            {i > 0 && (
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="text-bw-placeholder/60"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="text-bw-muted hover:text-bw-primary transition-colors duration-200"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-bw-heading font-medium"
                    : "text-bw-muted"
                }
              >
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </motion.nav>
  );
}
