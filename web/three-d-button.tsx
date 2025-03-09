"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, RoundedBox } from "@react-three/drei"
import { Vector3, type Color } from "three"
import { easing } from "maath"

interface ButtonProps {
  label: string
  onClick: () => void
  isSelected?: boolean
  variant?: "function" | "all" | "connect"
}

function ButtonMesh({ label, onClick, isSelected = false, variant = "function" }: ButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  // Define colors based on variant and state
  let color: string | Color, textColor: string | Color, hoverColor: string | Color, pressColor: string | Color

  if (variant === "connect") {
    color = "#f8f9fa"
    textColor = "#1a1a1a"
    hoverColor = "#e9ecef"
    pressColor = "#dee2e6"
  } else if (variant === "all") {
    if (isSelected) {
      color = "#4a5568"
      textColor = "#ffffff"
      hoverColor = "#2d3748"
      pressColor = "#1a202c"
    } else {
      color = "#e2e8f0"
      textColor = "#1a202c"
      hoverColor = "#cbd5e0"
      pressColor = "#a0aec0"
    }
  } else {
    // function
    if (isSelected) {
      color = "#4a5568"
      textColor = "#ffffff"
      hoverColor = "#2d3748"
      pressColor = "#1a202c"
    } else {
      color = "#e2e8f0"
      textColor = "#1a202c"
      hoverColor = "#cbd5e0"
      pressColor = "#a0aec0"
    }
  }

  // Animation
  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Target position based on interaction state
    const targetY = pressed ? -0.05 : hovered ? 0.05 : 0

    // Smooth animation
    easing.damp3(meshRef.current.position, new Vector3(0, targetY, 0), 0.2, delta)

    // Target color based on state
    let targetColor = color
    if (pressed) targetColor = pressColor
    else if (hovered) targetColor = hoverColor

    // Smooth color transition
    easing.dampC((meshRef.current.material as THREE.MeshStandardMaterial).color, targetColor as string, 0.2, delta)
  })

  return (
    <RoundedBox
      ref={meshRef}
      args={[variant === "connect" ? 2.4 : variant === "all" ? 1.2 : 2, 0.6, 0.15]}
      radius={0.3}
      smoothness={4}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => {
        setHovered(false)
        setPressed(false)
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => {
        setPressed(false)
        onClick()
      }}
    >
      <meshStandardMaterial color={color} />
      <Text
        position={[0, 0, 0.08]}
        fontSize={0.2}
        color={textColor}
        font="/fonts/Inter-Bold.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </RoundedBox>
  )
}

export default function ThreeDButton({ label, onClick, isSelected, variant }: ButtonProps) {
  return (
    <Canvas camera={{ position: [0, 0, 2], fov: 40 }} style={{ width: "100%", height: "100%", cursor: "pointer" }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.4} />
      <pointLight position={[-10, -10, -10]} intensity={0.2} />
      <ButtonMesh label={label} onClick={onClick} isSelected={isSelected} variant={variant} />
    </Canvas>
  )
}

