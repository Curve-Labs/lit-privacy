// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IProofVerifierErrorsAndEvents {
    error RelayedExecutionReverted();
    error NullifierAlreadyUsed(bytes32 usedNullifierHash);
    error InvalidSignature();
    event Success();
}