const {expect} = require("@jest/globals");
require("dotenv").config();
const ethers = require("ethers");
const {default: LitPrivacy} = require("../dist/index.js");
const LitJsSdk = require("@lit-protocol/lit-node-client");
const { generateAuthSig } = require("./utils/Auth.js");

const gelatoRelayKey = process.env.GELATO_RELAY_KEY;
const chain = "ethereum";
const publicSignal = "ENS_PROPOSAL_1";
const tokenAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
const tokenType = "ERC721";
const implemenationChain = "mumbai";
const implementationContract = "0xFCAEaBD08D9D5465066ce4e4e3Ec561B1c0e5CF9";
const blockNumber = 33884421;

describe("Test SDK", () => {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-mumbai.infura.io/v3/ffe539b51101462a929b607c54322ff7"
  );
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const data = true;

  beforeAll(async () => {
    const client = new LitJsSdk.LitNodeClient({
      litNetwork: "serrano",
    });
    await client.connect();
    const domain = "localhost";
    const origin = "https://localhost/login";
    const statement =
      "This is a test statement. You can put anything you want here.";

    const authSig = await generateAuthSig(
      signer,
      domain,
      origin,
      statement
    );
    const litPrivacyClient = new LitPrivacy(
      provider,
      chain,
      publicSignal,
      tokenAddress,
      blockNumber,
      tokenType,
      authSig,
      client
    );

    // generate payload
    const payload = ethers.utils.defaultAbiCoder.encode(["bool"], [data]);

    // generate proof of membership
    if (gelatoRelayKey === undefined) {
      throw Error("Gelato Relay API Key undefined");
    }
    // send proof and vote
    const taskId = await litPrivacyClient.generateProofAndRelayUsingGelato(
      gelatoRelayKey,
      implemenationChain,
      implementationContract,
      payload
    );
    console.log(taskId);
  }, 35000);
  it("It worked", async () => {
    console.log("It worked");
  })
});
