export default `
  const generateProofOfIdentity = async () => {
    const { message, signature, blockNumber, publicSignal } = fingerprint;
    const address = await ethers.utils.verifyMessage(message, signature);
    const parsedBlockNumber = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockNumber), 32);
    const dataToBeSigned = ethers.utils.hexlify(ethers.utils.concat([address, parsedBlockNumber, publicSignal]));
    console.log({message, signature, blockNumber, publicSignal, address, parsedBlockNumber, dataToBeSigned});
    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message: dataToBeSigned, publicKey: publicKey, sigName: "sig1" });
  };

  generateProofOfIdentity();
`;
