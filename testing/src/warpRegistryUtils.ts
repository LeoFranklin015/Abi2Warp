import { WarpConfig, WarpRegistry, WarpLink, address } from "@vleap/warps";
import {
  TransactionComputer,
  Transaction,
  UserSigner,
  Account,
  Address,
  TransactionPayload,
} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { loadWalletFromFile } from "./walletUtils";

/**
 * Network API endpoints for different environments
 */
const NETWORK_URLS = {
  devnet: "https://devnet-api.multiversx.com",
  testnet: "https://testnet-api.multiversx.com",
  mainnet: "https://api.multiversx.com",
};

/**
 * Register a warp with an alias
 * @param txHash The transaction hash of the published warp
 * @param alias The alias to register
 * @param userAddress The address of the user registering the alias
 * @param env The network environment
 * @returns The registration transaction
 */
export async function registerWarpAlias(
  txHash: string,
  alias: string,
  userAddress: string,
  env: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<Transaction> {
  try {
    console.log(
      `Registering warp alias "${alias}" for transaction ${txHash}...`
    );

    // Create config for the WarpRegistry
    const config: WarpConfig = {
      env,
      userAddress,
    };

    // Create and initialize the registry
    const registry = new WarpRegistry(config);

    // This is the critical step that was missing - initialize the registry
    await registry.init();

    // Now create the registration transaction
    const tx = registry.createWarpAliasSetTransaction(txHash, alias);

    return tx;
  } catch (error) {
    console.error("Error creating warp alias transaction:", error);
    throw error;
  }
}
