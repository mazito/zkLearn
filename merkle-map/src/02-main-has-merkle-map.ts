import {
  AccountUpdate,
  Mina,
  PrivateKey
} from 'snarkyjs';

import { Sender, HasMerkleMapContract } from './contracts/index.js';

import { Personas } from './models/personas.js';


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

// const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];
const theSender: Sender = Local.testAccounts[1];


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
 * 3) Now run some contract methods 
 ******************************************************************************/

const personas = new Personas(zkApp, theSender);

await personas.addNew("100", 5);

await personas.update("100", 500);


/*******************************************************************************
 * 4) Done !
 ******************************************************************************/

console.log('\nmain: Shutting down');
