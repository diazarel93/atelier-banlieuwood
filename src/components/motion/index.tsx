"use client"

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  type Variants,
} from "motion/react"
import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"

/* ═══════════════════════════════════════════════════════════════
   FADE IN — fade + directional slide, triggered on scroll
   ═══════════════════════════════════════════════════════════════ */

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  className?: string
}

const directionOffsets: Record<string, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up",
  className,
}: FadeInProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-48px" })
  const offset = directionOffsets[direction]

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 1 } : { opacity: 0, x: offset.x, y: offset.y }}
      animate={
        isInView
          ? { opacity: 1, x: 0, y: 0 }
          : reduced
            ? { opacity: 1 }
            : { opacity: 0, x: offset.x, y: offset.y }
      }
      transition={
        reduced
          ? { duration: 0 }
          : { duration, delay, ease: [0.4, 0, 0.2, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STAGGER CONTAINER + ITEM — sequentially animate children
   ═══════════════════════════════════════════════════════════════ */

interface StaggerContainerProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
}

const containerVariants = (staggerDelay: number, reduced: boolean): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: reduced ? 0 : staggerDelay,
    },
  },
})

const itemVariants = (reduced: boolean): Variants => ({
  hidden: reduced ? { opacity: 1 } : { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduced
      ? { duration: 0 }
      : { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
})

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerContainerProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-32px" })

  return (
    <motion.div
      ref={ref}
      variants={containerVariants(staggerDelay, !!reduced)}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div variants={itemVariants(!!reduced)} className={className}>
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SCALE REVEAL — scale from 0.92 to 1 with fade
   ═══════════════════════════════════════════════════════════════ */

interface ScaleRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function ScaleReveal({
  children,
  delay = 0,
  duration = 0.45,
  className,
}: ScaleRevealProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-32px" })

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.92 }}
      animate={
        isInView
          ? { opacity: 1, scale: 1 }
          : reduced
            ? { opacity: 1 }
            : { opacity: 0, scale: 0.92 }
      }
      transition={
        reduced
          ? { duration: 0 }
          : { duration, delay, ease: [0.4, 0, 0.2, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   PARALLAX LAYER — element moves at different scroll speed
   ═══════════════════════════════════════════════════════════════ */

interface ParallaxLayerProps {
  children: ReactNode
  /** Speed percentage: negative = slower, positive = faster. Range: -50 to 50. */
  speed?: number
  className?: string
}

export function ParallaxLayer({
  children,
  speed = 10,
  className,
}: ParallaxLayerProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  const clampedSpeed = Math.max(-50, Math.min(50, speed))
  const yRange = reduced ? 0 : clampedSpeed
  const y = useTransform(scrollYProgress, [0, 1], [`${yRange}%`, `${-yRange}%`])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   COUNT UP — animated number counter
   ═══════════════════════════════════════════════════════════════ */

interface CountUpProps {
  from?: number
  to: number
  duration?: number
  suffix?: string
  className?: string
}

export function CountUp({
  from = 0,
  to,
  duration = 1.5,
  suffix = "",
  className,
}: CountUpProps) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(reduced ? to : from)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    if (reduced) {
      setValue(to)
      return
    }

    const startTime = performance.now()
    const startValue = from

    function tick(now: number) {
      const elapsed = (now - startTime) / 1000
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (to - startValue) * eased)
      setValue(current)
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    requestAnimationFrame(tick)
  }, [isInView, from, to, duration, reduced])

  return (
    <span ref={ref} className={className}>
      {value}
      {suffix}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TYPEWRITER — text typed character by character
   ═══════════════════════════════════════════════════════════════ */

interface TypeWriterProps {
  text: string
  speed?: number
  delay?: number
  className?: string
  /** Called when typing finishes */
  onComplete?: () => void
}

export function TypeWriter({
  text,
  speed = 40,
  delay = 0,
  className,
  onComplete,
}: TypeWriterProps) {
  const reduced = useReducedMotion()
  const [displayed, setDisplayed] = useState(reduced ? text : "")
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })
  const hasStarted = useRef(false)

  useEffect(() => {
    if (!isInView || hasStarted.current) return
    hasStarted.current = true

    if (reduced) {
      setDisplayed(text)
      onComplete?.()
      return
    }

    let index = 0
    const delayTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        index++
        setDisplayed(text.slice(0, index))
        if (index >= text.length) {
          clearInterval(interval)
          onComplete?.()
        }
      }, speed)
    }, delay)

    return () => clearTimeout(delayTimeout)
  }, [isInView, text, speed, delay, reduced, onComplete])

  return (
    <span ref={ref} className={className}>
      {displayed}
      {!reduced && displayed.length < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.6, repeatType: "reverse" }}
          className="inline-block w-[2px] h-[1em] bg-bw-primary align-middle ml-0.5"
        />
      )}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   GLOW PULSE — pulsating glow behind element
   ═══════════════════════════════════════════════════════════════ */

