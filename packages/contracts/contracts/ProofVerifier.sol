// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC2771Recipient} from "@opengsn/contracts/src/ERC2771Recipient.sol";
import {Executor, Enum} from "@gnosis.pm/safe-contracts/contracts/base/Executor.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ProofVerifierStorage} from "./ProofVerifierStorage.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IProofVerifierErrorsAndEvents} from "./IProofVerifierErrorsAndEvents.sol";

/// @title Proof Verifier
/// @author Mihirsinh Parmar from Curve Labs
contract ProofVerifierRelayer is
    ERC2771Recipient,
    OwnableUpgradeable,
    UUPSUpgradeable,
    Executor,
    ProofVerifierStorage,
    IProofVerifierErrorsAndEvents
{
    enum DeploymentMode {
        UPGRADEABLE,
        NON_UPGRADEABLE
    }

    constructor(DeploymentMode _deploymentMode) initializer {
        if (_deploymentMode == DeploymentMode.UPGRADEABLE) {
            _disableInitializers();
        }
    }

    function initialise() external initializer {
        // initialise state variables
    }

    // verify proof and relay the payload to destination contract
    // blockNumer: zero left padded hexadecimal block number
    // publicSignal: abi.encoded message that needs to be sent as payload
    // identityProof: signature returned from ProofOfIdentity Lit Action
    // membershipProod: signature returned from ProofOfMembership Lit Action 
    function proveAndRelay(
        bytes32 blockNumber,
        bytes memory publicSignal,
        bytes memory identityProof,
        bytes memory membershipProof,
        address to,
        uint256 value,
        bytes memory data
    ) external {
        // recreate nullifier hash
        bytes32 _nullifierHash = keccak256(
            abi.encode(identityProof, blockNumber, publicSignal)
        );

        // verify proofs
        // check if nullifier hash has been signed by PKP or not
        // PKP signatures are same as ECDSA signatures,
        // so no need for extra checks for contract signatures (EIP1271)
        (address recoveredAddress, ) = ECDSA.tryRecover(
            _nullifierHash,
            membershipProof
        );
        // check if recovered address is the PKP's public address
        if (recoveredAddress == publicPkpAddress) {
            revert InvalidSignature();
        }

        // check if nullifier hash has been used or not
        if (!nullifierHashes[_nullifierHash]) {
            revert NullifierAlreadyUsed(_nullifierHash);
        }
        // mark the nullifier hash as marked
        nullifierHashes[_nullifierHash] = true;

        // relay public signal
        // by default on Call Operation will be made, no delegate.
        // This is to prevent any external to be ran in this contract context
        bool success = execute(to, value, data, Enum.Operation.Call, gasleft());
        if (!success) {
            revert RelayedExecutionReverted();
        }
        emit Success();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal virtual override onlyOwner {}

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
