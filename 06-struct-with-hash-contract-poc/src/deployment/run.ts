import { isReady, shutdown, Mina, PrivateKey, PublicKey, SmartContract, VerificationKey } from 'snarkyjs';
import { loopUntilAccountExists } from '../utils/accounts.js';
import { deploy } from '../utils/deploy.js';
import { generateKeyPair, printKey } from '../utils/keys.js';
import { readConfig, writeKeyFile } from '../utils/config.js';

export { runDeploy } ;

async function runDeploy({
  deployAlias,
  getInstance
}: {
  deployAlias: string;
  getInstance: (pk: PublicKey) => any;
}) {

  // this is the 'zk config' alias we will use
  console.log(
    '\n---------------------------------------------------------------------------',
    '\nStarting deploy ...',
    '\n---------------------------------------------------------------------------'
  );
  console.log(`\nReading 'zk config' file for alias='${deployAlias}' ...`)
  const config = readConfig(deployAlias);


  console.log(`\nUsing configuration = ${JSON.stringify(config, null, 4)}`);
  const deployer = config.deployer;
  const TX_FEE = 100_000_000;
  const networkUrl = config.url;


  console.log('\nLoading SnarkyJS ...');
  await isReady;


  console.log('\nSetting Network Berkeley ...')
  const Berkeley = Mina.Network(networkUrl);
  Mina.setActiveInstance(Berkeley);


  console.log('\nChecking for account to be available ...');
  let account = await loopUntilAccountExists({
    account: deployer.publicKey,
    eachTimeNotExist: () => {
      console.log(
        'Deployer account does not exist. ' +
          'Request funds at faucet ' +
          'https://faucet.minaprotocol.com/?address=' +
          deployer.publicKey.toBase58()
      );
    },
    isZkAppAccount: false,
  });

  console.log(
    `Using deployer '${deployer.alias}' (as fee payer) account with nonce ${account.nonce}, balance ${account.balance}`
  );


  //
  // To deploy the contract we ALWAYS create a new key pair for it, 
  // as suggested by maht0rz (Matej)
  // 
  console.log('\nCreating a new key pair for the Zkapp ...');
  const zkappKeyPair = generateKeyPair(); 

  console.log(
    'New zkApp key pair =',
    JSON.stringify(zkappKeyPair, null, 4)
    )

  const keyPath = `./keys/_${deployAlias}.json`;   
  console.log(`Write to '${keyPath}'`);
  writeKeyFile(keyPath, zkappKeyPair);


  // 
  // Compile and instance
  //
  const zkappPublicKey = PublicKey.fromBase58(zkappKeyPair.publicKey);
  let { zkappInstance, verificationKey } = await getInstance(zkappPublicKey);


  //
  // Programmatic deploy:
  //  Besides the CLI, you can also create accounts programmatically. This is useful if you need
  //  more custom account creation - say deploying a zkApp to a different key than the fee payer
  //  key, programmatically parameterizing a zkApp before initializing it, or creating Smart
  //  Contracts programmatically for users as part of an application.
  //
  console.log('\nStarting deploy ...');
  const wasDeployed = await deploy(
    deployer.privateKey, 
    zkappKeyPair, 
    zkappInstance, 
    verificationKey
  );

  // 
  // This takes some time, so we need to wait before we now it is ready to go
  //
  if (wasDeployed) {
    console.log('\nWaiting for the deployed zkApp to be available ...')
    await loopUntilAccountExists({
      account: zkappPublicKey,
      eachTimeNotExist: () =>
        console.log('waiting for zkApp account to be deployed...'),
      isZkAppAccount: true,
    });
    
    console.log ("It is ready to go !");
  }

  console.log('\nShutting down !');
  await shutdown();
}
