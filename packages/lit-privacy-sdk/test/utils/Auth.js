const ethers =  require("ethers");
const siwe = require("siwe");

const generateAuthSig = async (signer, domain, origin, statement) => {
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
  const recoveredAddress = ethers.utils.verifyMessage(messageToSign, signature);
  console.log("-------------------------------------");
  console.log("Signer address and recovered address",signer.address, recoveredAddress);
  console.log("-------------------------------------");
  return {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: recoveredAddress,
  };
};

module.exports = {generateAuthSig};
