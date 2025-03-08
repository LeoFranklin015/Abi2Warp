/**
 * Get a base warp URL based on the environment
 * @param env The network environment
 * @returns The base URL for warps on the specified environment
 */
function getBaseWarpUrl(
  env: "devnet" | "testnet" | "mainnet" = "devnet"
): string {
  switch (env) {
    case "devnet":
      return "https://devnet.usewarp.to/to?warp=hash%3A";
    case "testnet":
      return "https://testnet.warps.tools/warp/";
    case "mainnet":
      return "https://warps.tools/warp/";
    default:
      return "https://warps.tools/warp/";
  }
}

/**
 * Create a warp link with query parameters
 * @param txHash The transaction hash of the published warp
 * @param queryParams Query parameters to add to the URL (e.g., { to: 'erd1...' })
 * @param env The network environment
 * @returns The URL for the warp with query parameters
 */
export function createWarpLink(
  txHash: string,
  queryParams: Record<string, string> = {},
  env: "devnet" | "testnet" | "mainnet" = "devnet"
): string {
  // Get the base URL for the environment
  const baseUrl = getBaseWarpUrl(env);

  // Start with the base URL and transaction hash
  let url = `${baseUrl}${txHash}`;

  // Add query parameters if provided
  if (Object.keys(queryParams).length > 0) {
    url += "?";
    const params = Object.entries(queryParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
    url += params;
  }

  return url;
}

/**
 * Creates a tipping link with a recipient address
 * @param txHash The transaction hash of the published warp
 * @param recipientAddress The recipient's address to pre-fill
 * @param network The network environment
 * @returns The complete warp link with recipient
 */
export function createTippingLink(
  txHash: string,
  recipientAddress: string,
  network: "devnet" | "testnet" | "mainnet" = "devnet"
): string {
  // Encode the recipient address to handle special characters
  const encodedRecipient = encodeURIComponent(recipientAddress);

  // Base URL depends on network
  let baseUrl = "https://warps.tools";
  if (network === "devnet") {
    baseUrl = "https://devnet.usewarp.to/to?warp=hash%3A";
  } else if (network === "testnet") {
    baseUrl = "https://testnet.warps.tools";
  }

  // Return the complete URL with the recipient as a query parameter
  return `${baseUrl}/warp/${txHash}?to=${encodedRecipient}`;
}

/**
 * Create a set of recipient-specific tipping links
 * @param txHash The transaction hash of the published tipping warp
 * @param recipients Array of recipient addresses
 * @param env The network environment
 * @returns Object with recipient addresses as keys and tipping links as values
 */
export function createTippingLinks(
  txHash: string,
  recipients: string[],
  env: "devnet" | "testnet" | "mainnet" = "devnet"
): Record<string, string> {
  const links: Record<string, string> = {};

  for (const recipient of recipients) {
    links[recipient] = createTippingLink(txHash, recipient, env);
  }

  return links;
}
