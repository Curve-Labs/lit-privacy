import { Deployments } from "./types/Deployments";
import LitPrivacy from "./LitPrivacy/LitPrivacy";
import generateAuthSigNode from "./utils/generateAuthSigNodeJs";
import {
  generateMessageForIdentityProof,
  generateMessageForMembershipProof,
} from "./utils/generateMessage";
import {
  convertBlockNumberToLeftPadHex,
  etherV6Id,
  hexConcat,
} from "./utils/utils";
import * as ProofVerifierRelayerDeployments from "./config//deployments";
import * as ProofVerifierRelayerAbi from "./config/abi";

export default LitPrivacy;
export {
  generateAuthSigNode,
  Deployments,
  generateMessageForIdentityProof,
  generateMessageForMembershipProof,
  convertBlockNumberToLeftPadHex,
  etherV6Id,
  hexConcat,
  ProofVerifierRelayerDeployments,
  ProofVerifierRelayerAbi,
};
