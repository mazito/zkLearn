import { randomUUID } from 'crypto';
import { StructAdd } from './StructAdd';
import { Field, Mina, PrivateKey, PublicKey, Bool, 
  AccountUpdate, CircuitString, fetchAccount 
} from 'snarkyjs';
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

  
  const BERKELEY_URL = 'https://proxy.berkeley.minaexplorer.com/graphql';
  const TX_FEE = 100_000_000; // 1.5   
  
  // 'learn1' account which deployed the contract
  const 
    ZKAPP_PUBLIC_KEY = 'B62qmGkvWmSKLAsjCpJqLbJh6HYmS1YCG9eY8aNdwSPTy92JEo44Mxe',
    ZKAPP_PRIVATE_KEY = "EKFM2Mp3NAJASPD8LcnpKWPs1ESvHsm5PfSQW8yBmJcxDqMrLNhz";
  
  const 
    // test3 account in wallet
    //SENDER_ID = "B62qnZe9mnp5uJxiWMwV4x8dP77i3CN9CjsQ5JYXfFYdPtaaEbVbyzt",
    //SENDER_KEY= "EKE2Yqe1ouevGLX5sECWSJurG2CqHjxbSyPEZA451xMd4YhALKZt";
    SENDER_KEY = "EKEffCf6nGnxehtHgQcbCcBfmGHbZeeibcPnzbcdpZhUGbxJzzYp",
    SENDER_ID = "B62qrv52UvPq6m3VWszbSmF4i6bTzkFVymr769dVBGoTbUcEgkEUdjS";
 

  beforeAll(async () => {
    if (proofsEnabled) await StructAdd.compile();
  });

  beforeEach(() => {
    //const Local = Mina.LocalBlockchain({ proofsEnabled });
    const Berkeley = Mina.Network(BERKELEY_URL);
    
    Mina.setActiveInstance(Berkeley);
    
    deployerKey = PrivateKey.fromBase58(ZKAPP_PRIVATE_KEY)
    deployerAccount = PublicKey.fromBase58(ZKAPP_PUBLIC_KEY);  

    senderKey = PrivateKey.fromBase58(SENDER_KEY)
    senderAccount = PublicKey.fromBase58(SENDER_ID)

    zkAppPrivateKey = deployerKey;
    zkAppAddress = deployerAccount;
    console.log("zkApp [",zkAppAddress.toString(), zkAppPrivateKey.toString(), "]")

    zkApp = new StructAdd(zkAppAddress);
  });

  async function localDeploy() {
    /*
    const txn = await Mina.transaction(deployerAccount, () => {
      //AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await txn.prove();

    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
    */

    await fetchAccount({ publicKey: zkAppAddress });    
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
      let txn = await Mina.transaction(
        { sender: senderAccount, fee: TX_FEE },
        () => {
          zkApp.updateOrgNoHash(someOrg);
        }
      );
      
      await txn.prove();

      await txn.sign([senderKey]).send();

      let pendingTransaction = await txn.send();
     
      if (!pendingTransaction.isSuccess) {
        console.log('error sending transaction (see above)');
        process.exit(0);
      }
      
      console.log(
        `See transaction at https://berkeley.minaexplorer.com/transaction/${pendingTransaction.hash()}
        Waiting for transaction to be included...`
      );
      await pendingTransaction.wait();
      
      done = 1;
    }
    catch (err) {
      console.log(err);
    }

    const updated = zkApp.commitedOrg.get();
    console.log("get=", updated);
    expect(done).toEqual(1);
  });

//   it('correctly updates using updateOrgWithHash', async () => {
//     await localDeploy();
//     let done = 0;
// 
//     // update transaction
//     try {
//       const txn = await Mina.transaction(senderAccount, () => {
//         zkApp.updateOrgWithHash(someOrg);
//       });
//       await txn.prove();
//       await txn.sign([senderKey]).send();
//       done = 1;
//     }
//     catch (err) {
//       console.log(err);
//     }
// 
//     const updated = zkApp.commitedOrg.get();
//     console.log("get=", updated);
//     expect(done).toEqual(1);
//   });
});
