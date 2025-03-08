import { loadWalletFromFile } from "./walletUtils";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import {
  Address,
  Transaction,
  TransactionPayload,
  TransactionComputer,
  AbiRegistry,
} from "@multiversx/sdk-core";
import {
  SmartContractTransactionsFactory,
  TransactionsFactoryConfig,
} from "@multiversx/sdk-core";

import daoAbi from "./dao.abi.json";

/**
 * Creates a proposal in the DAO contract
 * @param description The proposal description text
 * @param contractAddress The DAO contract address
 * @param walletPath Path to the wallet file
 * @param password Password for the wallet file
 * @param network Network to use
 * @returns The transaction hash
 */
export async function createProposal(
  description: string,
  contractAddress: string = "erd1qqqqqqqqqqqqqpgqkr2ygjp0luge4jfjqv8z873qreuyms4xldvs42uf9f",
  walletPath: string = "./src/leo.json",
  password: string = "Leo@2003",
  network: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<string> {
  // Initialize API provider
  const apiUrl =
    network === "mainnet"
      ? "https://api.multiversx.com"
      : `https://${network}-api.multiversx.com`;
  const apiNetworkProvider = new ApiNetworkProvider(apiUrl);

  console.log(`Creating proposal on ${network}...`);
  console.log(`Contract address: ${contractAddress}`);
  console.log(`Proposal description: ${description}`);

  // Load wallet
  const { account, signer, address } = await loadWalletFromFile(
    walletPath,
    password
  );
  console.log(`Using wallet address: ${address}`);

  // Get the latest account info
  const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
  account.update(accountOnNetwork);

  // Create the transaction payload
  // Convert the description to hex encoded string
  const descriptionHex = Buffer.from(description).toString("hex");

  const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

  let factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: AbiRegistry.create(daoAbi),
  });

  let args = [description];

  const tx = factory.createTransactionForExecute({
    sender: account.address,
    contract: Address.fromBech32(contractAddress),
    function: "createProposal",
    gasLimit: BigInt(10000000), // Adequate gas for the operation
    arguments: args,
  });

  // Increment nonce for future use
  tx.nonce = BigInt(account.nonce.valueOf());
  account.incrementNonce();

  // Sign the transaction
  const computer = new TransactionComputer();
  const serializedTx = computer.computeBytesForSigning(tx);
  tx.signature = await signer.sign(serializedTx);

  // Send the transaction
  console.log("Sending transaction...");
  const txHash = await apiNetworkProvider.sendTransaction(tx);

  console.log(`Transaction sent! Hash: ${txHash}`);
  console.log(
    `Explorer URL: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/transactions/${txHash}`
  );

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
    } else {
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
    const network = networkArg ? (networkArg.split("=")[1] as any) : undefined;

    // Create the proposal
    const txHash = await createProposal(
      description,
      contract,
      wallet,
      password,
      network
    );

    console.log("\n✅ Proposal created successfully!");
    console.log(`Transaction hash: ${txHash}`);

    // Wait for confirmation
    console.log("\nWaiting for transaction to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 10000));

    console.log(
      "\n🔍 Check the transaction in the explorer to confirm it was successful"
    );
    console.log("You can now use the Vote warp to vote on this proposal!");
  } catch (error) {
    console.error("❌ Error creating proposal:", error);
    process.exit(1);
  }
}

// Run the main function if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}
