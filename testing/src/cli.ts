#!/usr/bin/env node
import {
  publishWarp,
  publishWarpWithWalletFile,
  WarpPublishResult,
} from "./publishWarp";

// Extract command line arguments
const args = process.argv.slice(2);
const privateKeyArg = args.find((arg) => arg.startsWith("--privateKey="));
const walletFileArg = args.find((arg) => arg.startsWith("--walletFile="));
const walletPasswordArg = args.find((arg) => arg.startsWith("--password="));
const networkArg = args.find((arg) => arg.startsWith("--network="));
const recipientsArg = args.find((arg) => arg.startsWith("--recipients="));

// Extract values from arguments
const privateKey = privateKeyArg
  ? privateKeyArg.split("=")[1]
  : process.env.PRIVATE_KEY;

const walletFile = walletFileArg
  ? walletFileArg.split("=")[1]
  : process.env.WALLET_FILE;

const walletPassword = walletPasswordArg
  ? walletPasswordArg.split("=")[1]
  : process.env.WALLET_PASSWORD;

const network = networkArg
  ? (networkArg.split("=")[1] as "devnet" | "testnet" | "mainnet")
  : (process.env.NETWORK as "devnet" | "testnet" | "mainnet") || "devnet";

// Parse recipients
const recipientsString = recipientsArg
  ? recipientsArg.split("=")[1]
  : process.env.RECIPIENTS;

const recipients = recipientsString
  ? recipientsString.split(",").map((addr) => addr.trim())
  : undefined;

// Show usage information if no authentication method is provided
if (!privateKey && (!walletFile || !walletPassword)) {
  console.log(`
Usage: node dist/cli.js [options]

Authentication Options (choose one):
  --privateKey=VALUE       Your MultiversX wallet private key
  --walletFile=PATH        Path to your MultiversX wallet JSON file
  --password=VALUE         Password for your wallet file

Other Options:
  --network=VALUE          Network to use: devnet, testnet, or mainnet (default: devnet)
  --recipients=ADDR1,ADDR2 Comma-separated list of recipient addresses to create tipping links for

You can also set these values using environment variables:
  PRIVATE_KEY=value                           Use private key authentication
  WALLET_FILE=path WALLET_PASSWORD=password   Use wallet file authentication
  NETWORK=network                             Set the network
  RECIPIENTS=erd1...,erd2...                  Recipient addresses for tipping links
  
Examples:
  # Using private key
  node dist/cli.js --privateKey=abcdef1234567890 --network=devnet
  
  # Using wallet file
  node dist/cli.js --walletFile=./leo.json --password=your_password --network=devnet
  
  # Create tipping links for specific recipients
  node dist/cli.js --walletFile=./leo.json --password=your_password --recipients=erd1...,erd2...
  `);
  process.exit(1);
}

// Print all recipient-specific links if provided
function printRecipientLinks(result: WarpPublishResult) {
  if (result.recipientLinks && Object.keys(result.recipientLinks).length > 0) {
    console.log("\nRecipient-specific tipping links:");
    Object.entries(result.recipientLinks).forEach(([recipient, link]) => {
      console.log(
        `  ${recipient.slice(0, 8)}...${recipient.slice(-6)}: ${link}`
      );
    });
  }
}

// Publish the warp using the appropriate method
console.log(`Publishing warp on ${network}...`);
if (walletFile && walletPassword) {
  // Use wallet file authentication
  publishWarpWithWalletFile(walletFile, walletPassword, network, recipients)
    .then((result) => {
      printSuccess(result.warpUrl, network);
      printRecipientLinks(result);
    })
    .catch((error) => {
      console.error("❌ Failed to publish warp:", error);
      process.exit(1);
    });
} else if (privateKey) {
  // Use private key authentication
  publishWarp(privateKey, network, recipients)
    .then((result) => {
      console.log(result);
      // printSuccess(result.warpUrl, network);
      // printRecipientLinks(result);
    })
    .catch((error) => {
      console.error("❌ Failed to publish warp:", error);
      process.exit(1);
    });
}

function printSuccess(url: string, network: string) {
  console.log(`
========================================
🎉 Warp published successfully! 🎉
========================================
URL: ${url}
Network: ${network}
========================================
Share this URL with others to use your tipping warp!
`);
}
