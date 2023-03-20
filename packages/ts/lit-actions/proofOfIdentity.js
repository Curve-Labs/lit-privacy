export default `
  const generateProofOfIdentity = async () => {
    const { message, signature, blockNumber, publicSignal } = fingerprint;
    const address = await ethers.utils.verifyMessage(message, signature);
    console.log(typeof blockNumber)
    const parsedBlockNumber = ethers.utils.hexZeroPad(ethers.utils.hexlify(blockNumber), 32);
    console.log(parsedBlockNumber);
    const toSign = ethers.utils.concat([address, parsedBlockNumber, publicSignal]);

    const sigShare = await LitActions.ethPersonalSignMessageEcdsa({ message: toSign, publicKey: "0x04845c2112794ebf3fad3dd884e0fa00c1192d0ab20c1846622cc97db5f1864c301248ca9a3c5945ebf4e8a26bd5f1ca69191da9a19d3a93a00582babff6b7667f", sigName: "sig1" });
  };

  generateProofOfIdentity();
`;
