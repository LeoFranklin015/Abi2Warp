import {
  Account,
  Address,
  Transaction,
  TransactionPayload,
  UserSigner,
  TransactionComputer,
  UserSecretKey,
} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { promises as fs } from "fs";
import path from "path";

/**
 * Network API endpoints for different environments
 */
const NETWORK_URLS = {
  devnet: "https://devnet-api.multiversx.com",
  testnet: "https://testnet-api.multiversx.com",
  mainnet: "https://api.multiversx.com",
};

/**
 * Load a wallet from a JSON wallet file
 * @param walletFilePath Path to the wallet JSON file
 * @param password Password to unlock the wallet
 * @returns The loaded wallet account and signer
 */
export async function loadWalletFromFile(
  walletFilePath: string,
  password: string
) {
  try {
    // Read the wallet file
    const absolutePath = path.resolve(walletFilePath);
    const fileContent = await fs.readFile(absolutePath, { encoding: "utf8" });

    // Parse the wallet file and create a signer
    const walletObject = JSON.parse(fileContent);
    const signer = UserSigner.fromWallet(walletObject, password);

    // Get the address from the signer
    const address = signer.getAddress();
    // Create an account for the address
    const account = new Account(address);

    return { account, signer, address: address.bech32() };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("password")) {
        throw new Error(
          "Invalid wallet password. Please check your password and try again."
        );
      } else if (error.message.includes("ENOENT")) {
        throw new Error(`Wallet file not found: ${walletFilePath}`);
      }
    }
    throw error;
  }
}

/**
 * Load a wallet from a private key (less secure method)
 * @param privateKey The private key as a hex string
 * @returns The loaded wallet account and signer
 */
export function loadWalletFromPrivateKey(privateKey: string) {
  // Create a signer from the private key
  const signer = UserSigner.fromPem(
    `-----BEGIN PRIVATE KEY for ${privateKey}-----
${privateKey}
-----END PRIVATE KEY for ${privateKey}-----`
  );

  // Get the address from the signer
  const address = signer.getAddress();

  // Create an account for the address
  const account = new Account(address);

  return { account, signer, address: address.bech32() };
}

/**
 * Sign and broadcast a transaction
 * @param transaction The transaction object from createInscriptionTransaction
 * @param signer The wallet signer
 * @param account The wallet account
 * @param networkType The network type (devnet, testnet, mainnet)
 * @returns The transaction hash
 */
export async function signAndBroadcastTransaction(
  transaction: any,
  signer: UserSigner,
  account: Account,
  networkType: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<string> {
  // Create the network provider
  const apiNetworkProvider = new ApiNetworkProvider(NETWORK_URLS[networkType]);

  // Get the account nonce
  const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
  account.update(accountOnNetwork);

  // Create the transaction
  const tx = new Transaction({
    nonce: account.nonce,
    value: transaction.value || 0n,
    sender: account.address,
    receiver: new Address(transaction.receiver),
    gasLimit: transaction.gasLimit,
    chainID: transaction.chainID,
    data: TransactionPayload.fromEncoded(transaction.data),
  });

  // Sign the transaction with the TransactionComputer method (recommended approach)
  const computer = new TransactionComputer();
  const serializedTx = computer.computeBytesForSigning(tx);
  tx.signature = await signer.sign(serializedTx);

  // Broadcast the transaction
  const txHash = await apiNetworkProvider.sendTransaction(tx);

  // Return the transaction hash
  return txHash;
}

/**
 * Get the URL for a warp
 * @param txHash The transaction hash
 * @param useAlias Whether to use an alias (if available)
 * @returns The warp URL
 */
export function getWarpUrl(txHash: string, useAlias: boolean = false): string {
  return `https://warps.tools/warp/${txHash}`;
}
