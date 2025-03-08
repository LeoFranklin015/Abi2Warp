"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProposalsFromFile = createProposalsFromFile;
const createProposal_1 = require("./createProposal");
const fs_1 = require("fs");
/**
 * Creates multiple proposals from a file
 * @param filePath Path to file with proposals (one per line)
 * @param contractAddress DAO contract address
 * @param walletPath Path to wallet file
 * @param password Wallet password
 * @param network Network to use
 */
async function createProposalsFromFile(filePath, contractAddress = "erd1qqqqqqqqqqqqqpgqd2grsvwg8vln8msqe4ry7k8w63388pl2ldvsq5xpkt", walletPath = "./src/leo.json", password = "Leo@2003", network = "devnet") {
    try {
        console.log(`Reading proposals from ${filePath}...`);
        // Read file
        const content = await fs_1.promises.readFile(filePath, "utf8");
        // Split into lines and filter out empty lines
        const proposals = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"));
        console.log(`Found ${proposals.length} proposals to create`);
        // Process each proposal
        const results = [];
        for (let i = 0; i < proposals.length; i++) {
            const description = proposals[i];
            console.log(`\nCreating proposal ${i + 1}/${proposals.length}: ${description}`);
            try {
                const txHash = await (0, createProposal_1.createProposal)(description, contractAddress, walletPath, password, network);
                results.push({
                    description,
                    txHash,
                    status: "success",
                });
                // Add a delay between transactions to avoid nonce issues
                if (i < proposals.length - 1) {
                    console.log("Waiting before next proposal...");
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                }
            }
            catch (error) {
                console.error(`Failed to create proposal: ${description}`, error);
                results.push({
                    description,
                    error: error instanceof Error ? error.message : String(error),
                    status: "failed",
                });
            }
        }
        // Print summary
        console.log("\n=== Proposal Creation Summary ===");
        console.log(`Total proposals: ${proposals.length}`);
        console.log(`Successful: ${results.filter((r) => r.status === "success").length}`);
        console.log(`Failed: ${results.filter((r) => r.status === "failed").length}`);
        console.log("\nTransaction hashes:");
        results
            .filter((r) => r.status === "success")
            .forEach((r) => console.log(`- ${r.description.substring(0, 30)}...: ${r.txHash}`));
        // Save results to file
        const resultOutput = {
            timestamp: new Date().toISOString(),
            contract: contractAddress,
            network,
            total: proposals.length,
            results,
        };
        await fs_1.promises.writeFile(`proposal-results-${Date.now()}.json`, JSON.stringify(resultOutput, null, 2));
        console.log("\nResults saved to file.");
    }
    catch (error) {
        console.error("Error processing proposals file:", error);
        throw error;
    }
}
// Main function
async function main() {
    const args = process.argv.slice(2);
    // Check for help
    if (args.includes("--help") || args.includes("-h")) {
        console.log(`
Batch DAO Proposal Creator

Usage:
  node dist/batchProposals.js <file> [options]

Arguments:
  file                   Path to file with proposals (one per line)

Options:
  --contract=ADDRESS     DAO contract address
  --wallet=PATH          Path to wallet JSON file
  --password=PASSWORD    Wallet password
  --network=NETWORK      Network (devnet, testnet, mainnet)
  --help                 Show this help message

Examples:
  node dist/batchProposals.js ./proposals.txt
  node dist/batchProposals.js ./proposals.txt --contract=erd1... --network=testnet

File format:
  # This is a comment
  First proposal description
  Second proposal description
  Third proposal description
    `);
        return;
    }
    const filePath = args[0];
    if (!filePath) {
        console.error("❌ Error: File path is required");
        console.log("Use --help for usage information");
        process.exit(1);
    }
    // Extract options
    const contractArg = args.find((arg) => arg.startsWith("--contract="));
    const walletArg = args.find((arg) => arg.startsWith("--wallet="));
    const passwordArg = args.find((arg) => arg.startsWith("--password="));
    const networkArg = args.find((arg) => arg.startsWith("--network="));
    const contract = contractArg ? contractArg.split("=")[1] : undefined;
    const wallet = walletArg ? walletArg.split("=")[1] : undefined;
    const password = passwordArg ? passwordArg.split("=")[1] : undefined;
    const network = networkArg ? networkArg.split("=")[1] : undefined;
    try {
        await createProposalsFromFile(filePath, contract, wallet, password, network);
        console.log("Batch processing completed successfully");
    }
    catch (error) {
        console.error("❌ Error in batch processing:", error);
        process.exit(1);
    }
}
// Run if directly executed
if (require.main === module) {
    main().catch(console.error);
}
