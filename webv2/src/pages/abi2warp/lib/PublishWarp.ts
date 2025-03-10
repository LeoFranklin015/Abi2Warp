import { WarpBuilder, WarpConfig } from '@vleap/warps';
import { sendTransactions } from 'helpers';
import { useGetAccountInfo } from 'hooks';
import { publishABI } from './PublishABI';

export const publishWarp = async (warp: any, address: any) => {
  const config: WarpConfig = {
    env: 'devnet',
    userAddress: address
  };

  // Parse and format the warp if it's a string
  let formattedWarp = warp;
  if (typeof warp === 'string') {
    try {
      formattedWarp = JSON.parse(warp);
      console.log('Successfully parsed warp JSON');
    } catch (error) {
      console.error('Error parsing warp JSON:', error);
      throw new Error('Invalid warp JSON format');
    }
  }

  // Validate essential warp properties
  if (
    !formattedWarp.protocol ||
    !formattedWarp.name ||
    !formattedWarp.actions
  ) {
    throw new Error('Warp must contain protocol, name, and actions properties');
  }

  const builder = new WarpBuilder(config);
  const tx = builder.createInscriptionTransaction(formattedWarp);

  const txHash = await sendTransactions({
    transactions: [tx]
  });

  console.log(txHash);
  return txHash;
};
