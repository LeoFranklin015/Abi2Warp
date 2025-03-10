import { WarpAbiBuilder, WarpConfig } from '@vleap/warps';
import { sendTransactions } from '@multiversx/sdk-dapp/services';
import { TransactionBatchStatusesEnum } from '@multiversx/sdk-dapp/types';
import { useTrackTransactionStatus } from '@multiversx/sdk-dapp/hooks/transactions';

export const publishABI = async (abi: any, address: any) => {
  const config: WarpConfig = {
    env: 'devnet',
    userAddress: address
  };

  if (typeof abi === 'string') {
    try {
      abi = JSON.parse(abi);
      console.log('Successfully parsed abi JSON');
    } catch (error) {
      console.error('Error parsing abi JSON:', error);
      throw new Error('Invalid abi JSON format');
    }
  }

  // Parse and format the warp if it's a string
  const builder = new WarpAbiBuilder(config);

  const tx = builder.createInscriptionTransaction(abi);
  const { sessionId } = await sendTransactions({
    transactions: [tx]
  });

  // Return the sessionId which can be used with useTrackTransactionStatus hook
  // to get the transaction hash and status updates
  return {
    sessionId,
    message: 'Use sessionId with useTrackTransactionStatus hook to get txHash'
  };
};
