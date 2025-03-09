import ABIParser from "./abi-parser"
import SampleAbiButton from "./sample-abi"

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <ABIParser />
      <SampleAbiButton />
    </div>
  )
}

