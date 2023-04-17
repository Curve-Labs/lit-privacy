import { AuthSig } from "@lit-protocol/types";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import * as ethers from "ethers";
import LitPrivacyConstants from "./LitPrivacyConstants";
import abi from "../config/abi";
import deployments from "../config/deployments";
import { GelatoRelay, SponsoredCallRequest } from "@gelatonetwork/relay-sdk";
import { convertBlockNumberToLeftPadHex, etherV6Id } from "../utils/utils";
const relay = new GelatoRelay();

export default class LitPrivacy extends LitPrivacyConstants {
  private litNodeClient: LitJsSdk.LitNodeClient;
  public chain: string;
  public provider;
  public authSig: AuthSig;
  public publicSignal: string;
  public tokenAddress: string;
  public blockNumber: number;
  public tokenType: string;
  public initialized: boolean;

  constructor(
    provider: any,
    chain: string,
    publicSignal: string,
    tokenAddress: string,
    blockNumber: number,
    tokenType: string,
    authSig: AuthSig,
    litNodeClient: LitJsSdk.LitNodeClient
  ) {
    super();
    this.litNodeClient = litNodeClient;
    this.authSig = authSig;
    this.chain = chain;
    this.publicSignal = etherV6Id(publicSignal);
    this.provider = provider;
    this.tokenAddress = tokenAddress;
    this.blockNumber = blockNumber;
    this.tokenType = tokenType;
    this.initialized = true;
  }

  ensureInitialized() {
    if (!this.initialized) {
      throw Error(
        "LitPrivacy instance not initialized. Initialise using LitPrivacy.initialize()"
      );
    }
  }

  async generateProofOfIdentity() {
    this.ensureInitialized();

    /// ensure auth sig is initialized
    if (this.authSig === undefined) {
      throw Error(
        "AuthSig is undefined. Ensure LitPrivacy instance is initialized properly"
      );
    }
    // generate fingerprint
    const identityFingerprint = {
      blockNumber: this.blockNumber,
      publicSignal: this.publicSignal,
      message: this.authSig.signedMessage,
      signature: this.authSig.sig,
    };

    console.log("Proof Of Identity Lit Action's input:", {
      identityFingerprint,
      PUBLIC_KEY: LitPrivacy.MEMBERSHIP_PROOF_SIGNER_PKP.PUBLIC_KEY,
      PROOF_OF_MEMBERSHIP: LitPrivacy.LIT_ACTIONS_CID.PROOF_OF_MEMBERSHIP,
    });

    // execute Lit Action
    const proofOfIdentityOutput = await this.executeLitAction(
      identityFingerprint,
      LitPrivacy.IDENTITY_PROOF_SIGNER_PKP.PUBLIC_KEY,
      LitPrivacy.LIT_ACTIONS_CID.PROOF_OF_IDENTITY
    );

    console.log(
      "Logs from Proof of Identity Lit Action:",
      proofOfIdentityOutput.logs
    );

    // the returned output will have signature under `sig1` property
    if (proofOfIdentityOutput.signatures?.sig1 === undefined) {
      throw Error(
        "Some error was encountered while generating Identity Proof. Check inputs properly"
      );
    }
    // this is the final identity proof generated from Lit Action
    const identityProof = ethers.utils.joinSignature({
      r: "0x" + proofOfIdentityOutput.signatures.sig1.r,
      s: "0x" + proofOfIdentityOutput.signatures.sig1.s,
      v: proofOfIdentityOutput.signatures.sig1.recid,
    });
    console.log("Identity Proof:", identityProof);

    // verify signature
    const recoveredPublicKey = ethers.utils.recoverPublicKey(
      "0x" + proofOfIdentityOutput.signatures.sig1.dataSigned,
      identityProof
    );
    if (
      recoveredPublicKey !== LitPrivacy.IDENTITY_PROOF_SIGNER_PKP.PUBLIC_KEY
    ) {
      throw Error(
        "Identity Proof was not properly signed by Public Key. Check Public Key."
      );
    }
    // return proof
    return identityProof;
  }

