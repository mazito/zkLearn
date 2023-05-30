# zkLearn
Includes examples and experiments while learning how to build MINA zkApps

### [Simple](./simple) ###

**The basic "Hello World" example**

Source:
- Tutorial: https://docs.minaprotocol.com/zkapps/tutorials/hello-world
- Code: https://github.com/o1-labs/docs2/tree/main/examples/zkapps/01-hello-world

Changes:
- Changed code in `main.ts` eliminated some deprecated methods.
- Divided in blocks and heavily commented `main.ts` 

### [Merkle-Map](./merkle-map) 

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
