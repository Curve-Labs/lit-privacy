import { ethers } from "ethers";
import siwe from "siwe";

export const generateAuthSig = async (signer, domain, origin, statement) => {
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: await signer.getAddress(),
    statement,
    uri: origin,
    version: "1",
    chainId: "1",
  });
  const messageToSign = siweMessage.prepareMessage();
  const signature = await signer.signMessage(messageToSign);
  const recoveredAddress = ethers.verifyMessage(messageToSign, signature);
  return {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: recoveredAddress,
  };
};
