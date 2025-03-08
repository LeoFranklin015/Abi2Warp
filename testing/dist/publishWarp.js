"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishWarpWithWalletFile = publishWarpWithWalletFile;
exports.publishWarp = publishWarp;
const createTippingWarp_1 = require("./createTippingWarp");
const walletUtils_1 = require("./walletUtils");
const warpLinkUtils_1 = require("./warpLinkUtils");
const warpRegistryUtils_1 = require("./warpRegistryUtils");
/**
 * Publish a warp using a wallet file and get its URL
 * @param walletFilePath Path to the MultiversX wallet JSON file
 * @param password Password to unlock the wallet
 * @param env The network environment
 * @param recipients Optional array of recipient addresses to generate links for
 * @returns The URL of the published warp and optional recipient links
 */
async function publishWarpWithWalletFile(walletFilePath, password, env = "devnet", recipients) {
    try {
        console.log(`Publishing warp on ${env} using wallet file...`);
        // Load the wallet from file
        const { account, signer, address } = await (0, walletUtils_1.loadWalletFromFile)(walletFilePath, password);
        console.log(`Using wallet address: ${address}`);
        // Configure WarpBuilder with the loaded wallet address
        const config = {
            env,
            userAddress: address,
        };
        // Create the warp and get the transaction
        console.log("Creating tipping warp...");
        const { warp, transaction } = await (0, createTippingWarp_1.createAndInscribeWarp)(config);
        console.log("Warp created, preparing transaction...");
        // Sign and broadcast the transaction
        console.log("Signing and broadcasting transaction...");
        const txHash = await (0, walletUtils_1.signAndBroadcastTransaction)(transaction, signer, account, env);
        console.log(`Transaction submitted! Hash: ${txHash}`);
        let warpUrl = (0, walletUtils_1.getWarpUrl)(txHash);
        console.log(`Warp URL: ${warpUrl}`);
        await new Promise((resolve) => setTimeout(resolve, 30000));
        let aliasUrl;
        try {
            // Try to register the alias
            const registerTx = await (0, warpRegistryUtils_1.registerWarpAlias)(txHash, "testing-leo", address, env);
            console.log("Warp alias registration transaction created!");
            // Increment nonce again before sending the second transaction
            account.incrementNonce();
            // Sign and broadcast the alias registration transaction
            const aliasTxHash = await (0, walletUtils_1.signAndBroadcastTransaction)(registerTx, signer, account, env);
            console.log(`Alias registration transaction submitted! Hash: ${aliasTxHash}`);
            // Construct the alias URL
            const baseUrl = env === "mainnet"
                ? "https://warps.tools"
                : `https://${env}.warps.tools`;
            aliasUrl = `${baseUrl}/warp/alias/test`;
            console.log(`Your warp is also available at: ${aliasUrl}`);
        }
        catch (error) {
            console.error("Failed to register alias:", error);
            console.log("Continuing without alias registration.");
        }
        // Create result object
        const result = {
            warpUrl: "",
            txHash,
        };
        if (aliasUrl) {
            result.aliasUrl = aliasUrl;
        }
        // Generate recipient-specific links if recipients were provided
        if (recipients && recipients.length > 0) {
            result.recipientLinks = {};
            console.log("\nRecipient-specific tipping links:");
            recipients.forEach((recipient) => {
                const recipientLink = (0, warpLinkUtils_1.createTippingLink)(txHash, recipient, env);
                result.recipientLinks[recipient] = recipientLink;
                console.log(`- ${recipient}: ${recipientLink}`);
            });
        }
        return result;
    }
    catch (error) {
        console.error("Error publishing warp:", error);
        throw error;
    }
}
/**
 * Publish a warp using a private key and get its URL
 * @param privateKey Your private key (keep this secure!)
 * @param env The network environment
 * @param recipients Optional array of recipient addresses to generate links for
 * @returns The URL of the published warp and optional recipient links
 */
