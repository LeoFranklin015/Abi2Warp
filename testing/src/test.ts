import * as fs from "fs";

// Load ABI JSON
const abiJson = JSON.parse(fs.readFileSync("./src/dao.abi.json", "utf-8"));

// Define Warp schema
interface Warp {
  protocol: string;
  name: string;
  title: string;
  description: string;
  preview: string;
  actions: WarpAction[];
}

interface WarpAction {
  type: string;
  label: string;
  address: string;
  func: string;
  args: string[];
  gasLimit: number;
  inputs?: WarpActionInput[];
}

interface WarpActionInput {
  name: string;
  type: string;
  position: string;
  source: string;
  required: boolean;
}

// Convert ABI to Warp Schema
function convertAbiToWarp(abi: any): Warp {
  const contractName = abi.name;
  const contractAddress =
    "erd1qqqqqqqqqqqqqpgqkr2ygjp0luge4jfjqv8z873qreuyms4xldvs42uf9f"; // Replace with actual contract address

  const actions: WarpAction[] = abi.endpoints.map((endpoint: any) => {
    const isOnlyOwner = endpoint.onlyOwner || false;
    const isReadonly = endpoint.mutability === "readonly";

    return {
      type: isReadonly ? "query" : "contract",
      label: `${isReadonly ? "Query" : "Call"} ${endpoint.name}`,
      address: contractAddress,
      func: endpoint.name,
      args: [],
      gasLimit: isReadonly ? 5000000 : 60000000,
      inputs: endpoint.inputs.map((input: any, index: number) => ({
        name: input.name,
        type:
          input.type === "bytes"
            ? "string"
            : input.type === "u64"
            ? "biguint"
            : input.type,
        position: `arg:${index + 1}`,
        source: "field",
        required: true,
      })),
    };
  });

  return {
    protocol: "warp:0.1.0",
    name: contractName,
    title: `Execute ${contractName} Actions`,
    description: `Auto-generated Warp actions for ${contractName}`,
    preview: "https://vleap.io/images/external/warps/multiversx-docs.jpg",
    actions: [...actions],
  };
}

// Convert and Save Warp JSON
const warpJson = convertAbiToWarp(abiJson);
fs.writeFileSync("warp.json", JSON.stringify(warpJson, null, 2));

console.log("Warp JSON generated successfully!");
