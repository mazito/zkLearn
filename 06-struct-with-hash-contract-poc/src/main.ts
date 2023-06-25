import { StructAdd } from './StructAdd.js';
import { isReady, shutdown, Mina, PrivateKey, Field, CircuitString, Bool, PublicKey } from 'snarkyjs';

import fs from 'fs';
import { loopUntilAccountExists } from './utils/accounts.js';

import { Org } from './organizations.js';

await isReady;

console.log('SnarkyJS loaded');

// ----------------------------------------------------

const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);
Mina.setActiveInstance(Berkeley);

const transactionFee = 100_000_000;

const deployAlias = process.argv[2];
const deployerKeysFileContents = fs.readFileSync(
  'keys/' + deployAlias + '.json',
  'utf8'
);
const deployerPrivateKeyBase58 = JSON.parse(
  deployerKeysFileContents
).privateKey;
const deployerPrivateKey = PrivateKey.fromBase58(deployerPrivateKeyBase58);
const deployerPublicKey = deployerPrivateKey.toPublicKey();

const zkAppPrivateKey = deployerPrivateKey;

// ----------------------------------------------------

const config = JSON.parse(fs.readFileSync(
  './config.json','utf8'
)).deployAliases;
const feePayerKeyPath = config[deployAlias].feepayerKeyPath;
const fee =  config[deployAlias].fee;
const feePayerKeys = JSON.parse(fs.readFileSync(
  feePayerKeyPath,'utf8'
));
const feePayerPrivateKey = PrivateKey.fromBase58(feePayerKeys['privateKey']);
const feePayerPublicKey = feePayerPrivateKey.toPublicKey();

// ----------------------------------------------------

//const suid = randomUUID();   

const someOrg = new Org({ 
  uid: Field(101),
  accountId: PublicKey.fromBase58('B62qpH9Z7wA4FWYEbhf48PNhjKgeYhboVmBZNKd1tLSkFuZUoEiqYAm'),
  name: CircuitString.fromString("Some Org"),
  descr: CircuitString.fromString("A description for some Org"),
  acceptedTerms: Bool(true)
});

// ----------------------------------------------------

let account = await loopUntilAccountExists({
  account: deployerPublicKey,
  eachTimeNotExist: () => {
    console.log(
      'Deployer account does not exist. ' +
        'Request funds at faucet ' +
        'https://faucet.minaprotocol.com/?address=' +
        deployerPublicKey.toBase58()
    );
  },
  isZkAppAccount: false,
});

console.log(
  `Using fee payer account with nonce ${account.nonce}, balance ${account.balance}`
);

// ----------------------------------------------------

console.log('Compiling smart contract...');
let { verificationKey } = await StructAdd.compile();

const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
let zkapp = new StructAdd(zkAppPublicKey);

// Programmatic deploy:
//   Besides the CLI, you can also create accounts programmatically. This is useful if you need
//   more custom account creation - say deploying a zkApp to a different key than the fee payer
//   key, programmatically parameterizing a zkApp before initializing it, or creating Smart
//   Contracts programmatically for users as part of an application.
//await deploy(deployerPrivateKey, zkAppPrivateKey, zkapp, verificationKey);

await loopUntilAccountExists({
  account: zkAppPublicKey,
  eachTimeNotExist: () =>
    console.log('waiting for zkApp account to be deployed...'),
  isZkAppAccount: true,
});

let num = (await zkapp.commitedOrg.fetch())!;
console.log(`current value of num is ${num}`);

// ----------------------------------------------------

await StructAdd.compile();

let transaction = await Mina.transaction(
  { sender: feePayerPublicKey, fee: transactionFee },
  () => {
    zkapp.updateOrgWithHash(someOrg);
  }
);

// fill in the proof - this can take a while...
console.log('Creating an execution proof...');
let time0 = performance.now();
await transaction.prove();
let time1 = performance.now();
console.log(`creating proof took ${(time1 - time0) / 1e3} seconds`);

// sign transaction with the feePayer account
transaction.sign([feePayerPrivateKey]);

console.log('Sending the transaction...');
let pendingTransaction = await transaction.send();

// ----------------------------------------------------

if (!pendingTransaction.isSuccess) {
  console.log('error sending transaction (see above)');
  process.exit(0);
}

console.log(
  `See transaction at https://berkeley.minaexplorer.com/transaction/${pendingTransaction.hash()}
   Waiting for transaction to be included...`
);
await pendingTransaction.wait();

console.log(`updated state! ${await zkapp.commitedOrg.fetch()}`);

// ----------------------------------------------------

console.log('Shutting down');

await shutdown();