async function publishWarp(privateKey, env = "devnet", recipients) {
    try {
        console.log(`Publishing warp on ${env} using private key...`);
        // Load the wallet from private key
        const { account, signer, address } = (0, walletUtils_1.loadWalletFromPrivateKey)(privateKey);
        console.log(`Using wallet address: ${address}`);
        // Configure WarpBuilder with the loaded wallet address
        const config = {
            env,
            userAddress: address,
        };
        // Create the warp and get the transaction
        console.log("Creating tipping warp...");
        const { warp, transaction } = await (0, createTippingWarp_1.createAndInscribeWarp)(config);
        console.log("Warp created, preparing transaction...");
        // Sign and broadcast the transaction
        console.log("Signing and broadcasting transaction...");
        const txHash = await (0, walletUtils_1.signAndBroadcastTransaction)(transaction, signer, account, env);
        console.log(`Transaction submitted! Hash: ${txHash}`);
        // Get the warp URL
        const warpUrl = (0, walletUtils_1.getWarpUrl)(txHash);
        console.log(`🎉 Warp published successfully!`);
        console.log(`Your warp is available at: ${warpUrl}`);
        let aliasUrl;
        try {
            // Try to register the alias
            const registerTx = await (0, warpRegistryUtils_1.registerWarpAlias)(txHash, "test", address, env);
            console.log("Warp alias registration transaction created!");
            // Increment nonce again before sending the second transaction
            account.incrementNonce();
            // Sign and broadcast the alias registration transaction
            const aliasTxHash = await (0, walletUtils_1.signAndBroadcastTransaction)(registerTx, signer, account, env);
            console.log(`Alias registration transaction submitted! Hash: ${aliasTxHash}`);
            // Construct the alias URL
            const baseUrl = env === "mainnet"
                ? "https://warps.tools"
                : `https://${env}.warps.tools`;
            aliasUrl = `${baseUrl}/warp/alias/test`;
            console.log(`Your warp is also available at: ${aliasUrl}`);
        }
        catch (error) {
            console.error("Failed to register alias:", error);
            console.log("Continuing without alias registration.");
        }
        // Create result object
        const result = {
            warpUrl,
            txHash,
        };
        if (aliasUrl) {
            result.aliasUrl = aliasUrl;
        }
        // Generate recipient-specific links if recipients were provided
        if (recipients && recipients.length > 0) {
            result.recipientLinks = {};
            console.log("\nRecipient-specific tipping links:");
            recipients.forEach((recipient) => {
                const recipientLink = (0, warpLinkUtils_1.createTippingLink)(txHash, recipient, env);
                result.recipientLinks[recipient] = recipientLink;
                console.log(`- ${recipient}: ${recipientLink}`);
            });
        }
        return result;
    }
    catch (error) {
        console.error("Error publishing warp:", error);
        throw error;
    }
}
/**
 * Main function to run the warp publication process
 */
async function main() {
    // SECURITY WARNING: Never hardcode your private key in production code!
    // For real applications, use environment variables or a secure vault
    const privateKey = process.env.PRIVATE_KEY;
    const walletFile = process.env.WALLET_FILE;
    const walletPassword = process.env.WALLET_PASSWORD;
    // Choose the network to publish on
    const network = (process.env.NETWORK || "devnet");
    // Optional list of recipient addresses to create tipping links for
    const recipients = process.env.RECIPIENTS
        ? process.env.RECIPIENTS.split(",")
        : undefined;
    try {
        let result;
        if (walletFile && walletPassword) {
            // Use wallet file authentication if available
            result = await publishWarpWithWalletFile(walletFile, walletPassword, network, recipients);
        }
        else if (privateKey) {
            // Fallback to private key authentication
            result = await publishWarp(privateKey, network, recipients);
        }
        else {
            // No authentication method provided
            console.error("❌ Error: Authentication method required!");
            console.log("Please provide either:");
            console.log("1. Wallet file and password:");
            console.log("   WALLET_FILE=path/to/wallet.json WALLET_PASSWORD=your_password node dist/publishWarp.js");
            console.log("2. Private key:");
            console.log("   PRIVATE_KEY=your_private_key node dist/publishWarp.js");
            console.log("\nYou can also specify recipient addresses to create tipping links for:");
            console.log("   RECIPIENTS=erd1...,erd2... node dist/publishWarp.js");
            process.exit(1);
        }
        // Print summary of the result
        console.log("\n========================================");
        console.log("🎉 Warp Publication Summary 🎉");
        console.log("========================================");
        console.log(`Warp URL: ${result.warpUrl}`);
        if (result.aliasUrl) {
            console.log(`Alias URL: ${result.aliasUrl}`);
        }
        console.log(`Transaction hash: ${result.txHash}`);
        console.log("========================================");
    }
    catch (error) {
        console.error("❌ Failed to publish warp:", error);
        process.exit(1);
    }
}
// Run the main function if this script is executed directly
if (require.main === module) {
    main().catch(console.error);
}
