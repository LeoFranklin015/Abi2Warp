"use client"

import { useState } from "react"

// Sample ABI for testing purposes
const sampleAbi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "getApproved",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]

export default function SampleAbiButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const loadSampleAbi = () => {
    const textArea = document.querySelector("textarea")
    if (textArea) {
      textArea.value = JSON.stringify(sampleAbi, null, 2)
      // Trigger a change event
      const event = new Event("input", { bubbles: true })
      textArea.dispatchEvent(event)
    }
  }

  return (
    <div className="mt-8 text-center">
      <button
        onClick={loadSampleAbi}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setIsPressed(false)
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        className={`
          relative px-6 py-2 font-medium
          bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
          text-gray-800 dark:text-white
          border border-gray-300 dark:border-gray-600
          rounded-lg overflow-hidden
          transition-all duration-150
          ${
            isPressed
              ? "shadow-[0_1px_0_0_rgba(0,0,0,0.1)] translate-y-[3px]"
              : isHovered
                ? "shadow-[0_6px_0_0_rgba(0,0,0,0.1)] -translate-y-[1px]"
                : "shadow-[0_4px_0_0_rgba(0,0,0,0.1)]"
          }
          after:content-['']
          after:absolute
          after:inset-0
          after:bg-gradient-to-b
          after:from-white/20
          after:to-transparent
          after:opacity-50
          dark:after:from-white/10
        `}
      >
        Load Sample ABI
      </button>
      <p className="text-sm text-muted-foreground mt-2">Click to load a sample ERC-721 ABI for testing</p>
    </div>
  )
}

