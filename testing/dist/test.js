"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
// Load ABI JSON
const abiJson = JSON.parse(fs.readFileSync("./src/dao.abi.json", "utf-8"));
// Convert ABI to Warp Schema
function convertAbiToWarp(abi) {
    const contractName = abi.name;
    const contractAddress = "erd1qqqqqqqqqqqqqpgqkr2ygjp0luge4jfjqv8z873qreuyms4xldvs42uf9f"; // Replace with actual contract address
    const actions = abi.endpoints.map((endpoint) => {
        const isOnlyOwner = endpoint.onlyOwner || false;
        const isReadonly = endpoint.mutability === "readonly";
        return {
            type: isReadonly ? "query" : "contract",
            label: `${isReadonly ? "Query" : "Call"} ${endpoint.name}`,
            address: contractAddress,
            func: endpoint.name,
            args: [],
            gasLimit: isReadonly ? 5000000 : 60000000,
            inputs: endpoint.inputs.map((input, index) => ({
                name: input.name,
                type: input.type === "bytes" ? "string" : input.type,
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
