import { generateProofOfIdentity } from "../connectors/proofOfIdentity.js";
import { ethers } from "ethers";

const testAuthSig = {
  sig: "0x2bdede6164f56a601fc17a8a78327d28b54e87cf3fa20373fca1d73b804566736d76efe2dd79a4627870a50e66e1a9050ca333b6f98d9415d8bca424980611ca1c",
  derivedVia: "web3.eth.personal.sign",
  signedMessage:
    "localhost wants you to sign in with your Ethereum account:\n0x9D1a5EC58232A894eBFcB5e466E3075b23101B89\n\nThis is a key for Partiful\n\nURI: https://localhost/login\nVersion: 1\nChain ID: 1\nNonce: 1LF00rraLO4f7ZSIt\nIssued At: 2022-06-03T05:59:09.959Z",
  address: "0x9D1a5EC58232A894eBFcB5e466E3075b23101B89",
};

describe("generateProofOfIdentity", () => {
  const provider = ethers.getDefaultProvider();
  const testMemnonic =
    "test test test test test test test test test test test junk";
  const signer = ethers.Wallet.fromPhrase(testMemnonic, provider);
  const message = "abc";

  let signature, authSig;

  beforeAll(async () => {
    signature = await signer.signMessage(message);
    authSig = {
      sig: signature,
      derivedVia: "web3.eth.personal.sign",
      signedMessage: message,
      address: await signer.getAddress(),
    };
    console.log(authSig);
  });

  it("generates a proof of identity", async () => {
    const jsParams = {
      signature,
      message,
    };
    const proof = await generateProofOfIdentity(authSig, jsParams);
    console.log(authSig);
  });
});
