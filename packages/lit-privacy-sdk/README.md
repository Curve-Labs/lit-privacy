# lit-privacy-sdk (Browser Only) (TS)

A package to make private transactions based on proof of identity and proof of membership using Lit Actions and Gelato Relayer.
Using the current version of this package, you can allow token holders (ERC20, ERC721, ERC1155) to interact secretly with your implementation contract without fear of identification.

## Lit Actions and respective PKPss
| Name                | IPFS CID                                       | PKP Address                                |
|---------------------|------------------------------------------------|--------------------------------------------|
| Proof of Identity   | QmTVqamJEKyprAG8DFuEuCnVQGitnWeQWu3ctRjYEVVAuS | 0x5846D64aA8de4eb9a0245D00f1963Db4FEE1e31F |
| Proof of Membership | QmNVsvPnyHUKU8qSFRbxKuSCN1P3wRPBuYpgEFngNXuuHs | 0x3a20ba27BcC2A6c561D5693B518Aa05cEfa65f7c |

## Use cases

- Private voting where token holders need to cast votes secretly.
- Allow token holders to verify their membership privately
- Create a Mixer like Tornado Cash just for token holders
- and many more...

## Usage

### Install

```
yarn add lit-privacy-sdk
```

or

```
npm install lit-privacy-sdk
```

### Import

```ts
import LitPrivacy from "lit-privacy-sdk";
```

### Instantiate

```ts
const litPrivacyClient = new LitPrivacy(
  provider, // Web3Provider
  chain, // chain where the token contract is deployed
  publicSignal, // an application specific string
  tokenAddress, // token contract address
  blockNumber, // a fixed block number related to application
  tokenType // type of token eg. ERC721 ERC20 ERC1155
);

// initialize
await litPrivacyClient.initialize();
```

### Generate Proof and Relay using Gelato

```ts
await litPrivacyClient.generateProofAndRelayUsingGelato(
  gelatoRelayerApiKey, // API Key can be generated from https://relay.gelato.network
  provider, // Web3Provider
  implementationChain, // chain where the implementation is deployed
  implementationContractAddress, // implementation contract address
  payload // abi encoded parameters for the implementation contract
);
```

## Putting it all together using an example
We will build a small app that allows ENS domain holders to secretly vote on a contract deployed on mumbai testnet.

```ts
// token configuration
const chain = "ethereum";
const tokenAddress = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85";
const tokenType = "ERC721";

// implementation configuration
// note: your token can be on a different chain and,
// your intended interaction contract can be on different chain
// given both chains are supported by Lit Protocol
const implementationChain = "mumbai";
const implementationContract = "0x0588d013012B1E47883e9C720d809e1BdD84f675";

// application specific configuration
const publicSignal = "ENS_PROPOSAL_1";
const blockNumber = 33884421;

// get provider
const provider = new ethers.providers.Web3Provider(window?.ethereum);
// connect wallet
await provider.send("eth_requestAccounts", []);
// get signer
const signer = provider.getSigner();
const signerAddress = await signer.getAddress();

// instantiate SDK
const litPrivacyClient = new LitPrivacy(
  provider,
  chain,
  publicSignal,
  tokenAddress,
  blockNumber,
  tokenType
);

// initialise sdk
await litPrivacyClient.initialize();

// generate payload for the implementation contract
const payload = ethers.utils.defaultAbiCoder.encode(["bool"], [data]);

// generate proof of membership and
// send proof to vote
await litPrivacyClient.generateProofAndRelayUsingGelato(
  gelatoRelayerKey,
  provider,
  implementationChain,
  implementationContract,
  payload
);
```

## Note
Ensure your smart contract inherits `ProofRelayHandler` or follows the interface `IProofRelayHandler`.
Learn more at [here.](https://github.com/Curve-Labs/lit-privacy-sdk/tree/main/packages/contracts#readme)
