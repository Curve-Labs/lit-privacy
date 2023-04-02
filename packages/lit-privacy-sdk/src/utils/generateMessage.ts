import ethers from "ethers";
import { hexConcat } from "./utils";

export function generateMessageForIdentityProof(
  inputArray: Array<any>
): string {
  return hexConcat(inputArray);
}

export function generateMessageForMembershipProof(
  inputArray: Array<any>
): string {
  const nullifierHashSeed = hexConcat(inputArray);
  return ethers.utils.keccak256(nullifierHashSeed);
}
