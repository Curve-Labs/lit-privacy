import { DeployFunction } from "hardhat-deploy/dist/types";
import { Contracts } from "./00_deploy_pvr";

const tokenAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";

const deployFunction: DeployFunction = async (hre) => {
	// prepare
	const { ethers, deployments, getChainId } = hre;
	const [deployer] = await ethers.getSigners();
	await getChainId();

    const {deploy} = deployments;

    const pvrInstance = await ethers.getContract(Contracts.ProofVerifier);

    // deploy test contract
    const {address: votingAddress} = await deploy(Contracts.TestContract, {
        from: deployer.address,
        args: [tokenAddress, pvrInstance.address],
        log: true,
        skipIfAlreadyDeployed: false
    });
}

deployFunction.tags = ["TestContract"];
export default deployFunction;
