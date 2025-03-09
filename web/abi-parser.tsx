"use client";

import { useState, useEffect } from "react";
import { Check, ClipboardCopy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ABIFunction {
  name: string;
  type: string;
  inputs: any[];
  outputs: any[];
  stateMutability?: string;
}

export default function ABIParser() {
  const [abiInput, setAbiInput] = useState("");
  const [parsedAbi, setParsedAbi] = useState<ABIFunction[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(["all"]);
  const [outputAbi, setOutputAbi] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Parse ABI when input changes
  useEffect(() => {
    try {
      if (abiInput.trim()) {
        const parsed = JSON.parse(abiInput);
        const functions = Array.isArray(parsed)
          ? parsed.filter((item) => item.type === "function")
          : [];
        setParsedAbi(functions);
        setSelectedFunctions(["all", "transfer"]); // Reset selection when ABI changes
      }
    } catch (error) {
      console.error("Invalid ABI format", error);
    }
  }, [abiInput]);

  // Handle function selection
  const toggleFunction = (funcName: string) => {
    if (funcName === "all") {
      // If "all" is being selected, deselect everything else
      setSelectedFunctions(["all"]);
    } else {
      // If a specific function is being selected
      const newSelection = [...selectedFunctions];

      // Remove "all" if it's currently selected
      const allIndex = newSelection.indexOf("all");
      if (allIndex !== -1) {
        newSelection.splice(allIndex, 1);
      }

      // Toggle the selected function
      const index = newSelection.indexOf(funcName);
      if (index === -1) {
        newSelection.push(funcName);
      } else {
        newSelection.splice(index, 1);
      }

      // If nothing is selected, select "all"
      if (newSelection.length === 0) {
        setSelectedFunctions(["all"]);
      } else {
        setSelectedFunctions(newSelection);
      }
    }
  };

  // Create warp (filter ABI based on selection)
  const createWarp = () => {
    setIsLoading(true);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(abiInput);
        let filtered = parsed;

        // If not "all" is selected, filter the ABI
        if (!selectedFunctions.includes("all")) {
          filtered = parsed.filter(
            (item: any) =>
              item.type !== "function" || selectedFunctions.includes(item.name)
          );
        }

        setOutputAbi(JSON.stringify(filtered, null, 2));
        setIsLoading(false);
      } catch (error) {
        console.error("Error creating warp", error);
        setIsLoading(false);
      }
    }, 4000); // 4 second timeout as requested
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputAbi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-6 md:p-8 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-white bg-clip-text text-transparent">
            A2w
          </h1>

          {/* 3D Connect Button */}
          <button
            className="
              relative px-6 py-2 font-medium text-gray-800 dark:text-white
              bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800
              border border-gray-300 dark:border-gray-600
              rounded-full overflow-hidden
              shadow-[0_4px_0_0_rgba(0,0,0,0.1)]
              active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)]
              active:translate-y-[3px]
              transition-all duration-150
              hover:shadow-[0_6px_0_0_rgba(0,0,0,0.1)]
              hover:-translate-y-[1px]
              after:content-['']
              after:absolute
              after:inset-0
              after:bg-gradient-to-b
              after:from-white/20
              after:to-transparent
              after:opacity-50
              dark:after:from-white/10
            "
          >
            Connect
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Panel */}
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-md bg-gray-50 dark:bg-gray-900">
              <Textarea
                placeholder="Paste your ABI"
                className="min-h-[400px] border-0 resize-none p-4 focus-visible:ring-0 bg-transparent"
                value={abiInput}
                onChange={(e) => setAbiInput(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {parsedAbi.map((func, index) => (
                <button
                  key={index}
                  onClick={() => toggleFunction(func.name)}
                  className={cn(
                    "relative px-4 py-2 font-medium rounded-full overflow-hidden transition-all duration-150",
                    "border border-gray-300 dark:border-gray-600",
                    "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:opacity-50 dark:after:from-white/10",
                    selectedFunctions.includes(func.name)
                      ? "bg-gradient-to-b from-gray-600 to-gray-700 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[3px]"
                      : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-white shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)] active:translate-y-[3px]"
                  )}
                >
                  {func.name}
                </button>
              ))}
              <button
                onClick={() => toggleFunction("all")}
                className={cn(
                  "relative px-4 py-2 font-medium rounded-full overflow-hidden transition-all duration-150",
                  "border border-gray-300 dark:border-gray-600",
                  "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:opacity-50 dark:after:from-white/10",
                  selectedFunctions.includes("all")
                    ? "bg-gradient-to-b from-gray-600 to-gray-700 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[3px]"
                    : "bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 text-gray-800 dark:text-white shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)] active:translate-y-[3px]"
                )}
              >
                All
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 min-h-[400px] relative p-4 shadow-md bg-gray-50 dark:bg-gray-900">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-gray-300 dark:border-gray-600 border-t-gray-600 dark:border-t-gray-300 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                      Loading
                    </div>
                  </div>
                </div>
              ) : outputAbi ? (
                <div className="relative">
                  <pre className="text-sm overflow-auto max-h-[380px] pr-8 font-mono">
                    {outputAbi}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Copy to clipboard"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <ClipboardCopy className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <p className="text-center">
                    Processed ABI will appear here
                    <br />
                    <span className="text-sm">
                      Click "Create Warp" to generate
                    </span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center">
              <button
                onClick={createWarp}
                disabled={isLoading || !abiInput.trim()}
                className={cn(
                  "relative px-8 py-3 text-lg font-bold rounded-xl overflow-hidden transition-all duration-200",
                  "border-2 border-gray-300 dark:border-gray-600",
                  "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent after:opacity-50 dark:after:from-white/10",
                  isLoading || !abiInput.trim()
                    ? "bg-gradient-to-b from-gray-400 to-gray-500 text-white opacity-70 cursor-not-allowed shadow-[0_0_0_0_rgba(0,0,0,0.2)]"
                    : "bg-gradient-to-b from-gray-600 to-gray-800 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[2px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[5px]"
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Create Warp"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
