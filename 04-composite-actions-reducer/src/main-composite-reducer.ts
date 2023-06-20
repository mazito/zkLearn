import {
  Field,
  PrivateKey,
  PublicKey,
  Mina,
  // isReady, // deprecated
} from 'snarkyjs';

import assert from "node:assert/strict";
import { getProfiler } from "./profiler.js";

import { deployCounterZkapp } from "./composite-reducer.js"

//await isReady; // deprecated!
const doProofs = true;
let Local = Mina.LocalBlockchain({ proofsEnabled: doProofs });
Mina.setActiveInstance(Local);

// a test account that pays all the fees, and puts additional funds into the zkapp
//let feePayerKey = Local.testAccounts[0].privateKey;
//let feePayer = Local.testAccounts[0].publicKey;
const feePayer: { 
  publicKey: PublicKey, 
  privateKey: PrivateKey 
} = Local.testAccounts[0];

const profiler = getProfiler('Reducer zkApp');
profiler.start('Reducer zkApp test flow');

const zkapp = await deployCounterZkapp(feePayer, doProofs);

console.log('main applying actions..');

console.log('main action 1');

let tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.incrementCounter();
  //zkapp.rollupIncrements();
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main action 2');
tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.incrementCounter();
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main action 3');
tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.incrementCounter();
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main rolling up pending actions..');

console.log('main state before: ' + zkapp.counter.get());

tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.rollupIncrements();
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main state after rollup: ' + zkapp.counter.get());
assert.deepEqual(zkapp.counter.get().toString(), '3');

console.log('main applying more actions');

console.log('main action 4 (no increment)');
tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.dispatchData(Field.random());
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main action 5');
tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.incrementCounter();
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main rolling up pending actions..');

console.log('main state before: ' + zkapp.counter.get());

tx = await Mina.transaction(feePayer.publicKey, () => {
  zkapp.rollupIncrements();
});
await tx.prove();
await tx.sign([feePayer.privateKey]).send();

console.log('main state after rollup: ' + zkapp.counter.get());
assert.equal(zkapp.counter.get().toString(), '4');

profiler.stop().store();
