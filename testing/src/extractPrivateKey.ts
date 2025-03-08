import { promises as fs } from "fs";
import * as crypto from "crypto";

/**
 * Extract private key from an Elrond/MultiversX wallet file
 * @param walletPath Path to the wallet JSON file
 * @param password Password for the wallet
 * @returns The private key in hex format
 */
async function extractPrivateKey(
  walletPath: string,
  password: string
): Promise<string> {
  try {
    // Read the wallet file
    const fileContent = await fs.readFile(walletPath, { encoding: "utf8" });

    // Parse the wallet JSON
    const walletObject = JSON.parse(fileContent);

    if (!walletObject.version || !walletObject.crypto) {
      throw new Error("This doesn't appear to be a valid keystore file");
    }

    // Extract the necessary fields
    const { cipher, ciphertext, kdf, kdfparams, mac } = walletObject.crypto;

    if (cipher !== "aes-128-ctr" || kdf !== "scrypt") {
      throw new Error(
        `Unsupported encryption method: cipher=${cipher}, kdf=${kdf}`
      );
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
    const decipher = crypto.createDecipheriv(
      "aes-128-ctr",
      derivedKey.slice(0, 16),
      iv
    );

    const privateKey = Buffer.concat([
      decipher.update(encryptedBytes),
      decipher.final(),
    ]).toString("hex");

    return privateKey;
  } catch (error) {
    console.error("Error extracting private key:", error);
    throw error;
  }
}

/**
 * Derive key from password using the scrypt KDF
 */
function deriveKeyFromPassword(password: string, params: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const { salt, n, r, p, dklen } = params;

    crypto.scrypt(
      Buffer.from(password, "utf8"),
      Buffer.from(salt, "hex"),
      dklen,
      { N: n, r, p },
      (err, derivedKey) => {
        if (err) {
          reject(err);
        } else {
          resolve(derivedKey);
        }
      }
    );
  });
}

// Check if this script is run directly
if (require.main === module) {
  const walletPath = process.argv[2];
  const password = process.argv[3];

  if (!walletPath || !password) {
    console.log(
      "Usage: node dist/extractPrivateKey.js <wallet-path> <password>"
    );
    process.exit(1);
  }

  extractPrivateKey(walletPath, password)
    .then((privateKey) => {
      console.log("\n⚠️ SECURITY WARNING: Keep your private key secure! ⚠️\n");
      console.log("Private key:");
      console.log(privateKey);
      console.log("\nYou can now use this with:");
      console.log(
        `node dist/cli.js --privateKey=${privateKey} --network=devnet`
      );
      console.log(
        "\nConsider clearing your terminal history after copying the key."
      );
    })
    .catch((error) => {
      console.error("Failed to extract private key:", error);
      process.exit(1);
    });
}

export { extractPrivateKey };
