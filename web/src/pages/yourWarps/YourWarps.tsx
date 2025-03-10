import axios from 'axios';
import { useGetAccountInfo } from 'hooks';
import React, { useEffect, useState } from 'react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardFooter } from './components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from './components/ui/dialog';
import { ScrollArea } from './components/ui/scroll-area';
import { Badge } from './components/ui/badge';
import { Check, Copy, ExternalLink, Clock, Hash, FileText } from 'lucide-react';

// Define the Warp interface
interface Warp {
  _id: string;
  address: string;
  warp: string;
  txHash: string;
  createdAt: string;
}

const YourWarps = () => {
  const { address } = useGetAccountInfo();
  const [warps, setWarps] = useState<Warp[]>([]);
  const [selectedWarp, setSelectedWarp] = useState<Warp | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWarps = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(
          `https://abi2warp.onrender.com/api/warps/${address}`
        );
        setWarps(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching warps:', error);
        setError('Failed to load warps. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWarps();
  }, [address]);

  const openWarpModal = (warp: Warp) => {
    setSelectedWarp(warp);
    setIsModalOpen(true);
  };

  const copyWarpToClipboard = () => {
    if (selectedWarp) {
      try {
        navigator.clipboard.writeText(selectedWarp.warp);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  // Parse the warp JSON to extract preview image and name
  const getWarpDetails = (warpJson: string) => {
    try {
      const parsed = JSON.parse(warpJson);
      return {
        preview: parsed.preview || '',
        name: parsed.name || 'Unnamed Warp',
        title: parsed.title || '',
        description: parsed.description || ''
      };
    } catch (e) {
      console.error('Error parsing warp JSON:', e);
      return {
        preview: '',
        name: 'Unnamed Warp',
        title: '',
        description: ''
      };
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Truncate text helper
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  if (isLoading) {
    return (
      <div className='container mx-auto py-12 px-4 flex justify-center items-center min-h-[60vh]'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-gray-600'>Loading your warps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto py-12 px-4'>
        <div className='bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg'>
          <p>{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className='mt-3 bg-red-600 hover:bg-red-700'
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-12 px-4'>
      <div className='flex flex-col items-start mb-12'>
        <h1 className='text-4xl font-bold text-gray-900 mb-3'>Your Warps</h1>
        <div className='h-1.5 w-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full'></div>
      </div>

      {warps.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6'>
            <FileText className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-medium text-gray-700 mb-2'>
            No warps found
          </h3>
          <p className='text-gray-500 max-w-md text-center'>
            Create your first warp to get started with your collection.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {warps.map((warp) => {
            const { preview, name } = getWarpDetails(warp.warp);
            return (
              <Card
                key={warp._id}
                className='overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px] cursor-pointer'
                onClick={() => openWarpModal(warp)}
              >
                <CardContent className='p-0'>
                  <div className='aspect-video w-full overflow-hidden relative group'>
                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
                      <Badge
                        variant='secondary'
                        className='bg-white/90 text-gray-800 hover:bg-white/95'
                      >
                        View Details
                      </Badge>
                    </div>
                    <img
                      src={
                        preview ||
                        'https://placehold.co/400x200/f5f5f5/a3a3a3?text=No+Preview'
                      }
                      alt={`${name} preview`}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://placehold.co/400x200/f5f5f5/a3a3a3?text=Error+Loading+Image';
                      }}
                    />
                  </div>
                  <div className='p-6'>
                    <h3 className='text-xl font-semibold text-gray-800 mb-3 line-clamp-1'>
                      {name}
                    </h3>
                    <div className='flex items-center text-sm text-gray-500 mb-2'>
                      <Hash className='w-4 h-4 mr-2 flex-shrink-0' />
                      <span className='font-mono truncate'>
                        {truncateText(warp.txHash, 20)}
                      </span>
                    </div>
                    <div className='flex items-center text-sm text-gray-500'>
                      <Clock className='w-4 h-4 mr-2 flex-shrink-0' />
                      <span>{formatDate(warp.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className='border-t border-gray-100 bg-gray-50 p-4 flex justify-end'>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                    onClick={(e) => {
                      e.stopPropagation();
                      openWarpModal(warp);
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Warp Details Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open: boolean) => {
          setIsModalOpen(open);
          if (!open) setCopied(false);
        }}
      >
        {selectedWarp && (
          <DialogContent className='max-w-4xl max-h-[85vh] overflow-auto bg-white rounded-2xl shadow-2xl border-0 p-0'>
            <div className='relative'>
              <div className='absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl'></div>

              <button
                onClick={() => setIsModalOpen(false)}
                className='absolute top-4 right-4 z-20 bg-red-500  hover:bg-red-500/40 rounded-full p-1.5 backdrop-blur-sm transition-colors'
                aria-label='Close'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='20'
                  height='20'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M18 6L6 18M6 6l12 12'></path>
                </svg>
              </button>

              <DialogHeader className='relative z-10 pt-6 px-6 pb-3'>
                <div className='flex items-center gap-3 mb-1'>
                  <div className='w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md'>
                    <img
                      src={
                        getWarpDetails(selectedWarp.warp).preview ||
                        'https://placehold.co/64x64/f5f5f5/a3a3a3?text=No+Preview'
                      }
                      alt='Warp icon'
                      className='w-full h-full object-cover'
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'https://placehold.co/64x64/f5f5f5/a3a3a3?text=Error';
                      }}
                    />
                  </div>
                  <div>
                    <DialogTitle className='text-xl font-bold text-black'>
                      {getWarpDetails(selectedWarp.warp).name}
                    </DialogTitle>
                    <DialogDescription className='text-gray-500 mt-0.5 text-sm'>
                      {getWarpDetails(selectedWarp.warp).title}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className='bg-white rounded-2xl relative z-10 mt-4 px-6 py-5'>
                <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                  <div className='md:col-span-5 space-y-4'>
                    <div className='rounded-xl overflow-hidden shadow-md border border-gray-100'>
                      <img
                        src={
                          getWarpDetails(selectedWarp.warp).preview ||
                          'https://placehold.co/400x300/f5f5f5/a3a3a3?text=No+Preview'
                        }
                        alt='Warp preview'
                        className='w-full h-auto'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src =
                            'https://placehold.co/400x300/f5f5f5/a3a3a3?text=Error+Loading+Image';
                        }}
                      />
                    </div>

                    <div className='space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100'>
                      <div>
                        <h4 className='text-sm font-semibold text-gray-700 mb-1.5 flex items-center'>
                          <Hash className='w-4 h-4 mr-1.5 text-gray-500' />
                          Transaction Hash
                        </h4>
                        <p className='text-sm font-mono text-gray-600 break-all bg-white p-2.5 rounded-lg border border-gray-200'>
                          {selectedWarp.txHash}
                        </p>
                      </div>

                      <div>
                        <h4 className='text-sm font-semibold text-gray-700 mb-1.5 flex items-center'>
                          <Clock className='w-4 h-4 mr-1.5 text-gray-500' />
                          Created At
                        </h4>
                        <p className='text-sm text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200'>
                          {formatDate(selectedWarp.createdAt)}
                        </p>
                      </div>

                      {getWarpDetails(selectedWarp.warp).description && (
                        <div>
                          <h4 className='text-sm font-semibold text-gray-700 mb-1.5 flex items-center'>
                            <FileText className='w-4 h-4 mr-1.5 text-gray-500' />
                            Description
                          </h4>
                          <p className='text-sm text-gray-600 bg-white p-2.5 rounded-lg border border-gray-200'>
                            {getWarpDetails(selectedWarp.warp).description}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className='md:col-span-7'>
                    <h4 className='text-sm font-semibold text-gray-700 mb-2 flex items-center'>
                      <FileText className='w-4 h-4 mr-1.5 text-gray-500' />
                      Warp Definition
                    </h4>
                    <ScrollArea className='h-[400px] rounded-xl border border-gray-200 bg-gray-50 mb-4'>
                      <pre className='text-sm font-mono whitespace-pre-wrap break-all text-gray-700 p-4'>
                        {selectedWarp.warp}
                      </pre>
                    </ScrollArea>

                    <div className='flex gap-3 w-full justify-end mt-4'>
                      <Button
                        className={`transition-all rounded-lg ${
                          copied
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        }`}
                        onClick={copyWarpToClipboard}
                      >
                        {copied ? (
                          <>
                            <Check className='mr-2 h-4 w-4' />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className='mr-2 h-4 w-4' />
                            Copy Warp
                          </>
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        className='border-gray-300 hover:bg-gray-100 text-gray-800 rounded-lg'
                        onClick={() => {
                          window.open(
                            `https://devnet.usewarp.to/hash:${selectedWarp.txHash}`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className='mr-2 h-4 w-4' />
                        Open Warp
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default YourWarps;
