'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

// Individual orb component that follows cursor
function AuroraOrb({ 
  size, 
  color, 
  delay, 
  baseX, 
  baseY, 
  offset,
  isHovering 
}: { 
  size: number
  color: string
  delay: number
  baseX: any
  baseY: any
  offset: { x: number; y: number }
  isHovering: boolean
}) {
  // Apply offset to base position
  const x = useTransform(baseX, (latest: number) => latest + offset.x)
  const y = useTransform(baseY, (latest: number) => latest + offset.y)

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, ${color.replace(/[\d.]+\)$/g, '0)')} 100%)`,
        filter: 'blur(80px)',
        x: x,
        y: y,
        left: -size / 2,
        top: -size / 2,
        mixBlendMode: 'screen',
      }}
      animate={{
        scale: isHovering ? [1, 1.08, 1] : 1,
        opacity: isHovering ? [0.3, 0.4, 0.3] : 0.25,
      }}
      transition={{
        duration: 10, // Very slow pulse
        repeat: Infinity,
        ease: 'easeInOut',
        delay: delay,
      }}
    />
  )
}

export default function AuroraEffect() {
  const [isHovering, setIsHovering] = useState(false)

  // Smooth spring animations for cursor following
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)

  // Use spring for very smooth, slow movement - very high damping for slow response
  const springConfig = { damping: 80, stiffness: 30 } // Very slow and smooth
  const x = useSpring(cursorX, springConfig)
  const y = useSpring(cursorY, springConfig)

  useEffect(() => {
    // Initialize to center of screen
    cursorX.set(window.innerWidth / 2)
    cursorY.set(window.innerHeight / 2)

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
      setIsHovering(true)
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [cursorX, cursorY])

  // Create multiple gradient orbs that follow the cursor slowly
  const orbs = [
    { size: 500, color: 'rgba(59, 130, 246, 0.25)', offset: { x: 0, y: 0 } }, // blue - more visible
    { size: 450, color: 'rgba(139, 92, 246, 0.22)', offset: { x: -100, y: -60 } }, // purple
    { size: 400, color: 'rgba(236, 72, 153, 0.20)', offset: { x: 100, y: 60 } }, // pink
    { size: 350, color: 'rgba(16, 185, 129, 0.18)', offset: { x: -50, y: 100 } }, // green
  ]

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ mixBlendMode: 'screen' }}>
      {orbs.map((orb, index) => (
        <AuroraOrb
          key={index}
          size={orb.size}
          color={orb.color}
          delay={index * 0.2}
          baseX={x}
          baseY={y}
          offset={orb.offset}
          isHovering={isHovering}
        />
      ))}

      {/* Additional floating orbs for ambient effect - very slow */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          className="absolute rounded-full blur-3xl"
          style={{
            width: 300 + i * 80,
            height: 300 + i * 80,
            background: `rgba(${59 + i * 20}, ${130 + i * 10}, ${246 - i * 30}, 0.15)`,
            left: `${20 + i * 30}%`,
            top: `${30 + i * 20}%`,
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, 30, 0],
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 20 + i * 5, // Very slow floating
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 3,
          }}
        />
      ))}
    </div>
  )
}
