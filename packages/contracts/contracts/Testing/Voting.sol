/// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Voting {
    address public tokenAddress;
    address public trustedProofVerifier;
    uint256 public yesVotes;
    uint256 public noVotes;

    error UnknownProofVerifier(address _unknownProofVerifier);

    constructor(address _tokenAddress, address _trustedProofVerifier) {
        tokenAddress = _tokenAddress;
        trustedProofVerifier = _trustedProofVerifier;
    }

    function votePrivately(bytes memory data) external {
        // an optimistic trust needs to be made on trusted verifier
        if (!(trustedProofVerifier == msg.sender)) {
            revert UnknownProofVerifier(msg.sender);
        }
        bool vote = abi.decode(data, (bool));
        if(vote) {
            yesVotes++;
        } else {
            noVotes++;
        }
    }
}
