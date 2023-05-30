import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Circuit,
  MerkleMap,
  MerkleMapWitness
} from 'snarkyjs';

export class HasMerkleMapContract extends SmartContract {

  @state(Field) mapRoot = State<Field>();

  init() {
    super.init();
    // INITIALIZE the state now 
    // get the root of the new tree to use as the initial tree root
    this.mapRoot.set(Field((new MerkleMap()).getRoot()));      
  }

  @method addPersona(
    newRoot: Field
  ) {
    const initialRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(initialRoot);
    Circuit.log("Circuit.log currentRoot=",initialRoot);

    // set the new root
    this.mapRoot.set(newRoot);

    const changedRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(changedRoot);
    Circuit.log("Circuit.log done !");
  }

  @method updatePersona(
    witness: MerkleMapWitness,
    key: Field,
    newValue: Field,
    previousValue: Field
  ) {
    const initialRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(initialRoot);
    Circuit.log("Circuit.log currentRoot=",initialRoot);
    Circuit.log("Circuit.log key=",key);
    Circuit.log("Circuit.log previousValue=",previousValue);
    Circuit.log("Circuit.log newValue=",newValue);
    
    // check the initial state matches what we expect
    const [ previousRoot, previousKey ] = witness.computeRootAndKey(previousValue);
    previousRoot.assertEquals(initialRoot);
    // check the key is the correct key 
    previousKey.assertEquals(key);
    Circuit.log("Circuit.log previousRoot=",previousRoot);
    Circuit.log("Circuit.log previousKey=",previousKey);

    // compute the new root for the existent key and the newValue
    const [ newRoot, _ ] = witness.computeRootAndKey(newValue);
    Circuit.log("Circuit.log newRoot=",newRoot);

    // set the new root
    this.mapRoot.set(newRoot);

    const changedRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(changedRoot);
    Circuit.log("Circuit.log done !");
  }
}

/*
export class HasMerkleMapContract extends SmartContract {

  @state(Field) mapRoot = State<Field>();

  @method init(initialRoot: Field) {
    this.mapRoot.set(initialRoot);
  };

  @method update(
    keyWitness: MerkleMapWitness,
    keyToChange: Field,
    valueBefore: Field,
    incrementAmount: Field,
  ) {
    const initialRoot = this.mapRoot.get();
    this.mapRoot.assertEquals(initialRoot);

    incrementAmount.assertLt(Field(10));

    // check the initial state matches what we expect
    const [ rootBefore, key ] = keyWitness.computeRootAndKey(valueBefore);
    rootBefore.assertEquals(initialRoot);

    key.assertEquals(keyToChange);

    // compute the root after incrementing
    const [ rootAfter, _ ] = keyWitness.computeRootAndKey(valueBefore.add(incrementAmount));

    // set the new root
    this.mapRoot.set(rootAfter);
  }  
}

export async updateMerkleMap(
  name: string, 
  key: Field, 
  data: any
  ) Promise<>{
    
  }
*/