import {
  PublicKey,
  fetchAccount,
  PrivateKey,
  Field,
  Mina,
  AccountUpdate,
  SmartContract
} from 'snarkyjs';

export { deploy };

const DEPLOY_TX_FEE = 100_000_000;


async function deploy(
  deployerPrivateKey: PrivateKey,
  zkappKeyPair: { privateKey: string, publicKey: string },
  zkapp: SmartContract,
  verificationKey: { data: string; hash: string | Field }
) {
  const zkAppPrivateKey = PrivateKey.fromBase58(zkappKeyPair.privateKey);  
  const zkAppPublicKey = PublicKey.fromBase58(zkappKeyPair.publicKey);

  let sender = deployerPrivateKey.toPublicKey();
  console.log(
    'Using deployer private key with public key', 
    sender.toBase58()
  );

  console.log("Checking if it is already deployed ...")
  let { account } = await fetchAccount({ publicKey: zkAppPublicKey });
  let isDeployed = account?.zkapp?.verificationKey !== undefined;

  if (isDeployed) {
    console.log(
      'zkApp for public key',
      zkAppPublicKey.toBase58(),
      'found already deployed'
    );
    return isDeployed;
  } 

  console.log(
    'Will deploy zkapp for public key', 
    zkAppPublicKey.toBase58()
  );

  console.log('Creating and proving the deploy transaction ...');
  let transaction = await Mina.transaction(
    { sender, fee: DEPLOY_TX_FEE },
    () => {
      AccountUpdate.fundNewAccount(sender);
      // NOTE: this calls `init()` if this is the first deploy
      zkapp.deploy({ verificationKey });
    }
  );
  await transaction.prove();
  transaction.sign([deployerPrivateKey, zkAppPrivateKey]);

  console.log('Sending the deploy transaction...');
  const res = await transaction.send();
  const hash = res.hash();
  if (hash === undefined) {
    console.log('Error sending transaction (see above)');
  } 
  else {
    console.log(
      'See deploy transaction at',
      'https://berkeley.minaexplorer.com/transaction/' + hash
    );

    console.log('Waiting for zkApp account to be deployed...');
    await res.wait();

    console.log('Deployed !');
    isDeployed = true;
  }

  return isDeployed;
}


