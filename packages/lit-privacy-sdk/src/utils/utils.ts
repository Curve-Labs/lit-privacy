import * as ethers from "ethers";

// logic to generate same output as ethers.id() of ethers@v6
export function etherV6Id(input: any): string {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(input));
}

export function convertBlockNumberToLeftPadHex(blockNumber: number): string {
  const blockNumberInHex = ethers.utils.hexlify(blockNumber);
  return ethers.utils.hexZeroPad(blockNumberInHex, 32);
}

export function hexConcat(inputArray: Array<any>): string {
  return ethers.utils.hexlify(ethers.utils.concat(inputArray));
}
