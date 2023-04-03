// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @title Proof Verifier Relayer
/// @author Mihirsinh Parmar <mihirsinh@curvelabs.eu> <https://github.com/codebuster22>
interface IProofVerifierRelayerErrorsAndEvents {
    /// @notice Error when the proof is invalid
    error InvalidSignature();
    
    /// @notice Event for successful execution relayed call to implementation contract
    event Success();
}