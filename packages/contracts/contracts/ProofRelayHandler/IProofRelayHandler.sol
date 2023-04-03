// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title Proof Relay Handler
/// @author Mihirsinh Parmar <mihirsinh@curvelabs.eu> <https://github.com/codebuster22>
interface IProofRelayHandler {
    /// @notice handles relay calls from ProofVerifierRelayer after proof verification
    /// @dev ensure only trusted ProofVerifierRelayer are allowed to invoke this function
    /// @param data abi encoded data specific to business logic
    /// @param nullifierHash a proof that proves  membership so that one membership is not used multiple times
    /// @param identityHash a proof that proves identity so that one identity is not used multiple times
    function handleRelay(
        bytes memory data,
        bytes32 nullifierHash,
        bytes32 identityHash
    ) external;
}