  async generateProofOfMembershipFromIdentityProof(identityProof: string) {
    this.ensureInitialized();

    /// ensure auth sig is initialized
    if (this.authSig === undefined) {
      throw Error(
        "AuthSig is undefined. Ensure LitPrivacy instance is initialized properly"
      );
    }
    // generate fingerprint
    const membershipFingerprint = {
      blockNumber: this.blockNumber,
      publicSignal: this.publicSignal,
      message: this.authSig.signedMessage,
      signature: this.authSig.sig,
      identityProof: identityProof,
      tokenType: this.tokenType,
      chain: this.chain,
      authSig: this.authSig,
      tokenAddress: this.tokenAddress,
    };

    console.log("Proof Of Membership Lit Action's input:", {
      membershipFingerprint,
      PUBLIC_KEY: LitPrivacy.MEMBERSHIP_PROOF_SIGNER_PKP.PUBLIC_KEY,
      PROOF_OF_MEMBERSHIP: LitPrivacy.LIT_ACTIONS_CID.PROOF_OF_MEMBERSHIP,
    });

    // execute Lit Action
    const proofOfMembershipOutput = await this.executeLitAction(
      membershipFingerprint,
      LitPrivacy.MEMBERSHIP_PROOF_SIGNER_PKP.PUBLIC_KEY,
      LitPrivacy.LIT_ACTIONS_CID.PROOF_OF_MEMBERSHIP
    );
    console.log(
      "Logs from Proof of Membership Lit Action:",
      proofOfMembershipOutput.logs
    );
    // the returned output will have signature under `sig1` property
    // check if the user has correct membership or not by ensuring signature is generated
    if (proofOfMembershipOutput.signatures?.sig1 === undefined) {
      console.log("No signature was done because no membership found");
      throw Error(
        "Failed generating Proof of Membership. Either the wallet doesn't contain the token or check the parameters"
      );
    }

    // this is the final membership proof generated from Lit Action
    const membershipProof = ethers.utils.joinSignature({
      r: "0x" + proofOfMembershipOutput.signatures.sig1.r,
      s: "0x" + proofOfMembershipOutput.signatures.sig1.s,
      v: proofOfMembershipOutput.signatures.sig1.recid,
    });
    console.log("Membership Proof:", membershipProof);

    // verify the signature is generated by correct public key
    const recoveredPublicKey = ethers.utils.recoverPublicKey(
      "0x" + proofOfMembershipOutput.signatures.sig1.dataSigned,
      membershipProof
    );
    if (
      recoveredPublicKey !== LitPrivacy.MEMBERSHIP_PROOF_SIGNER_PKP.PUBLIC_KEY
    ) {
      throw Error(
        "Identity Proof was not properly signed by Public Key. Check Public Key."
      );
    }

    // return proof
    return membershipProof;
  }

  async generateProofOfMembership() {
    this.ensureInitialized();
    const identityProof = await this.generateProofOfIdentity();
    const membershipProof =
      await this.generateProofOfMembershipFromIdentityProof(identityProof);
    return { membershipProof, identityProof };
  }

  async generateProofAndRelayUsingGelato(
    gelatoApiKey: string,
    interactionChain: string,
    destinationContract: string,
    data: string
  ) {
    this.ensureInitialized();
    if (gelatoApiKey === undefined || gelatoApiKey === "") {
      throw Error(
        "No Gelato API KEY found. Create account and get your API key from https://relay.gelato.network"
      );
    }
    // generate proof
    const proofs = await this.generateProofOfMembership();

    console.log(proofs, this.blockNumber, this.publicSignal);

    // get contract instance
    const proofVerifierRelayerInstance = new ethers.Contract(
      deployments[interactionChain],
      abi
    );

    // generate transaction data
    const transactionData =
      await proofVerifierRelayerInstance.populateTransaction.proveAndRelay(
        convertBlockNumberToLeftPadHex(this.blockNumber),
        destinationContract,
        this.publicSignal,
        proofs.identityProof,
        proofs.membershipProof,
        data
      );

    // Populate a relay request
    const request: SponsoredCallRequest = {
      chainId: this.provider.network.chainId,
      target: proofVerifierRelayerInstance.address,
      data: transactionData.data as string,
    };

    // Without a specific API key, the relay request will fail!
    // Go to https://relay.gelato.network to get a testnet API key with 1Balance.
    // Send a relay request using Gelato Relay!
    const relayResponse = await relay.sponsoredCall(request, gelatoApiKey);

    console.log(relayResponse);
    return relayResponse.taskId;
  }

  async executeLitAction(fingerprint: any, PKP: string, litActionCid: string) {
    this.ensureInitialized();

    /// ensure auth sig is initialized
    if (this.authSig === undefined) {
      throw Error(
        "AuthSig is undefined. Ensure LitPrivacy instance is initialized properly"
      );
    }
    try {
      return await this.litNodeClient.executeJs({
        ipfsId: litActionCid,
        authSig: this.authSig,
        jsParams: {
          fingerprint,
          publicKey: PKP,
        },
      });
    } catch (e) {
      console.log("Error occured while running Lit Action");
      console.log(e);
      throw Error("Error occured while running Lit Action");
    }
  }
}
