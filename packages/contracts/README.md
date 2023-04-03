# Proof Verifier Relayer (PVR)

ProofVerifierRelayer is a contract that helps in verifing the proof and relay the payload to destination contract.

## Contracts
| Name                     | Description                                                                                            |
|--------------------------|--------------------------------------------------------------------------------------------------------|
| ProofVerifierRelayer.sol | A contract to handle proof verification and relaying the payload to implementation contract.           |
| ProofRelayHandler.sol    | An abstract contract which can be inherited to handle the call from ProofVerifierRelayer with payload. |
| Voting.sol               | A test contract that shows how to use ProofRelayHandler.                                               |

## How it works
Given user wants to interact with the contract privately
- Generate proof and dispatch using `lit-privacy-sdk`.
- `lit-privacy-sdk` will dispatch the necessary parameters to `PVR` contract on relevant chain.
- PVR Contract will verify the proof and invoke `handleRelay` at the destination chain.

## Visual Representation
![Visual Representation of Proof Verifier Relayer contracts](https://nftstorage.link/ipfs/bafkreifdx7swpk2prx42vumzf6ctd5i4gmjmq4owimog7hkjrha6jlxojm "Proof Verifier Relayer")

## Usage
To make your contract accept relay
- inherit `ProofRelayHandler` contract which provides method to safely handle relay. 
```solidity
import {ProofRelayHandler} from "./ProofRelayHandler.sol";

contract ApplicationContract is ProofRelayHandler {
    constructor (
        ...params, 
        address _trustedProofVerifier // necessary parameter
    ) ProofRelayHandler(_trustedProofVerifier) {
        // initialise your state variables if needed
    }
}
```
Ensure correct business logic is implemented by overriding `handleRelay` method.
```solidity
    function handleRelay(
        bytes memory data, // abi encoded payload
        bytes32 nullifierHash, // keccak256 hash of membership proof
        bytes32 identityHash // keccak256 hash of identity proof
    ) public virtual {
        // ensure correctly relayed from trusted verifier
        _ensureRelayedFromTrustedVerifier();

        // here goes your business logic
    }
```
putting it all together
```solidity
import {ProofRelayHandler} from "./ProofRelayHandler.sol";

contract ApplicationContract is ProofRelayHandler {
    constructor (
        ...params, 
        address _trustedProofVerifier // necessary parameter
    ) ProofRelayHandler(_trustedProofVerifier) {
        // initialise your state variables if needed
    }

    function handleRelay(
        bytes memory data,
        bytes32 nullifierHash,
        bytes32 identityHash
    ) public virtual {
        // ensure correctly relayed from trusted verifier
        _ensureRelayedFromTrustedVerifier();

        // here goes your business logic
    }
}
```
