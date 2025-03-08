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
exports.extractPrivateKey = extractPrivateKey;
const fs_1 = require("fs");
const crypto = __importStar(require("crypto"));
/**
 * Extract private key from an Elrond/MultiversX wallet file
 * @param walletPath Path to the wallet JSON file
 * @param password Password for the wallet
 * @returns The private key in hex format
 */
async function extractPrivateKey(walletPath, password) {
    try {
        // Read the wallet file
        const fileContent = await fs_1.promises.readFile(walletPath, { encoding: "utf8" });
        // Parse the wallet JSON
        const walletObject = JSON.parse(fileContent);
        if (!walletObject.version || !walletObject.crypto) {
            throw new Error("This doesn't appear to be a valid keystore file");
        }
        // Extract the necessary fields
        const { cipher, ciphertext, kdf, kdfparams, mac } = walletObject.crypto;
        if (cipher !== "aes-128-ctr" || kdf !== "scrypt") {
            throw new Error(`Unsupported encryption method: cipher=${cipher}, kdf=${kdf}`);
        }
        // Derive the key from the password
        const derivedKey = await deriveKeyFromPassword(password, kdfparams);
        // Verify the password is correct by checking the MAC
        const computedMac = crypto
            .createHmac("sha256", derivedKey.slice(16, 32))
            .update(Buffer.from(ciphertext, "hex"))
            .digest("hex");
        if (computedMac !== mac) {
            throw new Error("Incorrect password");
        }
        // Decrypt the private key
        const iv = Buffer.from(kdfparams.iv, "hex");
        const encryptedBytes = Buffer.from(ciphertext, "hex");
        const decipher = crypto.createDecipheriv("aes-128-ctr", derivedKey.slice(0, 16), iv);
        const privateKey = Buffer.concat([
            decipher.update(encryptedBytes),
            decipher.final(),
        ]).toString("hex");
        return privateKey;
    }
    catch (error) {
        console.error("Error extracting private key:", error);
        throw error;
    }
}
/**
 * Derive key from password using the scrypt KDF
 */
function deriveKeyFromPassword(password, params) {
    return new Promise((resolve, reject) => {
        const { salt, n, r, p, dklen } = params;
        crypto.scrypt(Buffer.from(password, "utf8"), Buffer.from(salt, "hex"), dklen, { N: n, r, p }, (err, derivedKey) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(derivedKey);
            }
        });
    });
}
// Check if this script is run directly
if (require.main === module) {
    const walletPath = process.argv[2];
    const password = process.argv[3];
    if (!walletPath || !password) {
        console.log("Usage: node dist/extractPrivateKey.js <wallet-path> <password>");
        process.exit(1);
    }
    extractPrivateKey(walletPath, password)
        .then((privateKey) => {
        console.log("\n⚠️ SECURITY WARNING: Keep your private key secure! ⚠️\n");
        console.log("Private key:");
        console.log(privateKey);
        console.log("\nYou can now use this with:");
        console.log(`node dist/cli.js --privateKey=${privateKey} --network=devnet`);
        console.log("\nConsider clearing your terminal history after copying the key.");
    })
        .catch((error) => {
        console.error("Failed to extract private key:", error);
        process.exit(1);
    });
}
