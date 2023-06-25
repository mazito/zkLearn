import {
  PrivateKey,
  PublicKey,
} from 'snarkyjs';

export { generateKeyPair, printKey };


function generateKeyPair(): { privateKey: string, publicKey: string } {
  const privateKey = PrivateKey.random();
  const publicKey = privateKey.toPublicKey();
  const keyPair = {
    privateKey: privateKey.toBase58(),
    publicKey: publicKey.toBase58()
  }
  return keyPair;
}


function printKey(key: PrivateKey | PublicKey | string): string {
  let s = "";
  if (key instanceof PrivateKey) s = PrivateKey.toBase58(key);
  if (key instanceof PublicKey) s = PublicKey.toBase58(key);
  if (typeof key === 'string') s = key;
  return `${s.slice(0, 6)}...${s.slice(-4)}`;
}
