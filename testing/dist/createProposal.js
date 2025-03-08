"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProposal = createProposal;
const walletUtils_1 = require("./walletUtils");
const sdk_network_providers_1 = require("@multiversx/sdk-network-providers");
const sdk_core_1 = require("@multiversx/sdk-core");
const sdk_core_2 = require("@multiversx/sdk-core");
const dao_abi_json_1 = __importDefault(require("./dao.abi.json"));
/**
 * Creates a proposal in the DAO contract
 * @param description The proposal description text
 * @param contractAddress The DAO contract address
 * @param walletPath Path to the wallet file
 * @param password Password for the wallet file
 * @param network Network to use
 * @returns The transaction hash
 */
async function createProposal(description, contractAddress = "erd1qqqqqqqqqqqqqpgqkr2ygjp0luge4jfjqv8z873qreuyms4xldvs42uf9f", walletPath = "./src/leo.json", password = "Leo@2003", network = "devnet") {
    // Initialize API provider
    const apiUrl = network === "mainnet"
        ? "https://api.multiversx.com"
        : `https://${network}-api.multiversx.com`;
    const apiNetworkProvider = new sdk_network_providers_1.ApiNetworkProvider(apiUrl);
    console.log(`Creating proposal on ${network}...`);
    console.log(`Contract address: ${contractAddress}`);
    console.log(`Proposal description: ${description}`);
    // Load wallet
    const { account, signer, address } = await (0, walletUtils_1.loadWalletFromFile)(walletPath, password);
    console.log(`Using wallet address: ${address}`);
    // Get the latest account info
    const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
    account.update(accountOnNetwork);
    // Create the transaction payload
    // Convert the description to hex encoded string
    const descriptionHex = Buffer.from(description).toString("hex");
    const factoryConfig = new sdk_core_2.TransactionsFactoryConfig({ chainID: "D" });
    let factory = new sdk_core_2.SmartContractTransactionsFactory({
        config: factoryConfig,
        abi: sdk_core_1.AbiRegistry.create(dao_abi_json_1.default),
    });
    let args = [description];
    const tx = factory.createTransactionForExecute({
        sender: account.address,
        contract: sdk_core_1.Address.fromBech32(contractAddress),
        function: "createProposal",
        gasLimit: BigInt(10000000), // Adequate gas for the operation
        arguments: args,
    });
    // Increment nonce for future use
    tx.nonce = BigInt(account.nonce.valueOf());
    account.incrementNonce();
    // Sign the transaction
    const computer = new sdk_core_1.TransactionComputer();
    const serializedTx = computer.computeBytesForSigning(tx);
    tx.signature = await signer.sign(serializedTx);
    // Send the transaction
    console.log("Sending transaction...");
    const txHash = await apiNetworkProvider.sendTransaction(tx);
    console.log(`Transaction sent! Hash: ${txHash}`);
    console.log(`Explorer URL: https://${network === "mainnet" ? "" : network + "-"}explorer.multiversx.com/transactions/${txHash}`);
    return txHash;
}
// Command line interface
async function main() {
    try {
        const args = process.argv.slice(2);
        // Check for help
        if (args.includes("--help") || args.includes("-h")) {
            console.log(`
DAO Proposal Creator

Usage:
  node dist/createProposal.js [description] [options]

Arguments:
  description            The proposal description text (required)

Options:
  --contract=ADDRESS     DAO contract address
  --wallet=PATH          Path to wallet JSON file
  --password=PASSWORD    Wallet password
  --network=NETWORK      Network (devnet, testnet, mainnet)
  --help                 Show this help message

Examples:
  node dist/createProposal.js "My proposal description"
  node dist/createProposal.js "Increase user limits" --contract=erd1... --network=testnet
      `);
            return;
        }
        // Get description from the first non-option argument or from --description=
        let description = "";
        const descriptionArg = args.find((arg) => arg.startsWith("--description="));
        if (descriptionArg) {
            description = descriptionArg.split("=")[1];
        }
        else {
            // Find the first argument that's not an option
            const nonOptionArg = args.find((arg) => !arg.startsWith("--"));
            if (nonOptionArg) {
                description = nonOptionArg;
            }
        }
        if (!description) {
            console.error("❌ Error: Proposal description is required");
            console.log("Use --help for usage information");
            process.exit(1);
        }
        // Extract other options
        const contractArg = args.find((arg) => arg.startsWith("--contract="));
        const walletArg = args.find((arg) => arg.startsWith("--wallet="));
        const passwordArg = args.find((arg) => arg.startsWith("--password="));
        const networkArg = args.find((arg) => arg.startsWith("--network="));
        const contract = contractArg ? contractArg.split("=")[1] : undefined;
        const wallet = walletArg ? walletArg.split("=")[1] : undefined;
        const password = passwordArg ? passwordArg.split("=")[1] : undefined;
        const network = networkArg ? networkArg.split("=")[1] : undefined;
        // Create the proposal
        const txHash = await createProposal(description, contract, wallet, password, network);
        console.log("\n✅ Proposal created successfully!");
        console.log(`Transaction hash: ${txHash}`);
        // Wait for confirmation
        console.log("\nWaiting for transaction to be processed...");
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log("\n🔍 Check the transaction in the explorer to confirm it was successful");
        console.log("You can now use the Vote warp to vote on this proposal!");
    }
    catch (error) {
        console.error("❌ Error creating proposal:", error);
        process.exit(1);
    }
}
// Run the main function if script is executed directly
if (require.main === module) {
    main().catch(console.error);
}
