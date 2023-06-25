import fs from 'fs';
import { 
  PrivateKey, 
  PublicKey 
} from "snarkyjs";

export { readConfig, writeKeyFile, readKeyFile };

function readConfig(deployAlias: string): {
  deployer: { alias: string, privateKey: PrivateKey, publicKey: PublicKey },
  url: string,
  fee: number
} {
  // this is the 'config.json' file created with 'zk config'
  const configPath = `./config.json`;
  const config = JSON.parse(
    fs.readFileSync(configPath, 'utf8')
  ).deployAliases[deployAlias];

  const keyPair = readKeyFile(config.feepayerKeyPath);

  return {
    deployer: {
      alias: config.feepayerAlias,
      privateKey: PrivateKey.fromBase58(keyPair.privateKey),
      publicKey: PublicKey.fromBase58(keyPair.publicKey)
    },
    url: config.url,
    fee: parseFloat(config.fee)
  }
}

function readKeyFile(filePath: string): { 
  privateKey: string, 
  publicKey: string 
} { 
  const keys = JSON.parse(fs.readFileSync(filePath,'utf8'));
  // console.log("readyKeyFile=", keys);
  return keys;
}

function writeKeyFile(
  filePath: string, 
  keyPair: { 
    privateKey: string, 
    publicKey: string 
  }
) {
  fs.writeFileSync(filePath, JSON.stringify(keyPair, null,2))
}
