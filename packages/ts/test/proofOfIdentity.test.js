import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { generateProofOfIdentity } from "../connectors/proofOfIdentity.js";
import { generateAuthSig } from "./helpers/auth.js";
import { expect } from "@jest/globals";

dotenv.config();

describe("generateProofOfIdentity", () => {
  const provider = ethers.getDefaultProvider();
  const signer = ethers.Wallet.fromPhrase(process.env.SEED_PHRASE, provider);
  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement =
    "This is a test statement.  You can put anything you want here.";
  const fingerprint = {
    blockNumber: 420,
    publicSignal: ethers.id("public_signal"),
  };

  let authSig;
  let dataSigned, signature, publicKey;

  beforeAll(async () => {
    authSig = await generateAuthSig(signer, domain, origin, statement);
    fingerprint.message = authSig.signedMessage;
    fingerprint.signature = authSig.sig;
    ({
      signatures: {
        sig1: { dataSigned, signature, publicKey },
      },
    } = await generateProofOfIdentity(authSig, fingerprint));
  });

  it("returns the concatenated fingerprint as EIP191 msg", async () => {
    const concatFingerprint = ethers.concat([
      signer.address,
      ethers.zeroPadValue(
        ethers.hexlify(ethers.toBeArray(fingerprint.blockNumber)),
        32
      ),
      fingerprint.publicSignal,
    ]);

    expect(dataSigned).toEqual(ethers.hashMessage(concatFingerprint);
  });

  it("returns a valid signature", async () => {
    const concatFingerprint = ethers.concat([
      signer.address,
      ethers.zeroPadValue(
        ethers.hexlify(ethers.toBeArray(fingerprint.blockNumber)),
        32
      ),
      fingerprint.publicSignal,
    ]);

    expect(dataSigned).toEqual(concatFingerprint);
  });
});
