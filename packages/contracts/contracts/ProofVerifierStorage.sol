// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract ProofVerifierStorage {
    mapping(bytes32 => bool) public nullifierHashes;
    address public publicPkpAddress;
}