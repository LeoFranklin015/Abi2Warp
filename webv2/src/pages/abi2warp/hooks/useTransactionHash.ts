import { useState, useEffect } from 'react';
import { useTrackTransactionStatus } from '@multiversx/sdk-dapp/hooks/transactions';
import { TransactionServerStatusesEnum } from '@multiversx/sdk-dapp/types';

/**
 * Custom hook to get transaction hash from a session ID
 * @param sessionId The session ID returned from sendTransactions
 * @returns An object containing the transaction hash, status, and any error
 */
export const useTransactionHash = (sessionId: string | null) => {
  const [txHash, setTxHash] = useState<string | null>(null);

  // Use the MultiversX SDK hook to track transaction status
  const transactionStatus = useTrackTransactionStatus({
    transactionId: sessionId
  });

  // Update txHash when transaction becomes available
  useEffect(() => {
    if (
      transactionStatus.transactions &&
      transactionStatus.transactions.length > 0 &&
      transactionStatus.transactions[0].hash
    ) {
      setTxHash(transactionStatus.transactions[0].hash);
    }
  }, [transactionStatus]);

  return {
    txHash,
    status: transactionStatus.status,
    transactions: transactionStatus.transactions,
    errorMessage: transactionStatus.errorMessage,
    isLoading: transactionStatus.isPending,
    isSuccess: transactionStatus.isSuccessful,
    isError: transactionStatus.isFailed
  };
};
