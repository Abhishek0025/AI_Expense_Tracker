'use client'

import { useEffect, useRef } from 'react'

export default function FloatingColors() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Mouse position
    const mouse = { x: 0, y: 0 }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Floating particles
    interface Particle {
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
      opacity: number
    }

    const particles: Particle[] = []
    const colors = [
      'rgba(59, 130, 246, 0.6)', // blue
      'rgba(16, 185, 129, 0.6)', // green
      'rgba(139, 92, 246, 0.6)', // purple
      'rgba(236, 72, 153, 0.6)', // pink
      'rgba(251, 146, 60, 0.6)', // orange
      'rgba(34, 197, 94, 0.6)',  // emerald
    ]

    // Create particles
    for (let i = 0; i < 20; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 100 + 50,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.3 + 0.1,
      })
    }

    let animationFrame: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Move towards mouse with some randomness
        const dx = mouse.x - particle.x
        const dy = mouse.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        
        if (distance > 0) {
          particle.vx += (dx / distance) * 0.01
          particle.vy += (dy / distance) * 0.01
        }

        // Apply velocity
        particle.x += particle.vx
        particle.y += particle.vy

        // Boundary bounce
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Damping
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Draw particle with gradient
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.radius
        )
        gradient.addColorStop(0, particle.color.replace('0.6', String(particle.opacity)))
        gradient.addColorStop(1, particle.color.replace('0.6', '0'))

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}

