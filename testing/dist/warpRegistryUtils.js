"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerWarpAlias = registerWarpAlias;
const warps_1 = require("@vleap/warps");
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
async function registerWarpAlias(txHash, alias, userAddress, env = "devnet") {
    try {
        console.log(`Registering warp alias "${alias}" for transaction ${txHash}...`);
        // Create config for the WarpRegistry
        const config = {
            env,
            userAddress,
        };
        // Create and initialize the registry
        const registry = new warps_1.WarpRegistry(config);
        // This is the critical step that was missing - initialize the registry
        await registry.init();
        // Now create the registration transaction
        const tx = registry.createWarpAliasSetTransaction(txHash, alias);
        return tx;
    }
    catch (error) {
        console.error("Error creating warp alias transaction:", error);
        throw error;
    }
}
