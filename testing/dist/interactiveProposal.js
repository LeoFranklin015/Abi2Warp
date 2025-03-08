"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const createProposal_1 = require("./createProposal");
const readline = __importStar(require("readline"));
// Create an interface for reading from the console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
// Promise wrapper for question
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, (answer) => {
            resolve(answer);
        });
    });
}
async function runInteractive() {
    console.log("=== Interactive DAO Proposal Creator ===\n");
    try {
        // Get proposal details
        const description = await question("Enter proposal description: ");
        if (!description.trim()) {
            console.error("❌ Error: Description cannot be empty");
            rl.close();
            return;
        }
        // Get optional parameters with defaults
        const defaultContract = "erd1qqqqqqqqqqqqqpgqd2grsvwg8vln8msqe4ry7k8w63388pl2ldvsq5xpkt";
        const contractInput = await question(`Enter contract address [${defaultContract}]: `);
        const contract = contractInput.trim() || defaultContract;
        const defaultWallet = "./src/leo.json";
        const walletInput = await question(`Enter wallet file path [${defaultWallet}]: `);
        const wallet = walletInput.trim() || defaultWallet;
        const defaultPassword = "";
        const passwordInput = await question("Enter wallet password: ");
        const password = passwordInput || defaultPassword;
        const defaultNetwork = "devnet";
        const networkInput = await question(`Enter network (devnet, testnet, mainnet) [${defaultNetwork}]: `);
        const network = (networkInput.trim() || defaultNetwork);
        // Confirm details
        console.log("\nProposal details:");
        console.log(`- Description: ${description}`);
        console.log(`- Contract: ${contract}`);
        console.log(`- Wallet: ${wallet}`);
        console.log(`- Network: ${network}`);
        const confirm = await question("\nConfirm submission? (y/n): ");
        if (confirm.toLowerCase() !== "y" && confirm.toLowerCase() !== "yes") {
            console.log("Operation cancelled.");
            rl.close();
            return;
        }
        console.log("\nCreating proposal...");
        const txHash = await (0, createProposal_1.createProposal)(description, contract, wallet, password, network);
        console.log("\n✅ Proposal created successfully!");
        console.log(`Transaction hash: ${txHash}`);
        console.log(`Explorer URL: https://${network === "mainnet" ? "" : network + "-"}explorer.multiversx.com/transactions/${txHash}`);
        // Suggest next steps
        console.log("\nNext steps:");
        console.log("1. Wait for the transaction to be processed");
        console.log("2. Share the proposal ID with your community");
        console.log("3. Use the Vote warp to let users vote on your proposal");
    }
    catch (error) {
        console.error("❌ Error creating proposal:", error);
    }
    finally {
        rl.close();
    }
}
// Start the interactive process
runInteractive().catch(console.error);
