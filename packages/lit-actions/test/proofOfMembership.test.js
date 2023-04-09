import * as dotenv from "dotenv";
import { ethers } from "ethers";
import { generateProofOfMembership } from "../connectors/proofOfMembership.js";
import { generateProofOfIdentity } from "../connectors/proofOfIdentity.js";
import { generateAuthSig } from "./helpers/auth.js";
import {
  etherV6Id,
  convertBlockNumberToLeftPadHex,
  generateMessageForMembershipProof,
} from "./helpers/utils";
import { expect } from "@jest/globals";
import { recoverAddress } from "@ethersproject/transactions";
import { joinSignature } from "@ethersproject/bytes";
import { recoverPublicKey } from "@ethersproject/signing-key";
import { verifyMessage } from "@ethersproject/wallet";

const NounsTokenAddress = "0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03";
const EnsTokenAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

dotenv.config();

describe("generateProofOfMembership", () => {
  const provider = ethers.getDefaultProvider();
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const PKP_Identity = process.env.PKP_IDENTITY;
  const PKP_Membership = process.env.PKP_MEMBERSHIP;
  const PKPAddress_Membership = process.env.PKPAddress_MEMBERSHIP;
  const domain = "localhost";
  const origin = "https://localhost/login";
  const statement =
    "This is a test statement. You can put anything you want here.";
  const IdentityFingerprint = {
    blockNumber: 420,
    publicSignal: etherV6Id("public_signal"),
  };
  const MembershipFingerprint = {
    blockNumber: 420,
    publicSignal: etherV6Id("public_signal"),
  };

  let authSig;
  let dataSigned, signature, concatFingerprint;

  beforeAll(async () => {
    authSig = await generateAuthSig(signer, domain, origin, statement);
    
    // generate identity proof to be passed as parameter to Membership Lit Action
    IdentityFingerprint.message = authSig.signedMessage;
    IdentityFingerprint.signature = authSig.sig;
    const proofOfIdentityOutput = await generateProofOfIdentity(
      authSig,
      IdentityFingerprint,
      PKP_Identity
    );
    const proofOfIdentity = joinSignature({
      r: "0x" + proofOfIdentityOutput.signatures.sig1.r,
      s: "0x" + proofOfIdentityOutput.signatures.sig1.s,
      v: proofOfIdentityOutput.signatures.sig1.recid,
    });

    MembershipFingerprint.identityProof = proofOfIdentity;
    MembershipFingerprint.message = authSig.signedMessage;
    MembershipFingerprint.signature = authSig.sig;
    MembershipFingerprint.tokenType = "ERC721";
    MembershipFingerprint.chain = "ethereum";
    MembershipFingerprint.authSig = authSig;
    MembershipFingerprint.tokenAddress = EnsTokenAddress;

    const proofOfMembershipOutput = await generateProofOfMembership(
      authSig,
      MembershipFingerprint,
      PKP_Membership
    );
    console.log(proofOfMembershipOutput)
    if(!proofOfMembershipOutput.response?.success && proofOfMembershipOutput.response?.data?.balance === 0){
      throw Error("No balance found.");
    }
    if (proofOfMembershipOutput.signatures?.sig1 === undefined) {
      console.log("No signature was done because no membership found");
    }
    ({
      signatures: {
        sig1: { dataSigned }, // dataSigned is a raw message which is signed. That is dataSigned is generated after some operations which are abstracted by verifyMessage
      },
    } = proofOfMembershipOutput);
    console.log("This is working fine");
    console.log("dataSigned", dataSigned);
    if (dataSigned === undefined) {
      console.log("No signature was done because no membership found");
    }
    concatFingerprint = generateMessageForMembershipProof([
      proofOfIdentity,
      convertBlockNumberToLeftPadHex(MembershipFingerprint.blockNumber),
      MembershipFingerprint.publicSignal,
    ]);
    // encodedSig is the  main signature that we need to use
    signature = joinSignature({
      r: "0x" + proofOfMembershipOutput.signatures.sig1.r,
      s: "0x" + proofOfMembershipOutput.signatures.sig1.s,
      v: proofOfMembershipOutput.signatures.sig1.recid,
    });
  }, process.env.TEST_TIMEOUT_TIME);

  it("recovers public  key from returned signature", async () => {
    const recoveredPubkey = recoverPublicKey("0x"+dataSigned, signature);
    expect(recoveredPubkey).toEqual(PKP_Membership);
  });

  it("recovers public address from returned signature", async () => {
    const recoveredAddress = recoverAddress("0x"+dataSigned, signature);
    expect(recoveredAddress).toEqual(PKPAddress_Membership);
  });

  it("recovers public address via message and returned signature", async () => {
    const recoveredAddressViaMessage = verifyMessage(
      concatFingerprint,
      signature
    );
    expect(recoveredAddressViaMessage).toEqual(PKPAddress_Membership);
  });
});
