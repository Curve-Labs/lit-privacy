// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IProofRelayHandler} from "./IProofRelayHandler.sol";

/// @title Proof Relay Handler
/// @author Mihirsinh Parmar <mihirsinh@curvelabs.eu> <https://github.com/codebuster22>
abstract contract ProofRelayHandler is IProofRelayHandler {
    /// @notice address of trusted ProofVerifierRelayer
    /// @return address of trusted ProofVerifierRelayer
    address public trustedProofVerifier;

    /// @notice Error when a call is made from not trusted ProofVerifierRelayer
    error UnknownProofVerifier(address _unknownProofVerifier);

    constructor (address _trustedProofVerifier) {
        trustedProofVerifier = _trustedProofVerifier;
    }

    /// @notice internal function that checks if the call is made by trusted ProofVerifierRelayer
    /// @dev if call is made by untrusted ProofVerifierRelayer, throws error UnknownProofVerifier
    function _ensureRelayedFromTrustedVerifier() internal view {
        // an optimistic trust needs to be made on trusted verifier
        if (!(trustedProofVerifier == msg.sender)) {
            revert UnknownProofVerifier(msg.sender);
        }
    }
}