"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, RoundedBox } from "@react-three/drei"
import { Vector3 } from "three"
import { easing } from "maath"
import * as THREE from "three"

interface CreateWarpButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled: boolean
}

function ButtonMesh({ onClick, isLoading, disabled }: CreateWarpButtonProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const textRef = useRef<any>(null)
  const [hovered, setHovered] = useState(false)
  const [pressed, setPressed] = useState(false)

  // Define colors based on state
  const baseColor = disabled ? "#a0aec0" : "#4a5568"
  const textColor = "#ffffff"
  const hoverColor = disabled ? "#a0aec0" : "#2d3748"
  const pressColor = disabled ? "#a0aec0" : "#1a202c"

  // Animation
  useFrame((_, delta) => {
    if (!meshRef.current) return

    // Target position based on interaction state
    const targetY = pressed ? -0.08 : hovered && !disabled ? 0.08 : 0

    // Smooth animation
    easing.damp3(meshRef.current.position, new Vector3(0, targetY, 0), 0.2, delta)

    // Target color based on state
    let targetColor = baseColor
    if (pressed && !disabled) targetColor = pressColor
    else if (hovered && !disabled) targetColor = hoverColor

    // Smooth color transition
    easing.dampC(
      (meshRef.current.material as THREE.MeshStandardMaterial).color,
      new THREE.Color(targetColor),
      0.2,
      delta,
    )

    // Rotate loading animation
    if (isLoading && textRef.current) {
      textRef.current.rotation.z += delta * 2
    }
  })

  return (
    <RoundedBox
      ref={meshRef}
      args={[3, 0.8, 0.2]}
      radius={0.3}
      smoothness={4}
      onPointerOver={() => !disabled && setHovered(true)}
      onPointerOut={() => {
        setHovered(false)
        setPressed(false)
      }}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => {
        setPressed(false)
        if (!disabled && !isLoading) onClick()
      }}
    >
      <meshStandardMaterial color={baseColor} />
      {isLoading ? (
        <group ref={textRef} position={[0, 0, 0.11]}>
          <Text
            position={[-0.6, 0, 0]}
            fontSize={0.25}
            color={textColor}
            font="/fonts/Inter-Bold.ttf"
            anchorX="center"
            anchorY="middle"
          >
            Processing
          </Text>
          <mesh position={[0.8, 0, 0]}>
            <ringGeometry args={[0.12, 0.15, 16]} />
            <meshBasicMaterial color={textColor} />
          </mesh>
          <mesh position={[0.8, 0, 0.01]}>
            <ringGeometry args={[0.12, 0.15, 16, 1, 0, Math.PI / 2]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </group>
      ) : (
        <Text
          position={[0, 0, 0.11]}
          fontSize={0.25}
          color={textColor}
          font="/fonts/Inter-Bold.ttf"
          anchorX="center"
          anchorY="middle"
        >
          Create Warp
        </Text>
      )}
    </RoundedBox>
  )
}

export default function CreateWarpButton({ onClick, isLoading, disabled }: CreateWarpButtonProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2], fov: 40 }}
      style={{
        width: "100%",
        height: "100%",
        cursor: disabled ? "not-allowed" : isLoading ? "wait" : "pointer",
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.4} />
      <pointLight position={[-10, -10, -10]} intensity={0.2} />
      <ButtonMesh onClick={onClick} isLoading={isLoading} disabled={disabled} />
    </Canvas>
  )
}

