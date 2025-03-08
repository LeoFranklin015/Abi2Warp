"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploySmartContract = void 0;
const node_fs_1 = require("node:fs");
const sdk_core_1 = require("@multiversx/sdk-core");
const sdk_network_providers_1 = require("@multiversx/sdk-network-providers");
const walletUtils_1 = require("./walletUtils");
const deploySmartContract = async (walletPath = "./src/leo.json", password = "Leo@2003", network = "devnet") => {
    // Initialize API provider
    const apiUrl = "https://devnet-api.multiversx.com";
    const apiNetworkProvider = new sdk_network_providers_1.ApiNetworkProvider(apiUrl);
    console.log(`Using network: ${network} (${apiUrl})`);
    console.log(`Loading wallet from: ${walletPath}`);
    // Load wallet
    const { account, signer, address } = await (0, walletUtils_1.loadWalletFromFile)(walletPath, password);
    console.log(`Deploying contract from address: ${address}`);
    // Load smart contract code
    console.log("Loading fordao smart contract code...");
    const codeBuffer = await node_fs_1.promises.readFile("./src/dao.wasm");
    const code = sdk_core_1.Code.fromBuffer(codeBuffer);
    // Load ABI file
    console.log("Loading fordao ABI...");
    const abiFile = await node_fs_1.promises.readFile("./src/dao.abi.json", "utf-8");
    const abiObj = JSON.parse(abiFile);
    // Get chain ID based on network
    const chainID = network === "mainnet" ? "1" : network === "testnet" ? "T" : "D";
    console.log(`Using chain ID: ${chainID}`);
    // Prepare transfer transactions factory
    const factoryConfig = new sdk_core_1.TransactionsFactoryConfig({ chainID });
    let scFactory = new sdk_core_1.SmartContractTransactionsFactory({
        config: factoryConfig,
        abi: sdk_core_1.AbiRegistry.create(abiObj),
    });
    // Prepare deploy transaction
    console.log("Creating deployment transaction...");
    const deployTransaction = scFactory.createTransactionForDeploy({
        sender: new sdk_core_1.Address(address),
        bytecode: code.valueOf(),
        gasLimit: 50000000n, // Increased gas limit for potentially larger contract
        arguments: [], // Pass arguments for init function if needed
        // Below ones are optional with default values
        nativeTransferAmount: 0n,
        isUpgradeable: true,
        isReadable: true,
        isPayable: true,
        isPayableBySmartContract: true,
    });
    // Synchronize account with network to get latest nonce
    const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
    account.update(accountOnNetwork);
    console.log(`Current account nonce: ${account.nonce}`);
    // Set the nonce
    deployTransaction.nonce = BigInt(account.nonce.valueOf());
    account.incrementNonce();
    // Serialize the transaction for signing
    const computer = new sdk_core_1.TransactionComputer();
    const serializedDeployTransaction = computer.computeBytesForSigning(deployTransaction);
    // Sign the transaction with our signer
    console.log("Signing transaction...");
    deployTransaction.signature = await signer.sign(serializedDeployTransaction);
    // Broadcast the transaction
    console.log("Broadcasting transaction...");
    const txHash = await apiNetworkProvider.sendTransaction(deployTransaction);
    console.log(`Transaction sent! Hash: ${txHash}`);
    console.log("Waiting for transaction to be processed...");
    // Get the transaction on network using TransactionWatcher
    const transactionOnNetwork = await new sdk_core_1.TransactionWatcher(apiNetworkProvider).awaitCompleted(txHash);
    // Parse the results with TransactionsConverter and SmartContractTransactionsOutcomeParser
    console.log("Parsing deployment outcome...");
    const converter = new sdk_core_1.TransactionsConverter();
    const parser = new sdk_core_1.SmartContractTransactionsOutcomeParser();
    const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
    const parsedOutcome = parser.parseDeploy({ transactionOutcome });
    console.log("\n===== DEPLOYMENT SUCCESSFUL =====");
    console.log(`Smart Contract deployed at: ${parsedOutcome.contracts[0].address}`);
    console.log(`Explorer URL: https://${network === "mainnet" ? "" : network + "-"}explorer.multiversx.com/accounts/${parsedOutcome.contracts[0].address}`);
    console.log(`Transaction: https://${network === "mainnet" ? "" : network + "-"}explorer.multiversx.com/transactions/${txHash}`);
    console.log("=================================\n");
    return {
        contractAddress: parsedOutcome.contracts[0].address,
        txHash,
    };
};
exports.deploySmartContract = deploySmartContract;
// Check if this script is run directly
if (require.main === module) {
    // Check for command line arguments
    const args = process.argv.slice(2);
    const walletPath = args[0] || "./src/leo.json";
    const password = args[1] || "Leo@2003";
    const network = (args[2] || "devnet");
    deploySmartContract(walletPath, password, network)
        .then(({ contractAddress }) => {
        console.log("Deployment script completed successfully");
        console.log(`Contract address: ${contractAddress}`);
    })
        .catch((error) => {
        console.error("Failed to deploy contract:", error);
        process.exit(1);
    });
}
