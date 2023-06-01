import { Square } from './contracts/index.js';
import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';

//await isReady;
console.log('\n\nSnarkyJS loaded');

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

//////////////////////////////////////////////////////////////////////////////////////////

// Create a public/private key pair. 
// The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Square 
const zkAppInstance = new Square(zkAppAddress);

// deploy it to zkAppAddress
// - first create the transaction
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
console.log('transaction create deployTxn=', deployTxn.toPretty());
// - now sign the transaction
const txnResult = await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
console.log(`transaction deployTxn.sign=`, JSON.stringify(txnResult));

// get the initial state of Square after deployment
const num0 = zkAppInstance.num.get();
console.log('state after init:', num0.toString());

// update your local zkApp account with a transaction
const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.update(Field(9));
});
console.log("zkAppInstance.update txn1=", txn1.toPretty());
await txn1.prove();
console.log("prove txn1=");
await txn1.sign([senderKey]).send();
console.log("send txn1=");
const num1 = zkAppInstance.num.get();
console.log('state after txn1:', num1.toString());

//////////////////////////////////////////////////////////////////////////////////////////

console.log('Shutting down');
//await shutdown();