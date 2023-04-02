// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC2771Recipient} from "@opengsn/contracts/src/ERC2771Recipient.sol";
import {ContextUpgradeable} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {ProofVerifierRelayerStorage} from "./ProofVerifierRelayerStorage.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IProofVerifierRelayerErrorsAndEvents} from "./IProofVerifierRelayerErrorsAndEvents.sol";
import {IProofRelayHandler} from "./ProofRelayHandler/IProofRelayHandler.sol";

/// @title Proof Verifier
/// @author Mihirsinh Parmar from Curve Labs
contract ProofVerifierRelayer is
    ERC2771Recipient,
    OwnableUpgradeable,
    UUPSUpgradeable,
    ProofVerifierRelayerStorage,
    IProofVerifierRelayerErrorsAndEvents
{
    enum DeploymentMode {
        PROXY,
        NON_PROXY
    }

    constructor(DeploymentMode _deploymentMode) {
        if (_deploymentMode == DeploymentMode.PROXY) {
            _disableInitializers();
        }
    }

    function initialize(address _publicPkpAddress) external initializer {
        // initialize state variables
        publicPkpAddress = _publicPkpAddress;
    }

    // verify proof and relay the payload to destination contract
    // blockNumer: zero left padded hexadecimal block number
    // publicSignal: a application specific salt/signal to add randomness
    // identityProof: signature returned from ProofOfIdentity Lit Action
    // membershipProof: signature returned from ProofOfMembership Lit Action
    // to: address of business logic contract
    // data: encoded data to be passed to business logic contract
    function proveAndRelay(
        bytes32 blockNumber,
        address to,
        bytes memory publicSignal,
        bytes memory identityProof,
        bytes memory membershipProof,
        bytes memory data
    ) external {
        // recreate nullifier hash
        bytes32 _nullifierHash = keccak256(
            bytes.concat(identityProof, blockNumber, publicSignal)
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

        // generate identity hash
        bytes32 _identityHash = keccak256(identityProof);

        // relay public signal
        // business logic to  be implemented at implementation contract
        // if you want a member to only interact once, you can limit it by ensuring a nullifier hash is used only once
        // if you want a user to only interact once, you can limit it by ensuring an identifier  hash is used only once
        IProofRelayHandler(to).handleRelay(data, _nullifierHash, _identityHash);
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
