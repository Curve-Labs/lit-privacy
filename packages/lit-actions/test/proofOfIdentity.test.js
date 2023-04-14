import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { generateProofOfIdentity } from "../connectors/proofOfIdentity.js";
import { generateAuthSig } from "./helpers/auth.js";
import {
  etherV6Id,
  convertBlockNumberToLeftPadHex,
  generateMessageForIdentityProof,
} from "./helpers/utils";
import { expect } from "@jest/globals";
import { recoverAddress } from "@ethersproject/transactions";
import { joinSignature } from "@ethersproject/bytes";
import { recoverPublicKey } from "@ethersproject/signing-key";
import { verifyMessage } from "@ethersproject/wallet";

dotenv.config();

describe("generateProofOfIdentity", () => {
  const provider = ethers.getDefaultProvider();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const PKP = process.env.PKP_IDENTITY;
  const PKPAddress = process.env.PKPAddress_IDENTITY;
  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement =
    "This is a test statement. You can put anything you want here.";
  const fingerprint = {
    blockNumber: 420,
    publicSignal: etherV6Id("public_signal"),
  };

  let authSig;
  let dataSigned, signature, concatFingerprint;

  beforeAll(async () => {
    authSig = await generateAuthSig(signer, domain, origin, statement);
    fingerprint.message = authSig.signedMessage;
    fingerprint.signature = authSig.sig;
    const proofOfIdentityOutput = await generateProofOfIdentity(
      authSig,
      fingerprint,
      PKP
    );
    ({
      signatures: {
        sig1: { dataSigned }, // dataSigned is a raw message which is signed. That is dataSigned is generated after some operations which are abstracted by verifyMessage
      },
    } = proofOfIdentityOutput);
    concatFingerprint = generateMessageForIdentityProof([
      signer.address,
      convertBlockNumberToLeftPadHex(fingerprint.blockNumber),
      fingerprint.publicSignal,
    ]);
    console.log("dataSigned - identity", dataSigned);
    // encodedSig is the  main signature that we need to use
    signature = joinSignature({
      r: "0x" + proofOfIdentityOutput.signatures.sig1.r,
      s: "0x" + proofOfIdentityOutput.signatures.sig1.s,
      v: proofOfIdentityOutput.signatures.sig1.recid,
    });
  }, process.env.TEST_TIMEOUT_TIME);

  it("recovers public  key from returned signature", async () => {
    const recoveredPubkey = recoverPublicKey("0x" + dataSigned, signature);
    expect(recoveredPubkey).toEqual(PKP);
  });

  it("recovers public address from returned signature", async () => {
    const recoveredAddress = recoverAddress("0x" + dataSigned, signature);
    expect(recoveredAddress).toEqual(PKPAddress);
  });

  it("recovers public address via message and returned signature", async () => {
    const recoveredAddressViaMessage = verifyMessage(
      concatFingerprint,
      signature
    );
    expect(recoveredAddressViaMessage).toEqual(PKPAddress);
  });
});
