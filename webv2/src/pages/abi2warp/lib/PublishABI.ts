import { WarpAbiBuilder, WarpConfig } from '@vleap/warps';
import { sendTransactions } from 'helpers';

export const publishABI = async (abi: any, address: any) => {
  const config: WarpConfig = {
    env: 'devnet',
    userAddress: address
  };

  // Parse and format the warp if it's a string
  const builder = new WarpAbiBuilder(config);
  const tx = builder.createInscriptionTransaction(abi);

  const txHash = await sendTransactions({
    transactions: [tx]
  });

  return txHash;
};
