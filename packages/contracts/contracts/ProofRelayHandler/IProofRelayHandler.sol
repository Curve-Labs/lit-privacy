// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

interface IProofRelayHandler {
    // data specific to logic
    // nullifier hash a proof that proves  membership so that one membership is not used multiple times
    // identity hash a proof that proves identity so that one identity is not used multiple times
    function handleRelay(
        bytes memory data,
        bytes32 nullifierHash,
        bytes32 identityHash
    ) external;
}
