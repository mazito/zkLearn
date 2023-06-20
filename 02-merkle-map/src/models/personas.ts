import {
  Field,
  Mina,
  PrivateKey,
  MerkleMap,
  PublicKey
} from 'snarkyjs';

import { Sender, HasMerkleMapContract } from '../contracts/index.js';


class Personas {
  /**
   * Contains the list of users Persona registered in the App
   * as a MerkleMap where each entry in the map has:
   * - uid UUID: the unique uid of the user Persona
   * - data any: the full data of the given user
   */
  private contract;
  private merkleMap;
  private sender: Sender;

  constructor(
    instance: HasMerkleMapContract,    
    sender: Sender
  ) {
    this.contract = instance;
    this.sender = sender ;
    this.merkleMap = new MerkleMap();
    console.log(`\nmerkleMap new JSON=`, JSON.stringify(this.merkleMap.tree, null,2));
  }

  /**
   * Adds a new persona to the set of personas in the App
   * @param uid string: the person UUID 
   * @param data any: the new data value  
   */
  async addNew(
    uid: string,
    data: any
  ) {
    // set up a change to the MerkleMap
    const key = Field(uid);
    const value = Field(data as number);
    this.merkleMap.set(key, value);
    console.log(`\nmodels.Persona: merkleMap key=${key.toString()}, value=${this.merkleMap.get(key)}`);
  
    // get its root
    const newRoot = this.merkleMap.getRoot();
    console.log(`\nmodels.Persona: merkleMap root=${newRoot}`);
  
      console.log(`\nmerkleMap update JSON=`, JSON.stringify(this.merkleMap.tree, null,2));
    // console.log(`\nmerkleMap JSON=`, JSON.stringify(this.merkleMap));

    // get the Witness of the changed key and value
    // LATTER ! const witness = this.merkleMap.getWitness(key);
  
    // update your local zkApp account with a transaction
    console.log(`\nmodels.Persona: Calling insert(...) on Contract ...`)
    const txn1 = await Mina.transaction(this.sender.publicKey, () => {
      this.contract.addPersona(
        newRoot
      )
    });
    console.log(`\nmodels.Persona: contract.addPersona txn1=`, txn1.toPretty());
  
    const txnProved = await txn1.prove();
    console.log(`\nmodels.Persona: proved txn1=`, txnProved.toString());
  
    const txnSigned = await txn1.sign([this.sender.privateKey]).send();
    console.log(`\nmodels.Persona: send txn1=`, txnSigned);
  
    // get the final changed value
    const mapRoot = this.contract.mapRoot.get();
    console.log(`\nmodels.Persona: root after txn1:`, mapRoot.toString());
  }
  
  /**
   * Updates a given persona existent in the set of personas in the App
   * @param uid string: the person UUID 
   * @param data any: the new data value  
   */
  async update(
    uid: string,
    data: any
  ) {
    // set up a change to the MerkleMap
    const key = Field(uid);
    const currentValue = this.merkleMap.get(key);
    const newValue = Field(data);

    // update the map isntance
    this.merkleMap.set(key, newValue);
    console.log(`\nmodels.Persona: merkleMap key=${key.toString()}, value=${this.merkleMap.get(key)}`);
  
    //console.log(`\nmerkleMap JSON=`, JSON:stringify(this.merkleMap));

    // get its root
    const newRoot = this.merkleMap.getRoot();
    console.log(`\nmodels.Persona: merkleMap root=${newRoot}`);
    
    // get the Witness of the changed key and value
    const witness = this.merkleMap.getWitness(key);
    console.log(`\nmodels.Persona: merkleMap witness JSON=`, witness.toJSON());
    console.log(`\nmodels.Persona: merkleMap witness=`, witness);
    
    // update your local zkApp account with a transaction
    console.log(`\nmodels.Persona: Calling update(...) on Contract ...`)
    const txn1 = await Mina.transaction(this.sender.publicKey, () => {
      this.contract.updatePersona(
        witness, 
        key, 
        newValue, 
        currentValue
      );
    });
    console.log(`\nmodels.Persona: contract.updatePersona txn1=`, txn1.toPretty());
  
    const txnProved = await txn1.prove();
    console.log(`\nmodels.Persona: prove txn1=`, txnProved.toString());
  
    const txnSigned = await txn1.sign([this.sender.privateKey]).send();
    console.log(`\nmodels.Persona: send txn1=`, txnSigned);
  
    // get the final changed value
    const mapRoot = this.contract.mapRoot.get();
    console.log(`\nmodels.Persona: root after txn1:`, mapRoot.toString());
  }
}

export {
  Personas
};