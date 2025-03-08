"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTippingWarp = createTippingWarp;
exports.createAndInscribeWarp = createAndInscribeWarp;
const warps_1 = require("@vleap/warps");
/**
 * Creates a complete tipping warp matching the exact structure
 * @param config WarpConfig object with environment settings
 * @returns A promise that resolves to the created Warp
 */
async function createTippingWarp(config) {
    const builder = new warps_1.WarpBuilder(config);
    // Define the tipping action
    const tipAction = {
        type: "contract",
        label: "Tip now",
        address: "erd1qqqqqqqqqqqqqpgqszhrp70u9vmutn9yr4xgjhrfwakxzvd5l3ts3aem69",
        func: "tip",
        args: ["address:{{RECEIVER}}"],
        gasLimit: 5000000,
        inputs: [
            {
                name: "Amount",
                type: "esdt",
                position: "transfer",
                source: "field",
                required: true,
            },
            {
                name: "Note",
                type: "string",
                position: "arg:2",
                source: "field",
                required: true,
            },
        ],
    };
    // Build the basic warp structure
    builder
        .setName("Tipping: Tip")
        .setTitle("Tip a User")
        .setDescription("Tip a user with any token.")
        .setPreview("https://vleap.io/images/external/warps/tip.jpg")
        .addAction(tipAction);
    // Build the initial warp
    const warp = await builder.build();
    // Manually set the protocol and vars properties since they may not have builder methods
    const completeWarp = {
        ...warp,
        protocol: "warp:0.1.0",
        vars: {
            RECEIVER: "query:to",
        },
    };
    return completeWarp;
}
/**
 * Creates and stores a warp in the blockchain
 * @param config WarpConfig object
 * @returns An object containing the warp and its inscription transaction
 */
async function createAndInscribeWarp(config) {
    // Check if userAddress is set
    if (!config.userAddress) {
        throw new Error("userAddress is required in WarpConfig to create an inscription transaction");
    }
    try {
        // Create the builder instance
        const builder = new warps_1.WarpBuilder(config);
        // Create the complete warp
        const warp = await createTippingWarp(config);
        // Generate the inscription transaction
        const tx = builder.createInscriptionTransaction(warp);
        return {
            warp,
            transaction: tx,
        };
    }
    catch (error) {
        console.error("Error creating or inscribing warp:", error);
        throw error;
    }
}
/**
 * Example usage of the tipping warp creator
 */
async function example() {
    // Configure the WarpBuilder
    const config = {
        env: "devnet", // or 'testnet' or 'mainnet'
        // You need to set userAddress for creating inscription transactions
        userAddress: "erd1x97p9p64vh6u76h8643n0ecwj3msj85umcmnu8txsxmw77f3jyzqxxlmgf",
    };
    try {
        // Create the complete warp
        const warp = await createTippingWarp(config);
        console.log("Tipping warp created:", JSON.stringify(warp, null, 2));
        // Create the inscription transaction if needed
        // const { transaction } = await createAndInscribeWarp(config);
        // console.log("Inscription transaction:", transaction);
        // This transaction would then need to be signed and sent to the blockchain
        return warp;
    }
    catch (error) {
        console.error("Error in example:", error);
        throw error;
    }
}
// Uncomment to run the example
// example().catch(console.error);
