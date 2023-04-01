// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IProofVerifierRelayerErrorsAndEvents {
    error RelayedExecutionReverted();
    error InvalidSignature();
    event Success();
}