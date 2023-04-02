import { Voting } from "./../typechain-types/contracts/Testing/Voting";
import { ProofVerifierRelayer } from "./../typechain-types/contracts/ProofVerifierRelayer";
import { ethers } from "hardhat";
import chaiAsPromised from "chai-as-promised";
import chai from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import { BytesLike } from "ethers";
import { TestERC721 } from "../typechain-types";
import { Contracts } from "../deploy/00_deploy";

function convertBlockNumberToLeftPadHex(blockNumber: number) {
  const blockNumberInHex: BytesLike = ethers.utils.hexlify(blockNumber);
  return ethers.utils.hexZeroPad(blockNumberInHex, 32);
}

function concat(inputArray: Array<any>) {
  return ethers.utils.hexlify(ethers.utils.concat(inputArray));
}

function generateMessageForIdentityProof(inputArray: Array<any>) {
  return concat(inputArray);
}

function generateMessageForMembershipProof(inputArray: Array<any>) {
  const nullifierHashSeed = concat(inputArray);
  return ethers.utils.keccak256(nullifierHashSeed);
}

const deploymentMode = 1; // 0 - Proxy | 1 - Non Proxy

chai.use(chaiAsPromised);
const expect = chai.expect;

async function setupProofVerifier(
  signer: SignerWithAddress,
  publicPkpAddres: Address
) {
  const proofVerifierFactory = await ethers.getContractFactory(
    Contracts.ProofVerifier,
    signer
  );
  const proofVerifierInstance = (await proofVerifierFactory.deploy(
    deploymentMode
  )) as ProofVerifierRelayer;
  await proofVerifierInstance.initialize(publicPkpAddres);
  return { proofVerifierInstance };
}

async function setupVotingAndTokenContract(
  signer: SignerWithAddress,
  trustedVerifier: Address
) {
  const tokenFactory = await ethers.getContractFactory(
    Contracts.TestERC721,
    signer
  );
  const tokenInstance = (await tokenFactory.deploy()) as TestERC721;
  const votingFactory = await ethers.getContractFactory(
    Contracts.TestContract,
    signer
  );
  const votingInstance = (await votingFactory.deploy(
    tokenInstance.address,
    trustedVerifier
  )) as Voting;
  return { votingInstance, votingFactory, tokenFactory, tokenInstance };
}

describe("Contract: ProofVerifierRelayer", () => {
  let signer: SignerWithAddress,
    publicPkp: SignerWithAddress,
    holder: SignerWithAddress;
  let proofVerifierInstance: ProofVerifierRelayer;
  let votingInstance: Voting;
  // public signal remains constant for an application
  const publicSignal = ethers.utils.hexlify(
    ethers.utils.toUtf8Bytes("Private_Voting_1")
  );
  console.log("Public Signal", publicSignal);

  beforeEach("!! Setup", async () => {
    [signer, publicPkp, holder] = await ethers.getSigners();
    ({ proofVerifierInstance } = await setupProofVerifier(
      signer,
      publicPkp.address
    ));
    ({ votingInstance } = await setupVotingAndTokenContract(
      signer,
      proofVerifierInstance.address
    ));
  });

  context("prove and verify", () => {
    const blockNumberInNumber: number = 40000;
    const vote = {
      yes: true,
      no: false,
    };
    const blockNumber = convertBlockNumberToLeftPadHex(blockNumberInNumber);
    let data: string | BytesLike;
    let identityProof: string | BytesLike;
    let membershipProof: string | BytesLike;
    let to: Address;
    it("proof and relay", async () => {
      const fromSigner = holder;
      // encode signal
      const encodedSignal = ethers.utils.defaultAbiCoder.encode(
        ["bool"],
        [vote.yes]
      );
      console.log("encodedSignal", encodedSignal);

      // set to address
      to = votingInstance.address;

      // public signal
      data = encodedSignal;
      console.log("data", data);

      console.log("block number", blockNumber);

      // generate identity proof
      const toSign = generateMessageForIdentityProof([
        fromSigner.address,
        blockNumber,
        publicSignal,
      ]);
      console.log("toSign", toSign);

      // sign message to generate identity proof
      const signature = await publicPkp.signMessage(toSign);
      console.log("signature", signature);

      // verify signature
      console.log(
        "Signature generated is correct: ",
        ethers.utils.verifyMessage(toSign, signature) === publicPkp.address
      );

      // set identity proof
      identityProof = signature;

      // check if from address holds the token

      // generate nullifier hash
      const nullifierHash = generateMessageForMembershipProof([
        identityProof,
        blockNumber,
        publicSignal,
      ]);
      console.log("nullifierHash", nullifierHash);

      // generate membershipProof
      const nullifierSignature = await publicPkp.signMessage(nullifierHash);
      console.log("nullifierSignature", nullifierSignature);

      // verify signature
      console.log(
        "Signature generated is correct: ",
        ethers.utils.verifyMessage(nullifierHash, nullifierSignature) ===
          publicPkp.address
      );

      // set membership proof
      membershipProof = nullifierSignature;

      // relay transaction
      console.log((await votingInstance.yesVotes()).toString());
      const transactionReceipt = await proofVerifierInstance.proveAndRelay(
        blockNumber,
        to,
        publicSignal,
        identityProof,
        membershipProof,
        data
      );
      console.log((await votingInstance.yesVotes()).toString());

      // same data cannot be used to vote again
      await expect(
        proofVerifierInstance.proveAndRelay(
          blockNumber,
          to,
          publicSignal,
          identityProof,
          membershipProof,
          data
        )
      ).to.be.revertedWithCustomError(votingInstance, "AlreadyVoteCasted");
    });
    it("Cannot vote again - testing business logic is not interrupted", async () => {
      const fromSigner = holder;

      // set to address
      to = votingInstance.address;

      // public signal
      const yesData = ethers.utils.defaultAbiCoder.encode(
        ["bool"],
        [vote.yes]
      );
      const noData = ethers.utils.defaultAbiCoder.encode(
        ["bool"],
        [vote.no]
      );
      console.log("yesData", yesData);
      console.log("noData", noData);

      // generate identity proof
      const toSign = generateMessageForIdentityProof([
        fromSigner.address,
        blockNumber,
        publicSignal,
      ]);

      // sign message to generate identity proof
      const signature = await publicPkp.signMessage(toSign);

      // set identity proof
      identityProof = signature;

      // check if from address holds the token

      // generate nullifier hash
      const nullifierHash = generateMessageForMembershipProof([
        identityProof,
        blockNumber,
        publicSignal,
      ]);

      // generate membershipProof
      const nullifierSignature = await publicPkp.signMessage(nullifierHash);

      // set membership proof
      membershipProof = nullifierSignature;

      // relay transaction
      console.log((await votingInstance.yesVotes()).toString());
      console.log((await votingInstance.noVotes()).toString());
      await proofVerifierInstance.proveAndRelay(
        blockNumber,
        to,
        publicSignal,
        identityProof,
        membershipProof,
        noData
      );
      console.log((await votingInstance.yesVotes()).toString());
      console.log((await votingInstance.noVotes()).toString());

      // same nullifier hash cannot be used to vote again with different input
      await expect(
        proofVerifierInstance.proveAndRelay(
          blockNumber,
          to,
          publicSignal,
          identityProof,
          membershipProof,
          yesData
        )
      ).to.be.revertedWithCustomError(votingInstance, "AlreadyVoteCasted");
    });
  });
  
});
