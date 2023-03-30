// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import { ERC2771Recipient } from "@opengsn/contracts/src/ERC2771Recipient.sol";
import { Executor, Enum } from "@gnosis.pm/safe-contracts/contracts/base/Executor.sol";
import { ContextUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import { OwnableUpgradeable } from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ProofVerifierStorage } from "./ProofVerifierStorage.sol";
import { IProofVerifierErrorsAndEvents } from "./IProofVerifierErrorsAndEvents.sol";

/// @title Proof Verifier
/// @author Mihirsinh Parmar from Curve Labs
contract ProofVerifierRelayer is ERC2771Recipient, OwnableUpgradeable, UUPSUpgradeable, Executor, ProofVerifierStorage, IProofVerifierErrorsAndEvents {

    enum DeploymentMode {UPGRADEABLE, NON_UPGRADEABLE}

    constructor (DeploymentMode _deploymentMode) initializer {
        if(_deploymentMode == DeploymentMode.UPGRADEABLE) {
            _disableInitializers();
        }
    }

    function initialise() external initializer {
        // initialise state variables
    }

    function proveAndRelay(address to, uint256 value, bytes memory data) external {
        // accept params
        // params needed to verify
        // params needed to execute
        // check if params are correct
        // verify proofs

        // relay public signal
        // by default on Call Operation will be made, no delegate.
        // This is to prevent any external to be ran in this contract context
        bool success = execute(to, value, data, Enum.Operation.Call, gasleft());
        if (!success) {
            revert RelayedExecutionReverted();
        }
        emit Success();
    }

    function _authorizeUpgrade(address newImplementation)
		internal
		virtual
		override
		onlyOwner
	{}

    // override functions
	function _msgSender()
		internal
		view
		override(ERC2771Recipient, ContextUpgradeable)
		returns (address sender)
	{
		sender = ERC2771Recipient._msgSender();
	}

	function _msgData()
		internal
		view
		override(ERC2771Recipient, ContextUpgradeable)
		returns (bytes calldata)
	{
		return ERC2771Recipient._msgData();
	}
}
