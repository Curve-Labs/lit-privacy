/// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
    uint256 public totalSupply;
    constructor () ERC721("Test", "TT") {

    }

    function mint() external {
        totalSupply++;
        _safeMint(_msgSender(), totalSupply);
    }

    function keccak256Hash(bytes memory toBeHashed) external pure returns(bytes32) {
        return keccak256(toBeHashed);
    }
}