import { randomUUID } from 'crypto';
import { StructAdd } from './StructAdd';
import { Field, Mina, PrivateKey, PublicKey, Bool, AccountUpdate, fetchAccount, CircuitString } from 'snarkyjs';
import { uuidToField, Org } from './organizations';

/*
 * This file specifies how to test the `StructAdd` example smart contract. 
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = true;

const BERKELEY_URL = 'https://proxy.berkeley.minaexplorer.com/graphql';
const TX_FEE = 1_500_000_000; // 1.5   

// 'learn1' account which deployed the contract
const 
  ZKAPP_PUBLIC_KEY = 'B62qnZe9mnp5uJxiWMwV4x8dP77i3CN9CjsQ5JYXfFYdPtaaEbVbyzt',
  PRIVATE_KEY = "EKE2Yqe1ouevGLX5sECWSJurG2CqHjxbSyPEZA451xMd4YhALKZt";

const 
  // test3 account in wallet
  //SENDER_ID = "B62qnZe9mnp5uJxiWMwV4x8dP77i3CN9CjsQ5JYXfFYdPtaaEbVbyzt",
  //SENDER_KEY= "EKE2Yqe1ouevGLX5sECWSJurG2CqHjxbSyPEZA451xMd4YhALKZt";
  SENDER_KEY = "EKEffCf6nGnxehtHgQcbCcBfmGHbZeeibcPnzbcdpZhUGbxJzzYp",
  SENDER_ID = "B62qrv52UvPq6m3VWszbSmF4i6bTzkFVymr769dVBGoTbUcEgkEUdjS";

let 
  deployerAccount: PublicKey,
  deployerKey: PrivateKey,
  senderAccountId: PublicKey,
  senderPrivateKey: PrivateKey,
  zkAppAddress: PublicKey,
  zkAppPrivateKey: PrivateKey,
  zkApp: StructAdd;

const suid = randomUUID();   

const someOrg = new Org({ 
  uid: uuidToField(suid),
  accountId: PublicKey.fromBase58('B62qpH9Z7wA4FWYEbhf48PNhjKgeYhboVmBZNKd1tLSkFuZUoEiqYAm'),
  name: CircuitString.fromString("Some Org"),
  descr: CircuitString.fromString("A description for some Org"),
  acceptedTerms: Bool(true)
});


describe('StructAdd', () => {
  
  beforeAll(async () => {
    const Berkeley = Mina.Network(BERKELEY_URL);
    Mina.setActiveInstance(Berkeley);
    if (proofsEnabled) await StructAdd.compile();
  });

  beforeEach(() => {
    senderPrivateKey = PrivateKey.fromBase58(SENDER_KEY);
    senderAccountId = PublicKey.fromBase58(SENDER_ID);

    zkAppPrivateKey = PrivateKey.fromBase58(PRIVATE_KEY);    
    zkAppAddress = PublicKey.fromBase58(ZKAPP_PUBLIC_KEY);

    zkApp = new StructAdd(zkAppAddress);
  });

/*   it('correctly sends a event using `updateOrgLeaf`', async () => {
    let done = await test_updateOrgLeaf();
    expect(done).toEqual(1);
  });
 */
  it('correctly updates using updateOrgNoHash', async () => {
    await fetchAccount({publicKey: zkAppAddress})
    let done = await test_updateOrgNoHash();
    expect(done).toEqual(1);
  });

/*   it('correctly updates using updateOrgWithHash', async () => {
    let done = await test_updateOrgWithHash();
    expect(done).toEqual(1);
  });
 */});


async function test_updateOrgLeaf() {
  let done = 0;

  // update transaction
  try {
    const txn = await Mina.transaction(senderAccountId, () => {
      zkApp.updateOrgLeaf(someOrg);
    });
    await txn.prove();
    await txn.sign([senderPrivateKey]).send();
    done = 1 ;
  }
  catch (err) {
    console.log(err);
  }

  const updated = zkApp.commitedOrg.get();
  return done;
}


async function test_updateOrgNoHash() {
  let done = 0;

  // update transaction
  try {
    const sender = { fee: TX_FEE, sender: senderAccountId };
    const txn = await Mina.transaction(sender, () => {
      zkApp.updateOrgNoHash(someOrg);
    });
    await txn.prove();
    await txn.sign([senderPrivateKey]);
    await txn.send();

    done = 1;
  }
  catch (err) {
    console.log(err);
  }

  const updated = zkApp.commitedOrg.get();
  console.log("get=", updated);
  return(done);
}


async function test_updateOrgWithHash() {
    let done = 0;

    // update transaction
    try {
      const txn = await Mina.transaction(senderAccountId, () => {
        zkApp.updateOrgWithHash(someOrg);
      });
      await txn.prove();
      await txn.sign([senderPrivateKey]).send();
      done = 1;
    }
    catch (err) {
      console.log(err);
    }

    const updated = zkApp.commitedOrg.get();
    console.log("get=", updated);
    return done;
}
