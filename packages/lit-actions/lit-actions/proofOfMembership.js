export default `const generateProofOfMembership = async () => {
  const {
    message,
    identityProof,
    signature,
    blockNumber,
    publicSignal,
    tokenType,
    chain,
    authSig,
    tokenAddress,
  } = fingerprint;
  // get user address
  const address = await ethers.utils.verifyMessage(message, signature);

  // set conditions
  const conditions = [
    {
      contractAddress: tokenAddress,
      standardContractType: tokenType,
      chain,
      method: 'balanceOf',
      parameters: [
        address
      ],
      returnValueTest: {
        comparator: '>',
        value: '0'
      }
    }
  ]
  // check lit conditions
  const result = await LitActions.checkConditions({conditions, authSig, chain});
  // return if balance is 0
  if(!result) {
    console.log("Zero Balance. No Membership found.");
    return;
  }
  // user has balance > 0
  const parsedBlockNumber = ethers.utils.hexZeroPad(
    ethers.utils.hexlify(blockNumber),
    32
  );

  const dataToBeSigned = ethers.utils.keccak256(ethers.utils.hexlify(
    ethers.utils.concat([identityProof, parsedBlockNumber, publicSignal])
  ));

  const toSign = Array.from(ethers.utils.arrayify(ethers.utils.hashMessage(dataToBeSigned)))

  const sigShare = await LitActions.signEcdsa({
    toSign: toSign,
    publicKey: publicKey,
    sigName: "sig1",
  });
};

generateProofOfMembership();
`;
