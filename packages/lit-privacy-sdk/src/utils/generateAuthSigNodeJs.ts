import { AuthSig } from '@lit-protocol/types';
import * as ethers from "ethers";
import siwe from "siwe";

export default async function generateAuthSigNode(
  privateKey: string,
  domain: string,
  origin: string,
  statement: string,
  chainId: number = 1
): Promise<AuthSig> {
  const signer = new ethers.Wallet(privateKey);
  const siweMessage = new siwe.SiweMessage({
    domain: domain,
    address: await signer.getAddress(),
    statement,
    uri: origin,
    version: "1",
    chainId: chainId,
  });
  const messageToSign = siweMessage.prepareMessage();
  const signature = await signer.signMessage(messageToSign);
  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
  console.log("-------------------------------------");
  console.log(
    "Signer address and recovered address",
    await signer.getAddress(),
    recoveredAddress
  );
  console.log("-------------------------------------");
  return {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: recoveredAddress,
  };
}
