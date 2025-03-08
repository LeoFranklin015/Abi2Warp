"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createTippingWarp_1 = require("./createTippingWarp");
/**
 * Main function to create and display a tipping warp
 */
async function main() {
    console.log("Creating a tipping warp...");
    // Configure the WarpBuilder
    // Replace this with your own configuration
    const config = {
        env: "devnet", // Use 'testnet' or 'mainnet' for real networks
        userAddress: "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th", // REQUIRED for inscription tx
    };
    try {
        // Create the warp
        const warp = await (0, createTippingWarp_1.createTippingWarp)(config);
        console.log("Tipping warp created successfully!");
        console.log(JSON.stringify(warp, null, 2));
        // Only try to create inscription if explicitly enabled
        const shouldCreateInscription = true; // Change to true when you're ready to create the inscription
        if (shouldCreateInscription) {
            console.log("Creating inscription transaction...");
            const { transaction } = await (0, createTippingWarp_1.createAndInscribeWarp)(config);
            console.log("Inscription transaction created:");
            // console.log(JSON.stringify(transaction, null, 2));
        }
        else {
            console.log("\nInscription transaction creation is disabled.");
            console.log("To create an inscription transaction, set shouldCreateInscription to true");
        }
        console.log("\nNext steps:");
        console.log("1. Set shouldCreateInscription to true to generate a transaction");
        console.log("2. Sign and send the transaction to the blockchain");
        console.log("3. Share your warp URL with others");
    }
    catch (error) {
        console.error("Error creating the tipping warp:", error);
    }
}
// Run the example if this file is executed directly
if (require.main === module) {
    main().catch(console.error);
}
