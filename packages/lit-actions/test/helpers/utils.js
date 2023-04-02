import { ethers } from "ethers";

export function etherV6Id(input) {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input));
}

export function convertBlockNumberToLeftPadHex(blockNumber) {
  const blockNumberInHex = ethers.utils.hexlify(blockNumber);
  return ethers.utils.hexZeroPad(blockNumberInHex, 32);
}

export function concat(inputArray) {
  return ethers.utils.hexlify(ethers.utils.concat(inputArray));
}

export function generateMessageForIdentityProof(
  inputArray
) {
  return concat(inputArray);
}

export function generateMessageForMembershipProof(
  inputArray
) {
  const nullifierHashSeed = concat(inputArray);
  return ethers.utils.keccak256(nullifierHashSeed);
}
