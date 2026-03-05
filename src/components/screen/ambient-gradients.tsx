"use client";

import { motion } from "motion/react";

export interface AmbientGradientsProps {
  moduleColor: string;
}

export function AmbientGradients({ moduleColor }: AmbientGradientsProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        key={`amb-tl-${moduleColor}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -top-16 -left-16 w-[480px] h-[480px]"
        style={{ background: `radial-gradient(ellipse at center, ${moduleColor}10 0%, transparent 70%)` }}
      />
      <motion.div
        key={`amb-br-${moduleColor}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute -bottom-16 -right-16 w-[480px] h-[480px]"
        style={{ background: `radial-gradient(ellipse at center, ${moduleColor}0D 0%, transparent 70%)` }}
      />
      <motion.div
        key={`amb-ct-${moduleColor}`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px]"
        style={{ background: `radial-gradient(ellipse at center, ${moduleColor}08 0%, transparent 60%)` }}
      />
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
      {/* Floating dust particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-white/[0.04]"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${15 + i * 14}%`,
            top: `${10 + (i * 17) % 80}%`,
          }}
          animate={{
            y: [0, -30 - i * 10, 0],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}
