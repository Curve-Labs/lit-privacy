import * as LitJsSdk from "@lit-protocol/lit-node-client";
import litActionCode from "../lit-actions/proofOfIdentity.js";
import * as dotenv from "dotenv";

dotenv.config();

const useFromIPFS = process.env.USE_ACTION_FROM_IPFS === "true";
const LIT_ACTION_IPFS_CID = process.env.IDENTITY_PROOF_ACTION_CID;

export const generateProofOfIdentity = async (authSig, fingerprint, PKP) => {
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();

  // based on IPFS settings generate options for executing Lit Action
  let litActionConfig = {
    authSig,
    jsParams: {
      fingerprint,
      publicKey: PKP
    },
  };
  if(useFromIPFS) {
    console.log("\x1b[33m Fetching Identity lit action from IPFS \x1b[0m");
    litActionConfig.ipfsId = LIT_ACTION_IPFS_CID;
  } else {
    litActionConfig.code = litActionCode;
  }

  return await litNodeClient.executeJs(litActionConfig);
};
