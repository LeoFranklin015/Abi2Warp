import { promises } from "node:fs";
import {
  TransactionComputer,
  TransactionsFactoryConfig,
  SmartContractTransactionsFactory,
  Code,
  Address,
  AbiRegistry,
  TransactionWatcher,
  SmartContractTransactionsOutcomeParser,
  TransactionsConverter,
} from "@multiversx/sdk-core";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { loadWalletFromFile } from "./walletUtils";

const deploySmartContract = async (
  walletPath: string = "./src/leo.json",
  password: string = "Leo@2003",
  network: "devnet" | "testnet" | "mainnet" = "devnet"
) => {
  // Initialize API provider
  const apiUrl = "https://devnet-api.multiversx.com";
  const apiNetworkProvider = new ApiNetworkProvider(apiUrl);

  console.log(`Using network: ${network} (${apiUrl})`);
  console.log(`Loading wallet from: ${walletPath}`);

  // Load wallet
  const { account, signer, address } = await loadWalletFromFile(
    walletPath,
    password
  );
  console.log(`Deploying contract from address: ${address}`);

  // Load smart contract code
  console.log("Loading fordao smart contract code...");
  const codeBuffer = await promises.readFile("./src/dao.wasm");
  const code = Code.fromBuffer(codeBuffer);

  // Load ABI file
  console.log("Loading fordao ABI...");
  const abiFile = await promises.readFile("./src/dao.abi.json", "utf-8");
  const abiObj = JSON.parse(abiFile);

  // Get chain ID based on network
  const chainID =
    network === "mainnet" ? "1" : network === "testnet" ? "T" : "D";
  console.log(`Using chain ID: ${chainID}`);

  // Prepare transfer transactions factory
  const factoryConfig = new TransactionsFactoryConfig({ chainID });
  let scFactory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: AbiRegistry.create(abiObj),
  });

  // Prepare deploy transaction
  console.log("Creating deployment transaction...");
  const deployTransaction = scFactory.createTransactionForDeploy({
    sender: new Address(address),
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
  const computer = new TransactionComputer();
  const serializedDeployTransaction =
    computer.computeBytesForSigning(deployTransaction);

  // Sign the transaction with our signer
  console.log("Signing transaction...");
  deployTransaction.signature = await signer.sign(serializedDeployTransaction);

  // Broadcast the transaction
  console.log("Broadcasting transaction...");
  const txHash = await apiNetworkProvider.sendTransaction(deployTransaction);

  console.log(`Transaction sent! Hash: ${txHash}`);
  console.log("Waiting for transaction to be processed...");

  // Get the transaction on network using TransactionWatcher
  const transactionOnNetwork = await new TransactionWatcher(
    apiNetworkProvider
  ).awaitCompleted(txHash);

  // Parse the results with TransactionsConverter and SmartContractTransactionsOutcomeParser
  console.log("Parsing deployment outcome...");
  const converter = new TransactionsConverter();
  const parser = new SmartContractTransactionsOutcomeParser();
  const transactionOutcome =
    converter.transactionOnNetworkToOutcome(transactionOnNetwork);
  const parsedOutcome = parser.parseDeploy({ transactionOutcome });

  console.log("\n===== DEPLOYMENT SUCCESSFUL =====");
  console.log(
    `Smart Contract deployed at: ${parsedOutcome.contracts[0].address}`
  );
  console.log(
    `Explorer URL: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/accounts/${parsedOutcome.contracts[0].address}`
  );
  console.log(
    `Transaction: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/transactions/${txHash}`
  );
  console.log("=================================\n");

  return {
    contractAddress: parsedOutcome.contracts[0].address,
    txHash,
  };
};

// Check if this script is run directly
if (require.main === module) {
  // Check for command line arguments
  const args = process.argv.slice(2);
  const walletPath = args[0] || "./src/leo.json";
  const password = args[1] || "Leo@2003";
  const network = (args[2] || "devnet") as "devnet" | "testnet" | "mainnet";

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

export { deploySmartContract };
