import { PrivateKey, PublicKey } from 'snarkyjs';
import { HasMerkleMapContract } from './merkle-map-contract.js';
import { Square } from './square-contract.js';

interface Sender {
  privateKey: PrivateKey, 
  publicKey: PublicKey
}

export { 
  HasMerkleMapContract, 
  Square,
  Sender 
};