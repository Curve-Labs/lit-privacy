// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IProofRelayHandler} from "./IProofRelayHandler.sol";

abstract contract ProofRelayHandler is IProofRelayHandler {
    address public trustedProofVerifier;

    error UnknownProofVerifier(address _unknownProofVerifier);

    constructor (address _trustedProofVerifier) {
        trustedProofVerifier = _trustedProofVerifier;
    }

    function _ensureRelayedFromTrustedVerifier() internal view {
        // an optimistic trust needs to be made on trusted verifier
        if (!(trustedProofVerifier == msg.sender)) {
            revert UnknownProofVerifier(msg.sender);
        }
    }
}