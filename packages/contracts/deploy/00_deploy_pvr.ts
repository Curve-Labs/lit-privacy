import { DeployFunction } from "hardhat-deploy/dist/types";
import LitPrivacyConstants from "lit-privacy-sdk/dist/LitPrivacy/LitPrivacyConstants";

export const Contracts = {
    ProofVerifier: "ProofVerifierRelayer",
    TestContract: "Voting",
    TestERC721: "TestERC721",
  };

const tokenAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

const deployFunction: DeployFunction = async (hre) => {
	// prepare
	const { ethers, upgrades, deployments, network, getChainId } = hre;
	const { save, getExtendedArtifact } = deployments;
	const [deployer] = await ethers.getSigners();
	await getChainId();

    const {deploy} = deployments;

    /// initialize ProofVerifierRelayer
    const {address: proofVerifierRelayerAddress} = await deploy(Contracts.ProofVerifier, {
        from: deployer.address,
        args: [1],
        log: true,
        skipIfAlreadyDeployed: true
    });
    const proofVerifierRelayerInstance = await ethers.getContractAt(Contracts.ProofVerifier, proofVerifierRelayerAddress);
    await (await proofVerifierRelayerInstance.initialize(LitPrivacyConstants.MEMBERSHIP_PROOF_SIGNER_PKP.ADDRESS)).wait();

    // deploy test contract
    const {address: votingAddress} = await deploy(Contracts.TestContract, {
        from: deployer.address,
        args: [tokenAddress, proofVerifierRelayerAddress],
        log: true,
        skipIfAlreadyDeployed: true
    });
}

deployFunction.tags = ["ProofVerifierRelayer"];
export default deployFunction;
