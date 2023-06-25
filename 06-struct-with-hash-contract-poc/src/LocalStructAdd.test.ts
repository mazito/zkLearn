import { randomUUID } from 'crypto';
import { StructAdd } from './StructAdd';
import { Field, Mina, PrivateKey, PublicKey, Bool, AccountUpdate, CircuitString } from 'snarkyjs';
import { uuidToField, Org } from './organizations';

/*
 * This file specifies how to test the `StructAdd` example smart contract. It is safe to delete this file and replace
 * with your own tests.
 *
 * See https://docs.minaprotocol.com/zkapps for more info.
 */

let proofsEnabled = true;

describe('StructAdd', () => {
  let deployerAccount: PublicKey,
    deployerKey: PrivateKey,
    senderAccount: PublicKey,
    senderKey: PrivateKey,
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

  // const hashedOrg = someOrg.hash()
  
  beforeAll(async () => {
    if (proofsEnabled) await StructAdd.compile();
  });

  beforeEach(() => {
    const Local = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      Local.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      Local.testAccounts[1]);
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new StructAdd(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the `StructAdd` smart contract', async () => {
    await localDeploy();
    const commited = zkApp.commitedOrg.get();
    expect(commited).toEqual(Field(0));
  });

  /*
  it('correctly send a event in the `StructAdd` smart contract', async () => {
    await localDeploy();

    // update transaction
    try {
      const txn = await Mina.transaction(senderAccount, () => {
        zkApp.updateOrgLeaf(someOrg);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
    }
    catch (err) {
      console.log(err);
    }

    const updatedHash = zkApp.commitedOrg.get();
    expect(updatedHash).toEqual(updatedHash);
  });
  */

  it('correctly updates using updateOrgNoHash', async () => {
    await localDeploy();
    let done = 0;

    // update transaction
    try {
      const txn = await Mina.transaction(senderAccount, () => {
        zkApp.updateOrgNoHash(someOrg);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
      done = 1;
    }
    catch (err) {
      console.log(err);
    }

    const updated = zkApp.commitedOrg.get();
    console.log("get=", updated);
    expect(done).toEqual(1);
  });

  it('correctly updates using updateOrgWithHash', async () => {
    await localDeploy();
    let done = 0;

    // update transaction
    try {
      const txn = await Mina.transaction(senderAccount, () => {
        zkApp.updateOrgWithHash(someOrg);
      });
      await txn.prove();
      await txn.sign([senderKey]).send();
      done = 1;
    }
    catch (err) {
      console.log(err);
    }

    const updated = zkApp.commitedOrg.get();
    console.log("get=", updated);
    expect(done).toEqual(1);
  });
});
