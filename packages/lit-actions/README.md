# Lit Action

A Package to develop and test Lit Actions which will be used by `lit-privacy-sdk`. Lit Action is a piece of javascript code stored on IPFS and are ran on Lit Network. Storing the code on IPFS ensures that code doesn't change.

# Proof of Identity
A proof to verify the ownership of a wallet. This Lit Action takes the user signature verifies it and generates a unqiue message which is signed by Lit's PKP. The signature of this PKP proves the ownership of wallet.

# Proof of Membership
A proof to verify that the identified wallet holds atleast one token from specified token contract. This Lit Action takes the Proof of Identity, verifies it, checks if given wallet have required number of tokens using Lit Access Control Conditions and generates a unqiue message which is signed by Lit's PKP. The signature of this PKP proves the membership of wallet.

#  Develop Lit Actions
As Lit actions are piece of javascript code that is stored on IPFS. The development of Lit Actions looks a bit different.

## Create Lit Action
To create new Lit Action:

### Get your PKP
Get your PKP from here https://explorer.litprotocol.com/mint-pkp.
![Mint PKP](https://nftstorage.link/ipfs/bafybeih3esmop5zrqbswftp5c6xrnrizwnzttsy3hbwqo4vgtyohnaod7m "Mint PKP")

Check if you already if a PKP or not here https://explorer.litprotocol.com/profile
![View Your PKP](https://nftstorage.link/ipfs/bafybeifma7bdt3yekdnwdwd7xzaej3kgtedyi7vfos4jgzi3jmyb3yn7ne "View Your PKP")
You will need PKP's Public Key and Address.

### Setup Enviornment variables
```
PRIVATE_KEY=
PKP_MEMBERSHIP=
PKPAddress_MEMBERSHIP=
PKP_IDENTITY=
PKPAddress_IDENTITY=
PUBLISH_LIT_API=
MEMBERSHIP_PROOF_ACTION_CID=
IDENTITY_PROOF_ACTION_CID=
TEST_TIMEOUT_TIME=
USE_ACTION_FROM_IPFS=
// add your Lit Action specific Enviornment variables
```
### Create Lit Action file
Create a new file in ./lit-actions/YOUR_LIT_ACTION_NAME.js

create using command line
```sh
touch lit-actions/YOUR_LIT_ACTION_NAME.js
```
### Add your Lit Action code
```javascript
export default `
    async function go() {
        // your Lit Action code goes here
    }

    go();
`
```
Note: you cannot import packages. Some packages are available globally like `ethers` and `LitActions`.

### Accept Parameters
Your Lit Action will have parameters available as global variables, so you can easily access them in your function.
For example:
I want to pass a parameter `address` to my lit action, I can access it directly in my lit action like this
```javascript
export default `
    async function go() {
        console.log(address);
    }

    go();
`
```

### Create a connector to use Lit Action
Create a connector file in `./connectors/YOUR_LIT_ACTION_CONNECTOR_NAME.js`. Connectors are used to run your Lit Action easily. They abstract the complexity of running Lit Action.
```javascript
async function CONNECTOR_NAME(
    authSig, // Lit's Auth Sig
 fingerprint, // an object which contains your parameters
  PKP // PKP Public Key
  ) {
    // instantiate Lit Node Client
    const litNodeClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
  });
  await litNodeClient.connect();

  // generate LitActionConfig
  const LitActionConfig = {
    authSig,
    jsParams: {  // jsParams object's properties will be available to Lit Action as global variable
      fingerprint,
      publicKey: PKP
    },
    ?code,
    ?ipfsId
  }

  // execute Lit Action and return the output
  return await litNodeClient.executeJs(litActionConfig);

}
```
Note: either one of `code` or `ipfsId` is required in `LitActionConfig`. If both are not present, Lit Action execution will fail

### Write test
Write your Lit Actions tests in `./test/LIT_ACTION_NAME.test.js`
We use, Jest to run tests on Lit Actions.

### Publish Lit Action
Copy your Lit Action Code and paste it in here https://explorer.litprotocol.com/create-action.
![Lit Action Publishing](https://nftstorage.link/ipfs/bafybeifp7dm7h5nlfh7gjembuiasb6ym7bjwlf2a5bd3oqlipoidcfu4ou "Lit Action Publishing")

Once published to IPFS, copy and store the IPFS CID in enviornment Variables.
![Lit Action Published](https://nftstorage.link/ipfs/bafybeifsi3kqi5jhuty5kvmqechjq76qfqa2pdyamoet7qbp2gx6nvaoaq "Lit Action Published")

### Allow Lit Action to use PKP to sign
Paste the IPFS CID in the search box of https://explorer.litprotocol.com/

Grant or Revoke Permission from Lit Action
![Grant or Revoke Permission](https://nftstorage.link/ipfs/bafybeibteuwi7u5fd42i2yw6bixu2fftouowq37kv2pck5xsk42lsnkgii "Grant or Revoke Permission")

Note: If you don't give permission to your Lit Action to use the PKP, Lit Action might work for you but Lit Action will not work for others. 

### Pat your back! You Did it!
