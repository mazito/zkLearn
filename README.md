# zkLearn
Includes examples and experiments while learning how to build MINA zkApps

### [Simple](./01-simple) ###

**The basic "Hello World" example**

Source:
- Tutorial: https://docs.minaprotocol.com/zkapps/tutorials/hello-world
- Code: https://github.com/o1-labs/docs2/tree/main/examples/zkapps/01-hello-world

Changes:
- Changed code in `main.ts` eliminated some deprecated methods.
- Divided in blocks and heavily commented `main.ts` 

### [Merkle-Map](./02-merkle-map) 

**A MerkleMap usage example**

Source:
- Tutorial: https://docs.minaprotocol.com/zkapps/tutorials/common-types-and-functions#merkle-map
- Code: https://github.com/o1-labs/docs2/tree/main/examples/zkapps/05-common-types-and-functions

Changes:
- Full example of a contract inserting and updating MerkleMap
- Include  a model definition and make it use the contract 
- Refactor folders: `./contracts` `./models` and `main.ts`

TODO:
- Refactor deploy and environment setup in `main.ts`
- Add an Offchain storage server for the MerkleMap

### [zkApp UI using SvelteKit](./05-zkapp-sveltekit-ui/)

**An example on how to correctlye setup and build a zkApp UI using SvelteKit.** 

**Why ?** 

- Currently most tutorials and examples for MINA zkApps UI are using React, and had trouble finding examples with Svelte and SvelteKit.
- At the time of this writing (2023-06-20) a project created fro SvelteKit using `zk project ...` will not build.

It demonstrates how to: 

1. **Load Snarky, init the zkApp instance, and compile the contract**
2. **Connect the Auro wallet**
3. **Call a method on the contract and send a transaction with fees payed with the wallet**