interface GlowPulseProps {
  children: ReactNode
  color?: string
  intensity?: "subtle" | "medium" | "strong"
  className?: string
}

const glowConfig: Record<string, { blur: number; opacity: [number, number] }> = {
  subtle: { blur: 20, opacity: [0.15, 0.25] },
  medium: { blur: 32, opacity: [0.2, 0.4] },
  strong: { blur: 48, opacity: [0.3, 0.55] },
}

export function GlowPulse({
  children,
  color = "#FF6B35",
  intensity = "medium",
  className,
}: GlowPulseProps) {
  const reduced = useReducedMotion()
  const config = glowConfig[intensity]

  return (
    <div className={cn("relative inline-flex", className)}>
      {!reduced && (
        <motion.div
          className="absolute inset-0 rounded-[inherit] pointer-events-none"
          animate={{ opacity: config.opacity }}
          transition={{
            repeat: Infinity,
            repeatType: "reverse",
            duration: 2,
            ease: "easeInOut",
          }}
          style={{
            background: color,
            filter: `blur(${config.blur}px)`,
            zIndex: -1,
          }}
        />
      )}
      {children}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CINEMA REVEAL — iris-out circle expanding from center
   ═══════════════════════════════════════════════════════════════ */

interface CinemaRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function CinemaReveal({
  children,
  delay = 0,
  duration = 0.8,
  className,
}: CinemaRevealProps) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-48px" })
  const id = useRef(`iris-${Math.random().toString(36).slice(2, 9)}`).current

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <svg className="absolute" width="0" height="0" aria-hidden="true">
        <defs>
          <clipPath id={id} clipPathUnits="objectBoundingBox">
            <motion.circle
              cx="0.5"
              cy="0.5"
              initial={{ r: 0 }}
              animate={isInView ? { r: 0.75 } : { r: 0 }}
              transition={{
                duration,
                delay,
                ease: [0.4, 0, 0.2, 1],
              }}
            />
          </clipPath>
        </defs>
      </svg>
      <div
        style={{
          clipPath: `url(#${id})`,
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SLIDE PANEL — slides in from a direction
   ═══════════════════════════════════════════════════════════════ */

interface SlidePanelProps {
  children: ReactNode
  from?: "left" | "right" | "bottom" | "top"
  isOpen: boolean
  className?: string
  /** Overlay click handler */
  onClose?: () => void
}

const slideOffsets: Record<string, { x?: string; y?: string }> = {
  left: { x: "-100%" },
  right: { x: "100%" },
  top: { y: "-100%" },
  bottom: { y: "100%" },
}

export function SlidePanel({
  children,
  from = "right",
  isOpen,
  className,
  onClose,
}: SlidePanelProps) {
  const reduced = useReducedMotion()
  const offset = slideOffsets[from]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduced ? { duration: 0 } : { duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Panel */}
          <motion.div
            initial={reduced ? { opacity: 0 } : { ...offset, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { ...offset, opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    type: "spring",
                    damping: 26,
                    stiffness: 300,
                  }
            }
            className={cn(
              "fixed z-50",
              from === "left" && "inset-y-0 left-0",
              from === "right" && "inset-y-0 right-0",
              from === "top" && "inset-x-0 top-0",
              from === "bottom" && "inset-x-0 bottom-0",
              className
            )}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
