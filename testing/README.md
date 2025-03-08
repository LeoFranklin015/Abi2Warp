# Warp Creator Example

This project demonstrates how to create and publish a Warp using the `@vleap/warps` library. The example creates a tipping warp that allows users to send ESDT tokens (cryptocurrencies) to others on the MultiversX blockchain.

## What are Warps?

Warps are small, shareable programs on MultiversX blockchain that enable users to perform actions like token transfers, contract interactions, and more. They are stored on-chain and can be shared via URLs or integrated into applications.

## Project Structure

- `src/createTippingWarp.ts` - Main module for creating a tipping warp
- `src/tippingExample.ts` - Example script showing how to use the module
- `src/walletUtils.ts` - Utilities for loading wallets and broadcasting transactions
- `src/publishWarp.ts` - Functions to publish warps directly from code
- `src/cli.ts` - Command-line interface for easy warp publishing
- `src/warpLinkUtils.ts` - Utilities for creating usable warp links

## Getting Started

### Prerequisites

- Node.js 14+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Example

```bash
# Compile TypeScript
npx tsc

# Run the example (just creates the warp object, doesn't publish)
node dist/tippingExample.js
```

## How It Works

The `createTippingWarp.ts` file contains two main functions:

1. `createTippingWarp(config)` - Creates a complete tipping warp structure
2. `createAndInscribeWarp(config)` - Creates the warp and generates an inscription transaction

The tipping warp allows users to send any ESDT token to a recipient with a message. The recipient is specified via a URL query parameter (`query:to`).

## Publishing a Warp

### Method 1: Using the CLI with a Wallet File (Most Secure)

```bash
# Compile the project
npx tsc

# Publish using your wallet file
node dist/cli.js --walletFile=./leo.json --password=your_password --network=devnet
```

Or using environment variables:

```bash
WALLET_FILE=./leo.json WALLET_PASSWORD=your_password NETWORK=devnet node dist/cli.js
```

### Method 2: Using the CLI with a Private Key

```bash
# Compile the project
npx tsc

# Publish using your private key
node dist/cli.js --privateKey=YOUR_PRIVATE_KEY --network=devnet
```

Or using environment variables:

```bash
PRIVATE_KEY=your_private_key NETWORK=devnet node dist/cli.js
```

### Creating Recipient-Specific Tipping Links

You can generate ready-to-use tipping links for specific recipients:

```bash
# Generate links for multiple recipients
node dist/cli.js --walletFile=./leo.json --password=your_password --recipients=erd1abc...,erd1xyz...
```

Or using environment variables:

```bash
WALLET_FILE=./leo.json WALLET_PASSWORD=your_password RECIPIENTS=erd1abc...,erd1xyz... node dist/cli.js
```

This will output links that can be directly shared with users to tip the specified recipients.

### Method 3: In Your Own Code

If you want to programmatically publish warps, you can use either of these functions:

```typescript
import { publishWarpWithWalletFile, publishWarp } from "./publishWarp";
import { createTippingLink } from "./warpLinkUtils";

async function myFunction() {
  // Using a wallet file (recommended)
  const result1 = await publishWarpWithWalletFile(
    "./leo.json",
    "your_password",
    "devnet",
    ["erd1abc...", "erd1xyz..."] // Optional recipient addresses
  );

  // Result contains warp URL and recipient-specific links
  console.log(`Warp published at: ${result1.warpUrl}`);
  console.log("Recipient links:", result1.recipientLinks);

  // Or using a private key
  const result2 = await publishWarp("your_private_key", "devnet");

  // You can also create a tipping link for any recipient after publishing
  const tipLink = createTippingLink(
    result2.txHash,
    "erd1recipient...",
    "devnet"
  );
  console.log(`Share this link to tip a specific user: ${tipLink}`);
}
```

### Method 4: Manual Transaction Submission

If you prefer to submit the transaction manually:

1. Edit `src/tippingExample.ts`:

   - Update `userAddress` with your MultiversX wallet address
   - Set `shouldCreateInscription` to `true`

2. Compile and run the script:

   ```bash
   npx tsc
   node dist/tippingExample.js
   ```

3. Sign the generated transaction with your wallet
4. Send the transaction to the blockchain

### Important Notes

- **SECURITY WARNING**: Using a wallet file with a password is more secure than using a raw private key
- **Never hardcode your private key or password in source files!**
- **The `userAddress` is required** when creating an inscription transaction
- After submitting the transaction, the warp will be available at `https://warps.tools/warp/<TX_HASH>`
- To create a usable tipping link, add `?to=erd1...` with the recipient's address to the warp URL

## Example Warp Structure

```json
{
  "protocol": "warp:0.1.0",
  "name": "Tipping: Tip",
  "title": "Tip a User",
  "description": "Tip a user with any token.",
  "preview": "https://vleap.io/images/external/warps/tip.jpg",
  "vars": {
    "RECEIVER": "query:to"
  },
  "actions": [
    {
      "type": "contract",
      "label": "Tip now",
      "address": "erd1qqqqqqqqqqqqqpgqszhrp70u9vmutn9yr4xgjhrfwakxzvd5l3ts3aem69",
      "func": "tip",
      "args": ["address:{{RECEIVER}}"],
      "gasLimit": 5000000,
      "inputs": [
        {
          "name": "Amount",
          "type": "esdt",
          "position": "transfer",
          "source": "field",
          "required": true
        },
        {
          "name": "Note",
          "type": "string",
          "position": "arg:2",
          "source": "field",
          "required": true
        }
      ]
    }
  ]
}
```

## License

MIT
