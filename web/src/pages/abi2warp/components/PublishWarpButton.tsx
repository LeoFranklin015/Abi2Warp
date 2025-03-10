import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useGetAccountInfo } from '@multiversx/sdk-dapp/hooks';
import { publishWarp } from '../lib/PublishWarp';
import { useTransactionHash } from '../hooks/useTransactionHash';

interface PublishWarpButtonProps {
  warp: any;
  disabled?: boolean;
  className?: string;
  setTxHash?: Dispatch<SetStateAction<string>>;
}

export const PublishWarpButton = ({
  warp,
  disabled,
  className,
  setTxHash
}: PublishWarpButtonProps) => {
  const { address } = useGetAccountInfo();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { txHash, isLoading, isSuccess, isError, errorMessage } =
    useTransactionHash(sessionId);

  const handlePublish = async () => {
    try {
      const result = await publishWarp(warp, address);
      setSessionId(result.sessionId);
    } catch (error) {
      console.error('Error publishing Warp:', error);
    }
  };

  useEffect(() => {
    if (isSuccess && txHash && setTxHash) {
      setTxHash(txHash);
    }
  }, [isSuccess, txHash, setTxHash]);

  return (
    <div>
      <button
        onClick={handlePublish}
        disabled={disabled || isLoading}
        className={
          className ||
          'px-6 py-2 font-medium text-white bg-green-500 rounded-md transition-all duration-150 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:text-gray-500'
        }
      >
        {isLoading ? 'Publishing...' : 'Publish Warp'}
      </button>

      {isLoading && (
        <p className='mt-2 text-sm text-gray-600'>Transaction in progress...</p>
      )}

      {isSuccess && txHash && (
        <div className='mt-2 text-sm'>
          <p className='text-green-600'>Transaction successful!</p>
          <p className='text-gray-700'>
            Hash: <span className='font-mono text-xs break-all'>{txHash}</span>
          </p>
          <a
            href={`https://explorer.multiversx.com/transactions/${txHash}`}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:underline'
          >
            View in Explorer
          </a>
        </div>
      )}

      {isError && (
        <p className='mt-2 text-sm text-red-500'>
          Transaction failed: {errorMessage || 'Unknown error'}
        </p>
      )}
    </div>
  );
};
