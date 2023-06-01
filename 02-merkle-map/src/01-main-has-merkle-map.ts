// import { HasMerkleMapContract } from './merkle-map-contract.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  MerkleMap
} from 'snarkyjs';

import { HasMerkleMapContract } from './contracts/index.js';

/*******************************************************************************
 * 1) Setup initial enviro and test accounts
 ******************************************************************************/

//await isReady; // deprecated in 0.10
console.log('\n\nmain: SnarkyJS loaded');

const useProof = false;
const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);

const {
  privateKey: deployerKey, 
  publicKey: deployerAccount 
} = Local.testAccounts[0];

const { 
  privateKey: senderKey, 
  publicKey: senderAccount 
} = Local.testAccounts[1];

/*******************************************************************************
 * 2) Deploy the zkApp 
 ******************************************************************************/

// Create a public/private key pair. 
// The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Square 
const zkApp = new HasMerkleMapContract(zkAppAddress);

// deploy it to zkAppAddress
// - first create the transaction
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkApp.deploy();
});
console.log('\nmain: transaction create deployTxn=', deployTxn.toPretty());

// - now sign the transaction
const txnResult = await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
console.log(`\nmain: transaction deployTxn.sign=`, JSON.stringify(txnResult));

// get the initial state of Contract after deployment
const mapRoot0 = zkApp.mapRoot.get();
console.log('\nmain: state after init:', mapRoot0.toString());

/*******************************************************************************
 * 3) Now run some contract method 
 ******************************************************************************/

// here we start with an empty MerkleMap, in a real App we will need to 
// retrieve the already existent Map from some offchain storage, like:
//    const merkleMap = MerkleMapServer.get('my-map); 
const merkleMap = new MerkleMap();
console.log(`\nmain: merkleMap emptyRoot=${merkleMap.getRoot()}`);

// set up a change to the MerkleMap
const key = Field(100);
const value = Field(50);
merkleMap.set(key, value);
console.log(`\nmain: merkleMap key=${key.toString()}, value=${merkleMap.get(key)}`);

// get its root
const newRoot = merkleMap.getRoot();
console.log(`\nmain: merkleMap root=${newRoot}`);

// get the Witness of the changed key and value
//const witness = merkleMap.getWitness(key);

// update your local zkApp account with a transaction
console.log("\nmain: Calling addPersona(...) on Contract ...")
const txn1 = await Mina.transaction(senderAccount, () => {
  zkApp.addPersona(
      newRoot
  );
});
console.log("\nmain: zkApp.addPersona txn1=", txn1.toPretty());

const txnProved = await txn1.prove();
console.log("\nmain: prove txn1=", txnProved.toString());

const txnSigned = await txn1.sign([senderKey]).send();
console.log("\nmain: send txn1=", txnSigned);

// get the final changed value
const mapRoot = zkApp.mapRoot.get();
console.log('\nmain: state after txn1:', mapRoot.toString());


/*******************************************************************************
 * 4) Done !
 ******************************************************************************/

console.log('\nmain: Shutting down');
