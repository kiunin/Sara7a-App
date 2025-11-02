import crypto from "node:crypto";
import fs from "node:fs";
import { buffer } from "node:stream/consumers";

const ENCRYPTION_SECRET_KEY = Buffer.from(
  toString(process.env.ENCRYPTION_SECRET_KEY)
);
const IV_LENGTH = +process.env.IV_LENGTH;

export const encrypt = (plainText) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv
  );
  let encrypted = cipher.update(plainText, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

export const decrypt = (encryptedData) => {
  const [ivHex, cipherText] = encryptedData.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    ENCRYPTION_SECRET_KEY,
    iv
  );
  let decrypted = decipher.update(cipherText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

if (fs.existsSync("public_Key.pem") && fs.existsSync("private_Key.pem")) {
  console.log("Key already exists");
} else {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "pkcs1", format: "pem" },
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
  });
  fs.writeFileSync("public_Key.pem", publicKey);
  fs.writeFileSync("private_Key.pem", privateKey);
}

export const asymmetricEncrypt = (plainText) => {
  const bufferedData = Buffer.from(plainText, "utf8");

  const encryptedData = crypto.publicEncrypt(
    {
      key: fs.readFileSync("public_Key.pem", "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferedData
  );
  return encryptedData.toString("hex");
};

export const asymmetricdecrypt = (cipherText) => {
  const bufferedCipherData = Buffer.from(cipherText, "hex");

  const decryptedData = crypto.privateDecrypt(
    {
      key: fs.readFileSync("private_Key.pem", "utf8"),
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    bufferedCipherData
  );
  return decryptedData.toString("utf8");
};
