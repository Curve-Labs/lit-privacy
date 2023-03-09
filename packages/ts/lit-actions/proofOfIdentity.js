export default `
const go = async () => {
  // test an access control condition
  // const testResult = await Lit.Actions.checkConditions({conditions, authSig, chain})

  // console.log('testResult', testResult)

  // // only sign if the access condition is true
  // if (!testResult){
  //   return;
  // }

  // this is the string "Hello World" for testing
  const toSign = [72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100];
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  const sigShare = await LitActions.signEcdsa({ toSign, publicKey: "0x047c98fc7448cf9e4009f3d9b2387e316e161b4594e211a6540f0c751496889eccb0ea456208dd0ff706b5a56407530d31de4eed87755e4dd65a07c314b28cec09", sigName: "sig1" });
};



go();
`;
