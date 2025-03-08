"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWalletFromFile = loadWalletFromFile;
exports.loadWalletFromPrivateKey = loadWalletFromPrivateKey;
exports.signAndBroadcastTransaction = signAndBroadcastTransaction;
exports.getWarpUrl = getWarpUrl;
const sdk_core_1 = require("@multiversx/sdk-core");
const sdk_network_providers_1 = require("@multiversx/sdk-network-providers");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
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
async function loadWalletFromFile(walletFilePath, password) {
    try {
        // Read the wallet file
        const absolutePath = path_1.default.resolve(walletFilePath);
        const fileContent = await fs_1.promises.readFile(absolutePath, { encoding: "utf8" });
        // Parse the wallet file and create a signer
        const walletObject = JSON.parse(fileContent);
        const signer = sdk_core_1.UserSigner.fromWallet(walletObject, password);
        // Get the address from the signer
        const address = signer.getAddress();
        // Create an account for the address
        const account = new sdk_core_1.Account(address);
        return { account, signer, address: address.bech32() };
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message.includes("password")) {
                throw new Error("Invalid wallet password. Please check your password and try again.");
            }
            else if (error.message.includes("ENOENT")) {
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
function loadWalletFromPrivateKey(privateKey) {
    // Create a signer from the private key
    const signer = sdk_core_1.UserSigner.fromPem(`-----BEGIN PRIVATE KEY for ${privateKey}-----
${privateKey}
-----END PRIVATE KEY for ${privateKey}-----`);
    // Get the address from the signer
    const address = signer.getAddress();
    // Create an account for the address
    const account = new sdk_core_1.Account(address);
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
async function signAndBroadcastTransaction(transaction, signer, account, networkType = "devnet") {
    // Create the network provider
    const apiNetworkProvider = new sdk_network_providers_1.ApiNetworkProvider(NETWORK_URLS[networkType]);
    // Get the account nonce
    const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
    account.update(accountOnNetwork);
    // Create the transaction
    const tx = new sdk_core_1.Transaction({
        nonce: account.nonce,
        value: transaction.value || 0n,
        sender: account.address,
        receiver: new sdk_core_1.Address(transaction.receiver),
        gasLimit: transaction.gasLimit,
        chainID: transaction.chainID,
        data: sdk_core_1.TransactionPayload.fromEncoded(transaction.data),
    });
    // Sign the transaction with the TransactionComputer method (recommended approach)
    const computer = new sdk_core_1.TransactionComputer();
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
function getWarpUrl(txHash, useAlias = false) {
    return `https://warps.tools/warp/${txHash}`;
}
