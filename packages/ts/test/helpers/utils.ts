import { ethers } from "ethers";

const etherV6Id = (input: any): string =>
  ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input));

function convertBlockNumberToLeftPadHex(blockNumber: number): string {
  const blockNumberInHex = ethers.utils.hexlify(blockNumber);
  return ethers.utils.hexZeroPad(blockNumberInHex, 32);
}

function concat(inputArray: Array<any>): string {
  return ethers.utils.hexlify(ethers.utils.concat(inputArray));
}

function generateMessageForIdentityProof(inputArray: Array<any>): string {
  return concat(inputArray);
}

function generateMessageForMembershipProof(inputArray: Array<any>): string {
  const nullifierHashSeed = concat(inputArray);
  return ethers.utils.keccak256(nullifierHashSeed);
}

export {
  etherV6Id,
  convertBlockNumberToLeftPadHex,
  concat,
  generateMessageForIdentityProof,
  generateMessageForMembershipProof
};
