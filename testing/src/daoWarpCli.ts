#!/usr/bin/env node
import {
  createDaoVoteWarp,
  createDaoViewWarp,
  createDaoProposalWarp,
  createDaoExecuteWarp,
} from "./createDaoVoteWarp";

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);

  const helpText = `
DAO Warp Creator CLI

Usage:
  node dist/daoWarpCli.js [options]

Options:
  --help                Show this help message
  --type=VALUE          Type of warp to create: 'vote', 'view', 'propose', 'execute', 'all' (default: 'vote')
  --contract=ADDRESS    DAO contract address (default: erd1qqqqqqqqqqqqqpgqkr2ygjp0luge4jfjqv8z873qreuyms4xldvs42uf9f)
  --wallet=PATH         Path to wallet JSON file (default: ./src/leo.json)
  --password=PASSWORD   Wallet password
  --network=VALUE       Network: 'devnet', 'testnet', or 'mainnet' (default: 'devnet')

Warp Types:
  vote      - Creates a warp for voting on proposals
  view      - Creates a warp for viewing proposal details
  propose   - Creates a warp for creating new proposals (owner only)
  execute   - Creates a warp for executing approved proposals (owner only)
  all       - Creates all warp types

Examples:
  node dist/daoWarpCli.js --type=vote --network=devnet
  node dist/daoWarpCli.js --type=propose --contract=erd1... --wallet=./my-wallet.json --password=mypass
  node dist/daoWarpCli.js --type=all --network=mainnet
`;

  // Check for help flag
  if (args.includes("--help") || args.includes("-h")) {
    console.log(helpText);
    return;
  }

  // Extract options
  const typeArg = args.find((arg) => arg.startsWith("--type="));
  const contractArg = args.find((arg) => arg.startsWith("--contract="));
  const walletArg = args.find((arg) => arg.startsWith("--wallet="));
  const passwordArg = args.find((arg) => arg.startsWith("--password="));
  const networkArg = args.find((arg) => arg.startsWith("--network="));

  // Parse values
  const type = typeArg ? typeArg.split("=")[1] : "vote";
  const contract = contractArg
    ? contractArg.split("=")[1]
    : "erd1qqqqqqqqqqqqqpgqkr2ygjp0luge4jfjqv8z873qreuyms4xldvs42uf9f";
  const wallet = walletArg ? walletArg.split("=")[1] : "./src/leo.json";
  const password = passwordArg ? passwordArg.split("=")[1] : "Leo@2003";
  const network = (networkArg ? networkArg.split("=")[1] : "devnet") as
    | "devnet"
    | "testnet"
    | "mainnet";

  console.log(`Creating DAO warp(s) with the following configuration:`);
  console.log(`- Type: ${type}`);
  console.log(`- Contract: ${contract}`);
  console.log(`- Wallet file: ${wallet}`);
  console.log(`- Network: ${network}`);

  try {
    if (type === "vote" || type === "all") {
      console.log("\nCreating VOTE warp...");
      const { warpUrl } = await createDaoVoteWarp(
        contract,
        wallet,
        password,
        network
      );
      console.log(`✅ Vote warp created: ${warpUrl}`);
    }

    if (type === "view" || type === "all") {
      console.log("\nCreating VIEW warp...");
      const { warpUrl } = await createDaoViewWarp(
        contract,
        wallet,
        password,
        network
      );
      console.log(`✅ View warp created: ${warpUrl}`);
    }

    if (type === "propose" || type === "all") {
      console.log("\nCreating PROPOSE warp...");
      const { warpUrl } = await createDaoProposalWarp(
        contract,
        wallet,
        password,
        network
      );
      console.log(`✅ Propose warp created: ${warpUrl}`);
      console.log(
        `⚠️ Note: Only the contract owner can use this warp to create proposals!`
      );
    }

    if (type === "execute" || type === "all") {
      console.log("\nCreating EXECUTE warp...");
      const { warpUrl } = await createDaoExecuteWarp(
        contract,
        wallet,
        password,
        network
      );
      console.log(`✅ Execute warp created: ${warpUrl}`);
      console.log(
        `⚠️ Note: Only the contract owner can use this warp to execute proposals!`
      );
    }

    console.log("\n🎉 All warp creation completed successfully!");
  } catch (error) {
    console.error("❌ Error creating DAO warp:", error);
    process.exit(1);
  }
}

main().catch(console.error);
