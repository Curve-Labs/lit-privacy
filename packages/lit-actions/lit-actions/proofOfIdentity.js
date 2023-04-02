export default `
  const generateProofOfIdentity = async () => {
    const { message, signature, blockNumber, publicSignal } = fingerprint;
    const address = await ethers.utils.verifyMessage(message, signature);
    const parsedBlockNumber = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockNumber), 32);
    const toSign = ethers.utils.hexlify(ethers.utils.concat([address, parsedBlockNumber, publicSignal]));

    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message: toSign, publicKey: publicKey, sigName: "sig1" });
  };

  generateProofOfIdentity();
`;
