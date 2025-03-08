import { WarpBuilder, WarpConfig, Warp } from "@vleap/warps";
import { loadWalletFromFile } from "./walletUtils";
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";
import { signAndBroadcastTransaction } from "./walletUtils";

/**
 * Creates a DAO voting warp for the specified contract
 * @param contractAddress The deployed DAO contract address
 * @param walletPath Path to the wallet file
 * @param password Password for the wallet file
 * @param network Network to deploy on
 * @returns The created warp and transaction hash
 */
export async function createDaoVoteWarp(
  contractAddress: string = "erd1qqqqqqqqqqqqqpgqa2h4d6rufxlu76l3zx5xdsh2suk94ynsldvsr8nusj",
  walletPath: string = "./src/leo.json",
  password: string = "Leo@2003",
  network: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<{ warp: Warp; txHash: string; warpUrl: string }> {
  // Initialize API provider
  const apiUrl =
    network === "mainnet"
      ? "https://api.multiversx.com"
      : `https://${network}-api.multiversx.com`;
  const apiNetworkProvider = new ApiNetworkProvider(apiUrl);

  console.log(`Creating DAO voting warp on ${network}`);
  console.log(`Contract address: ${contractAddress}`);

  // Load wallet
  const { account, signer, address } = await loadWalletFromFile(
    walletPath,
    password
  );
  console.log(`Using wallet address: ${address}`);

  // Configure WarpBuilder
  const config: WarpConfig = {
    env: network,
    userAddress: address,
  };

  const builder = new WarpBuilder(config);

  // Build the warp
  builder
    .setName("DAO Vote")
    .setTitle("Vote on DAO Proposal")
    .setDescription("Cast your vote on a DAO proposal (For or Against)")
    .setPreview("https://vleap.io/images/external/warps/vote.jpg")
    .addAction({
      type: "contract",
      label: "Cast Vote",
      address: contractAddress,
      func: "vote",
      args: [],
      gasLimit: 10000000,
      inputs: [
        {
          name: "Proposal ID",
          type: "u64",
          position: "arg:1",
          source: "field",
          required: true,
        },
        {
          name: "Support",
          type: "bool",
          position: "arg:2",
          source: "field",
          required: true,
          options: ["true", "false"],
        },
      ],
    })
    .addAction({
      type: "link",
      label: "View Proposals",
      description: "View all available proposals in the DAO",
      url: `https://${
        network === "mainnet" ? "" : network + "-"
      }explorer.multiversx.com/accounts/${contractAddress}`,
    });

  // Build the warp
  let warp = await builder.build();

  // Manually add protocol
  warp = {
    ...warp,
    protocol: "warp:0.1.0",
  };

  console.log("DAO Vote warp created successfully");

  // Get the account nonce from network
  const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
  account.update(accountOnNetwork);

  // Generate inscription transaction
  const tx = builder.createInscriptionTransaction(warp);

  // Sign and broadcast the transaction
  console.log("Publishing warp to blockchain...");
  const txHash = await signAndBroadcastTransaction(
    tx,
    signer,
    account,
    network
  );

  // Generate warp URL
  const baseUrl =
    network === "mainnet"
      ? "https://warps.tools"
      : `https://${network}.warps.tools`;
  const warpUrl = `${baseUrl}/warp/${txHash}`;

  console.log(`\n===== WARP PUBLISHED SUCCESSFULLY =====`);
  console.log(`Warp URL: ${warpUrl}`);
  console.log(
    `Transaction: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/transactions/${txHash}`
  );
  console.log(`======================================\n`);

  return { warp, txHash, warpUrl };
}

// Create a simplified warp for viewing proposals (read-only)
export async function createDaoViewWarp(
  contractAddress: string = "erd1qqqqqqqqqqqqqpgqa2h4d6rufxlu76l3zx5xdsh2suk94ynsldvsr8nusj",
  walletPath: string = "./src/leo.json",
  password: string = "Leo@2003",
  network: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<{ warp: Warp; txHash: string; warpUrl: string }> {
  // Initialize API provider
  const apiUrl =
    network === "mainnet"
      ? "https://api.multiversx.com"
      : `https://${network}-api.multiversx.com`;
  const apiNetworkProvider = new ApiNetworkProvider(apiUrl);

  console.log(`Creating DAO view warp on ${network}`);
  console.log(`Contract address: ${contractAddress}`);

  // Load wallet
  const { account, signer, address } = await loadWalletFromFile(
    walletPath,
    password
  );
  console.log(`Using wallet address: ${address}`);

  // Configure WarpBuilder
  const config: WarpConfig = {
    env: network,
    userAddress: address,
  };

  const builder = new WarpBuilder(config);

  // Build the warp
  builder
    .setName("DAO View")
    .setTitle("View DAO Proposal")
    .setDescription("View details of a DAO proposal")
    .setPreview("https://vleap.io/images/external/warps/multiversx-docs.jpg")
    .addAction({
      type: "query",
      label: "View Proposal",
      address: contractAddress,
      func: "getProposal",
      args: [],
      inputs: [
        {
          name: "Proposal ID",
          type: "u64",
          position: "arg:1",
          source: "field",
          required: true,
        },
      ],
    });

  // Build the warp
  let warp = await builder.build();

  // Manually add protocol
  warp = {
    ...warp,
    protocol: "warp:0.1.0",
  };

  console.log("DAO View warp created successfully");

  // Get the account nonce from network
  const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
  account.update(accountOnNetwork);

  // Generate inscription transaction
  const tx = builder.createInscriptionTransaction(warp);

  // Sign and broadcast the transaction
  console.log("Publishing warp to blockchain...");
  const txHash = await signAndBroadcastTransaction(
    tx,
    signer,
    account,
    network
  );

  // Generate warp URL
  const baseUrl =
    network === "mainnet"
      ? "https://warps.tools"
      : `https://${network}.warps.tools`;
  const warpUrl = `${baseUrl}/warp/${txHash}`;

  console.log(`\n===== WARP PUBLISHED SUCCESSFULLY =====`);
  console.log(`Warp URL: ${warpUrl}`);
  console.log(
    `Transaction: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/transactions/${txHash}`
  );
  console.log(`======================================\n`);

  return { warp, txHash, warpUrl };
}

/**
 * Creates a DAO proposal creation warp (only for contract owner)
 * @param contractAddress The deployed DAO contract address
 * @param walletPath Path to the wallet file
 * @param password Password for the wallet file
 * @param network Network to deploy on
 * @returns The created warp and transaction hash
 */
export async function createDaoProposalWarp(
  contractAddress: string = "erd1qqqqqqqqqqqqqpgqa2h4d6rufxlu76l3zx5xdsh2suk94ynsldvsr8nusj",
  walletPath: string = "./src/leo.json",
  password: string = "Leo@2003",
  network: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<{ warp: Warp; txHash: string; warpUrl: string }> {
  // Initialize API provider
  const apiUrl =
    network === "mainnet"
      ? "https://api.multiversx.com"
      : `https://${network}-api.multiversx.com`;
  const apiNetworkProvider = new ApiNetworkProvider(apiUrl);

  console.log(`Creating DAO proposal creation warp on ${network}`);
  console.log(`Contract address: ${contractAddress}`);
  console.log(`⚠️ Note: Only the contract owner can create proposals!`);

  // Load wallet
  const { account, signer, address } = await loadWalletFromFile(
    walletPath,
    password
  );
  console.log(`Using wallet address: ${address}`);

  // Configure WarpBuilder
  const config: WarpConfig = {
    env: network,
    userAddress: address,
  };

  const builder = new WarpBuilder(config);

  // Build the warp
  builder
    .setName("DAO Proposal")
    .setTitle("Create DAO Proposal")
    .setDescription(
      "Create a new proposal in the DAO (only for contract owner)"
    )
    .setPreview("https://vleap.io/images/external/warps/proposal.jpg")
    .addAction({
      type: "contract",
      label: "Create Proposal",
      address: contractAddress,
      func: "createProposal",
      args: [],
      gasLimit: 15000000,
      inputs: [
        {
          name: "Proposal Description",
          type: "string", // Using string which will be converted to bytes
          position: "arg:1",
          source: "field",
          required: true,
        },
      ],
    })
    .addAction({
      type: "link",
      label: "View All Proposals",
      description: "View all available proposals in the DAO",
      url: `https://${
        network === "mainnet" ? "" : network + "-"
      }explorer.multiversx.com/accounts/${contractAddress}`,
    });

  // Build the warp
  let warp = await builder.build();

  // Manually add protocol
  warp = {
    ...warp,
    protocol: "warp:0.1.0",
  };

  console.log("DAO Proposal creation warp created successfully");

  // Get the account nonce from network
  const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
  account.update(accountOnNetwork);

  // Generate inscription transaction
  const tx = builder.createInscriptionTransaction(warp);

  // Sign and broadcast the transaction
  console.log("Publishing warp to blockchain...");
  const txHash = await signAndBroadcastTransaction(
    tx,
    signer,
    account,
    network
  );

  // Generate warp URL
  const baseUrl =
    network === "mainnet"
      ? "https://warps.tools"
      : `https://${network}.warps.tools`;
  const warpUrl = `${baseUrl}/warp/${txHash}`;

  console.log(`\n===== WARP PUBLISHED SUCCESSFULLY =====`);
  console.log(`Warp URL: ${warpUrl}`);
  console.log(
    `Transaction: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/transactions/${txHash}`
  );
  console.log(
    `⚠️ Note: Only the contract owner can create proposals with this warp!`
  );
  console.log(`======================================\n`);

  return { warp, txHash, warpUrl };
}

// Also create a warp for executing proposals (owner only)
export async function createDaoExecuteWarp(
  contractAddress: string = "erd1qqqqqqqqqqqqqpgqa2h4d6rufxlu76l3zx5xdsh2suk94ynsldvsr8nusj",
  walletPath: string = "./src/leo.json",
  password: string = "Leo@2003",
  network: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<{ warp: Warp; txHash: string; warpUrl: string }> {
  // Initialize API provider
  const apiUrl =
    network === "mainnet"
      ? "https://api.multiversx.com"
      : `https://${network}-api.multiversx.com`;
  const apiNetworkProvider = new ApiNetworkProvider(apiUrl);

  console.log(`Creating DAO proposal execution warp on ${network}`);
  console.log(`Contract address: ${contractAddress}`);
  console.log(`⚠️ Note: Only the contract owner can execute proposals!`);

  // Load wallet
  const { account, signer, address } = await loadWalletFromFile(
    walletPath,
    password
  );
  console.log(`Using wallet address: ${address}`);

  // Configure WarpBuilder
  const config: WarpConfig = {
    env: network,
    userAddress: address,
  };

  const builder = new WarpBuilder(config);

  // Build the warp
  builder
    .setName("DAO Execute")
    .setTitle("Execute DAO Proposal")
    .setDescription(
      "Execute a proposal after voting period (only for contract owner)"
    )
    .setPreview("https://vleap.io/images/external/warps/execute.jpg")
    .addAction({
      type: "contract",
      label: "Execute Proposal",
      address: contractAddress,
      func: "executeProposal",
      args: [],
      gasLimit: 20000000,
      inputs: [
        {
          name: "Proposal ID",
          type: "u64",
          position: "arg:1",
          source: "field",
          required: true,
        },
      ],
    })
    .addAction({
      type: "link",
      label: "View All Proposals",
      description: "View all available proposals in the DAO",
      url: `https://${
        network === "mainnet" ? "" : network + "-"
      }explorer.multiversx.com/accounts/${contractAddress}`,
    });

  // Build the warp
  let warp = await builder.build();

  // Manually add protocol
  warp = {
    ...warp,
    protocol: "warp:0.1.0",
  };

  console.log("DAO Execute warp created successfully");

  // Get the account nonce from network
  const accountOnNetwork = await apiNetworkProvider.getAccount(account.address);
  account.update(accountOnNetwork);

  // Generate inscription transaction
  const tx = builder.createInscriptionTransaction(warp);

  // Sign and broadcast the transaction
  console.log("Publishing warp to blockchain...");
  const txHash = await signAndBroadcastTransaction(
    tx,
    signer,
    account,
    network
  );

  // Generate warp URL
  const baseUrl =
    network === "mainnet"
      ? "https://warps.tools"
      : `https://${network}.warps.tools`;
  const warpUrl = `${baseUrl}/warp/${txHash}`;

  console.log(`\n===== WARP PUBLISHED SUCCESSFULLY =====`);
  console.log(`Warp URL: ${warpUrl}`);
  console.log(
    `Transaction: https://${
      network === "mainnet" ? "" : network + "-"
    }explorer.multiversx.com/transactions/${txHash}`
  );
  console.log(
    `⚠️ Note: Only the contract owner can execute proposals with this warp!`
  );
  console.log(`======================================\n`);

  return { warp, txHash, warpUrl };
}

// Main function
async function main() {
  try {
    const args = process.argv.slice(2);
    const operation = args[0] || "vote"; // Default to creating vote warp
    const contractAddress =
      args[1] ||
      "erd1qqqqqqqqqqqqqpgqa2h4d6rufxlu76l3zx5xdsh2suk94ynsldvsr8nusj";
    const walletPath = args[2] || "./src/leo.json";
    const password = args[3] || "Leo@2003";
    const network = (args[4] || "devnet") as "devnet" | "testnet" | "mainnet";

    if (operation === "vote") {
      // Create vote warp
      await createDaoVoteWarp(contractAddress, walletPath, password, network);
    } else if (operation === "view") {
      // Create view warp
      await createDaoViewWarp(contractAddress, walletPath, password, network);
    } else if (operation === "propose") {
      // Create proposal warp
      await createDaoProposalWarp(
        contractAddress,
        walletPath,
        password,
        network
      );
    } else if (operation === "execute") {
      // Create execute warp
      await createDaoExecuteWarp(
        contractAddress,
        walletPath,
        password,
        network
      );
    } else if (operation === "all") {
      // Create all warps
      await createDaoVoteWarp(contractAddress, walletPath, password, network);
      await createDaoViewWarp(contractAddress, walletPath, password, network);
      await createDaoProposalWarp(
        contractAddress,
        walletPath,
        password,
        network
      );
      await createDaoExecuteWarp(
        contractAddress,
        walletPath,
        password,
        network
      );
    } else if (operation === "both") {
      // Create both warps (for backward compatibility)
      await createDaoVoteWarp(contractAddress, walletPath, password, network);
      await createDaoViewWarp(contractAddress, walletPath, password, network);
    } else {
      console.error(
        `Unknown operation: ${operation}. Use 'vote', 'view', 'propose', 'execute', 'both', or 'all'`
      );
      process.exit(1);
    }
  } catch (error) {
    console.error("Error creating DAO warp:", error);
    process.exit(1);
  }
}

// Run the main function if script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

// export {
//   createDaoVoteWarp,
//   createDaoViewWarp,
//   createDaoProposalWarp,
//   createDaoExecuteWarp,
// };
