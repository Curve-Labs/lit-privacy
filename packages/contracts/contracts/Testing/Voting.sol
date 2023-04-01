/// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {ProofRelayHandler} from "../ProofRelayHandler/ProofRelayHandler.sol";

contract Voting is ProofRelayHandler {
    address public tokenAddress;
    uint256 public yesVotes;
    uint256 public noVotes;
    mapping(bytes32 => bool) public hashesVoted;
    error AlreadyVoteCasted(bytes32 usedNullifierHash);

    constructor(
        address _tokenAddress,
        address _trustedProofVerifier
    ) ProofRelayHandler(_trustedProofVerifier) {
        tokenAddress = _tokenAddress;
    }

    function handleRelay(
        bytes memory data,
        bytes32 nullifierHash,
        bytes32 identityHash
    ) public virtual {
        // ensure correctly relayed from trusted verifier
        _ensureRelayedFromTrustedVerifier();
        if(hashesVoted[nullifierHash]) {
            revert AlreadyVoteCasted(nullifierHash);
        }
        hashesVoted[nullifierHash] = true;
        _votePrivately(data);
    }

    function _votePrivately(bytes memory data) internal {
        bool vote = abi.decode(data, (bool));
        if (vote) {
            yesVotes++;
        } else {
            noVotes++;
        }
    }
}
