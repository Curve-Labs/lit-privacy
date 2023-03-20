import LitJsSdk from "lit-js-sdk/build/index.node.js";
import litActionCode from "../lit-actions/proofOfIdentity.js";

export const generateProofOfIdentity = async (authSig, fingerprint) => {
  const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();
  return await litNodeClient.executeJs({
    code: litActionCode,
    authSig,
    jsParams: {
      fingerprint,
    },
  });
};
