'use client';

import { useState, useEffect } from 'react';
import { Check, ClipboardCopy } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { cn } from '../lib/utils';
import { convertAbiToWarp } from '../lib/ABItoWarp';

import { useGetAccountInfo, useGetSignedTransactions } from 'hooks';
import { PublishABIButton } from './PublishABIButton';
import { PublishWarpButton } from './PublishWarpButton';
import axios from 'axios';

interface ABIFunction {
  name: string;
  type?: string;
  mutability?: string;
  onlyOwner?: boolean;
  inputs: {
    name: string;
    type: string;
    [key: string]: unknown;
  }[];
  outputs: {
    type: string;
    [key: string]: unknown;
  }[];
}

export default function ABIParser() {
  const [abiInput, setAbiInput] = useState('');
  const [parsedAbi, setParsedAbi] = useState<ABIFunction[]>([]);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(['all']);
  const [outputAbi, setOutputAbi] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [contractAddress, setContractAddress] = useState('');
  const { address } = useGetAccountInfo();
  const [abiTxHash, setAbiTxHash] = useState('');
  const [warpTxHash, setWarpTxHash] = useState('');

  // Parse ABI when input changes
  useEffect(() => {
    try {
      if (abiInput.trim()) {
        const parsed = JSON.parse(abiInput);

        // Handle DAO ABI format with endpoints
        if (parsed.endpoints) {
          setParsedAbi(parsed.endpoints);
          setSelectedFunctions(['all']); // Reset selection when ABI changes
        } else {
          console.error('Invalid ABI format: Missing endpoints array');
        }
      }
    } catch (error) {
      console.error('Invalid ABI format', error);
    }
  }, [abiInput]);

  useEffect(() => {
    const sendAbiData = async () => {
      try {
        if (abiTxHash) {
          console.log('Sending ABI data to API server...');
          await axios.post('https://abi2warp.render.com/api/abis', {
            abi: abiInput,
            contractAddress: address,
            txHash: abiTxHash,
            sender: address
          });
          console.log('ABI data sent successfully to API server');
        }
      } catch (error) {
        console.error('Error sending ABI data to API server:', error);
      }
    };

    if (abiTxHash) {
      sendAbiData();
    }
  }, [abiTxHash]);

  useEffect(() => {
    const sendWarpData = async () => {
      try {
        if (warpTxHash) {
          console.log('Sending Warp data to API server...');
          await axios.post('https://abi2warp.render.com/api/warps', {
            warp: outputAbi,
            address: address,
            txHash: warpTxHash
          });
          console.log('Warp data sent successfully to API server');
        }
      } catch (error) {
        console.error('Error sending Warp data to API server:', error);
      }
    };

    if (warpTxHash) {
      sendWarpData();
    }
  }, [warpTxHash, outputAbi, address]);

  useEffect(() => {
    const fetchAbi = async () => {
      try {
        const response = await axios.get(
          `https://abi2warp.render.com/api/abis/${contractAddress}`
        );
        console.log(response.data);
        if (response.data.txHash) {
          setAbiInput(response.data.abi);
          setAbiTxHash(response.data.txHash);
        }
      } catch (error) {
        console.error('Error fetching ABI:', error);
      }
    };

    if (contractAddress) {
      fetchAbi();
    }
  }, [contractAddress]);

  // Handle function selection
  const toggleFunction = (funcName: string) => {
    if (funcName === 'all') {
      // If "all" is being selected, deselect everything else
      setSelectedFunctions(['all']);
    } else {
      // If a specific function is being selected
      const newSelection = [...selectedFunctions];

      // Remove "all" if it's currently selected
      const allIndex = newSelection.indexOf('all');
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
        setSelectedFunctions(['all']);
      } else {
        setSelectedFunctions(newSelection);
      }
    }
  };

  // Create warp (filter ABI based on selection)
  const createWarp = async () => {
    setIsLoading(true);

    setTimeout(async () => {
      try {
        const parsed = JSON.parse(abiInput);
        let filtered;

        // Handle DAO ABI format only
        if (parsed.endpoints) {
          // Create a copy of the original object
          const result = { ...parsed };

          // If not "all" is selected, filter the endpoints
          if (!selectedFunctions.includes('all')) {
            result.endpoints = parsed.endpoints.filter((item: ABIFunction) =>
              selectedFunctions.includes(item.name)
            );
          }

          // Convert the filtered ABI to Warp format
          const warp = await convertAbiToWarp(
            result,
            contractAddress,
            parsed,
            abiTxHash,
            {
              selectedFunctions: selectedFunctions,
              openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY
            }
          );
          filtered = warp;
        } else {
          console.error('Invalid ABI format: Missing endpoints array');
          setIsLoading(false);
          return;
        }

        setOutputAbi(JSON.stringify(filtered, null, 2));
        setIsLoading(false);
      } catch (error) {
        console.error('Error creating warp', error);
        setIsLoading(false);
      }
    }, 1000); // Reduced timeout for better UX
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputAbi);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Add this function to copy the Warp link to clipboard
  const copyWarpLink = () => {
    const link = `https://devnet.usewarp.to/hash:${warpTxHash}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  // Function to get the button color based on mutability
  const getFunctionButtonStyle = (func: ABIFunction) => {
    if (selectedFunctions.includes(func.name)) {
      return 'bg-blue-500 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[3px]';
    }

    // Read-only functions (light green)
    if (func.mutability === 'readonly') {
      return 'bg-blue-50 text-blue-700 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)] active:translate-y-[3px]';
    }

    // Write functions (light red)
    if (func.mutability === 'mutable') {
      return 'bg-red-50 text-red-700 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)] active:translate-y-[3px]';
    }

    // Default style for other cases
    return 'bg-gray-100 text-gray-700 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)] active:translate-y-[3px]';
  };

  return (
    <div className='mx-auto w-full rounded-3xl border border-gray-200 bg-white shadow-xl p-6 md:p-8 backdrop-blur-sm bg-opacity-90'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Left Panel */}
        <div className='space-y-6'>
          <label className=''>ABI Input</label>
          <div className='rounded-xl border-2 border-gray-200 overflow-auto shadow-md bg-white max-h-[400px]'>
            <Textarea
              placeholder='Paste your ABI'
              className='min-h-[400px] border-0 resize-none p-4 focus-visible:ring-0 bg-transparent'
              value={abiInput}
              onChange={(e) => setAbiInput(e.target.value)}
            />
          </div>

          <div className='flex flex-wrap gap-3'>
            {parsedAbi.map((func, index) => (
              <button
                key={index}
                onClick={() => toggleFunction(func.name)}
                className={cn(
                  'relative px-4 py-2 font-medium rounded-full overflow-hidden transition-all duration-150',
                  'border border-gray-200',
                  "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:opacity-50",
                  getFunctionButtonStyle(func)
                )}
              >
                {func.name}
                {func.onlyOwner && (
                  <span className='ml-1 text-xs bg-amber-100 text-amber-800 px-1 py-0.5 rounded-full'>
                    owner
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => toggleFunction('all')}
              className={cn(
                'relative px-4 py-2 font-medium rounded-full overflow-hidden transition-all duration-150',
                'border border-gray-200',
                "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:opacity-50",
                selectedFunctions.includes('all')
                  ? 'bg-blue-500 text-white shadow-[0_4px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[3px]'
                  : 'bg-gray-100 text-gray-700 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] hover:shadow-[0_5px_0_0_rgba(0,0,0,0.1)] hover:-translate-y-[1px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.1)] active:translate-y-[3px]'
              )}
            >
              All
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className='space-y-6'>
          <label className=''>Warp Output</label>
          <div className='rounded-xl border-2 border-gray-200 min-h-[400px] relative p-4 shadow-md bg-white'>
            {isLoading ? (
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='relative'>
                  <div className='h-16 w-16 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin'></div>
                  <div className='absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-600'>
                    Loading
                  </div>
                </div>
              </div>
            ) : outputAbi ? (
              <div className='relative'>
                <pre className='text-sm overflow-auto max-h-[380px] pr-8 font-mono text-gray-800'>
                  {outputAbi}
                </pre>
                <button
                  onClick={copyToClipboard}
                  className='absolute top-2 right-2 p-2 rounded-md hover:bg-gray-100 transition-colors'
                  aria-label='Copy to clipboard'
                >
                  {copied ? (
                    <Check className='h-5 w-5 text-green-500' />
                  ) : (
                    <ClipboardCopy className='h-5 w-5 text-gray-500' />
                  )}
                </button>
              </div>
            ) : (
              <div className='absolute inset-0 flex items-center justify-center text-gray-400'>
                <p className='text-center'>
                  Processed ABI will appear here
                  <br />
                  <span className='text-sm'>
                    Click &quot;Create Warp&quot; to generate
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Workflow Status Indicator */}
          <div className='mt-4 mb-2'>
            <div className='flex items-center justify-between max-w-md mx-auto'>
              {/* Step 1: Publish ABI */}
              <div className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    abiTxHash
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-500 text-white'
                  }`}
                >
                  {abiTxHash ? '✓' : '1'}
                </div>
                <p className='text-xs mt-1'>Publish ABI</p>
                {abiTxHash && (
                  <span
                    className='text-xs text-gray-500 truncate max-w-[80px]'
                    title={abiTxHash}
                  >
                    {abiTxHash.substring(0, 6)}...
                  </span>
                )}
              </div>

              {/* Connector Line */}
              <div
                className={`h-1 w-16 ${
                  abiTxHash ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>

              {/* Step 2: Create Warp */}
              <div className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    outputAbi
                      ? 'bg-green-500 text-white'
                      : abiTxHash
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {outputAbi ? '✓' : '2'}
                </div>
                <p className='text-xs mt-1'>Create Warp</p>
              </div>

              {/* Connector Line */}
              <div
                className={`h-1 w-16 ${
                  outputAbi ? 'bg-green-500' : 'bg-gray-300'
                }`}
              ></div>

              {/* Step 3: Publish Warp */}
              <div className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    warpTxHash
                      ? 'bg-green-500 text-white'
                      : outputAbi
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {warpTxHash ? '✓' : '3'}
                </div>
                <p className='text-xs mt-1'>Publish Warp</p>
                {warpTxHash && (
                  <span
                    className='text-xs text-gray-500 truncate max-w-[80px]'
                    title={warpTxHash}
                  >
                    {warpTxHash.substring(0, 6)}...
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='flex justify-between'>
            <input
              type='text'
              placeholder='Enter contract address'
              value={contractAddress}
              onChange={(e) => setContractAddress(e.target.value)}
              className='mt-2 p-2 border border-gray-300 rounded-md min-w-[300px]'
            />

            <div className='flex flex-col space-y-4'>
              {/* Step 1: Publish ABI Button (Always shown first) */}
              {!abiTxHash && (
                <div className='flex justify-end'>
                  <PublishABIButton
                    abi={abiInput}
                    setTxHash={setAbiTxHash}
                    disabled={!abiInput.trim()}
                    className='relative px-8 py-3 text-lg font-bold rounded-xl overflow-hidden transition-all duration-200 
                    border-2 border-gray-200 
                    after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent after:opacity-50 
                    bg-blue-500 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[2px] 
                    active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[5px] disabled:bg-gray-300 disabled:text-gray-500 
                    disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-[0_0_0_0_rgba(0,0,0,0.2)]'
                  />
                </div>
              )}

              {/* Step 2: Create Warp Button (Only shown after ABI is published) */}
              {abiTxHash && !outputAbi && (
                <div className='flex justify-end'>
                  <button
                    onClick={createWarp}
                    disabled={isLoading || !contractAddress.trim()}
                    className={cn(
                      'relative px-8 py-3 text-lg font-bold rounded-xl overflow-hidden transition-all duration-200',
                      'border-2 border-gray-200',
                      "after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent after:opacity-50",
                      isLoading || !contractAddress.trim()
                        ? 'bg-gray-300 text-gray-500 opacity-70 cursor-not-allowed shadow-[0_0_0_0_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-blue-500 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[2px] active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[5px]'
                    )}
                  >
                    {isLoading ? (
                      <span className='flex items-center justify-center'>
                        <svg
                          className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                        >
                          <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                          ></circle>
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Create Warp'
                    )}
                  </button>
                </div>
              )}

              {/* Step 3: Publish Warp Button (Only shown after output ABI is generated) */}
              {outputAbi && !warpTxHash && (
                <div className='flex justify-end'>
                  <PublishWarpButton
                    warp={outputAbi}
                    setTxHash={setWarpTxHash}
                    disabled={!outputAbi.trim()}
                    className='relative px-8 py-3 text-lg font-bold rounded-xl overflow-hidden transition-all duration-200 
                      border-2 border-gray-200 
                      after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent after:opacity-50 
                      bg-green-500 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[2px] 
                      active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[5px] disabled:bg-gray-300 disabled:text-gray-500 
                      disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-[0_0_0_0_rgba(0,0,0,0.2)]'
                  />
                </div>
              )}

              {warpTxHash && (
                <div className='flex justify-end space-x-2'>
                  <a
                    href={`https://devnet.usewarp.to/hash%3A${warpTxHash}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='relative px-8 py-3 text-lg font-bold rounded-xl overflow-hidden transition-all duration-200 
                      border-2 border-gray-200 
                      after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent after:opacity-50 
                      bg-green-500 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[2px] 
                      active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[5px] disabled:bg-gray-300 disabled:text-gray-500 
                      disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-[0_0_0_0_rgba(0,0,0,0.2)]'
                  >
                    Open Warp 🚀
                  </a>

                  <button
                    onClick={copyWarpLink}
                    className='relative px-4 py-3 text-lg font-bold rounded-xl overflow-hidden transition-all duration-200 
                      border-2 border-gray-200 
                      after:content-[""] after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/30 after:to-transparent after:opacity-50 
                      bg-blue-500 text-white shadow-[0_6px_0_0_rgba(0,0,0,0.2)] hover:shadow-[0_8px_0_0_rgba(0,0,0,0.2)] hover:-translate-y-[2px] 
                      active:shadow-[0_1px_0_0_rgba(0,0,0,0.2)] active:translate-y-[5px]'
                    aria-label='Copy link to clipboard'
                  >
                    {linkCopied ? (
                      <Check className='h-5 w-5' />
                    ) : (
                      <ClipboardCopy className='h-5 w-5' />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className='mt-8 p-6 rounded-xl border border-gray-200 bg-gray-50'>
        <h2 className='text-lg font-medium mb-4 text-gray-800'>How to Use</h2>
        <div className='text-sm text-gray-600 space-y-3'>
          <p>
            1. Paste your ABI JSON in the left panel (supports both Ethereum and
            DAO ABI formats)
          </p>
          <p>2. Enter your contract address in the specified field</p>
          <p>3. Follow the sequential workflow:</p>
          <ul className='list-disc pl-8 space-y-2'>
            <li>
              <span className='font-semibold'>Step 1:</span> Click{' '}
              <span className='font-medium text-blue-600'>"Publish ABI"</span>{' '}
              to store your ABI on the blockchain
            </li>
            <li>
              <span className='font-semibold'>Step 2:</span> Once the ABI is
              published, click{' '}
              <span className='font-medium text-blue-600'>"Create Warp"</span>{' '}
              to generate the Warp definition
            </li>
            <li>
              <span className='font-semibold'>Step 3:</span> After the Warp is
              created, click{' '}
              <span className='font-medium text-green-600'>"Publish Warp"</span>{' '}
              to deploy it to the blockchain
            </li>
          </ul>
          <p>
            4. Optional: You can select specific functions to include in your
            Warp by clicking on them before creating the Warp
          </p>
          <div className='flex items-center gap-2 mt-3 mb-1'>
            <span className='inline-block w-3 h-3 bg-blue-100 rounded-full'></span>
            <span>Blue background indicates read-only functions (view)</span>
          </div>
          <div className='flex items-center gap-2 mb-1'>
            <span className='inline-block w-3 h-3 bg-red-100 rounded-full'></span>
            <span>
              Red background indicates state-changing functions (write)
            </span>
          </div>
          <div className='flex items-center gap-2 mb-3'>
            <span className='px-1 text-xs bg-amber-100 text-amber-800 rounded-full'>
              owner
            </span>
            <span>
              Badge indicates functions that can only be called by the contract
              owner
            </span>
          </div>
          <p className='italic text-sm text-gray-500 border-l-4 border-gray-200 pl-3 mb-4'>
            Please input a valid contract address to generate actions for your
            Warp.
          </p>
          <p className='my-4 text-sm font-medium text-gray-700'>
            Paste your contract address (bech32 format):
          </p>
          <p className='text-gray-600'>
            If you don&apos;t have an ABI file yet, you can find it in the
            explorer or generate it from your smart contract code.
          </p>
          <p className='text-gray-700 font-medium'>
            Your ABI JSON is properly formatted! Select the functions you&apos;d
            like to include in your Warp.
          </p>
        </div>
      </div>
    </div>
  );
}
