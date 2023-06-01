import {
  Field,
  state,
  State,
  method,
  PrivateKey,
  PublicKey,
  SmartContract,
  Mina,
  AccountUpdate,
  // isReady, // deprecated
  Bool,
  Struct,
  Reducer,
  Provable, Circuit
} from 'snarkyjs';

import { getProfiler } from './profiler.js';

export { CounterZkapp, deployCounterZkapp };

class MaybeIncrement extends Struct({
  isIncrement: Bool,
  otherData: Field,
  // we use this fillers to test if we 
  // can have a big composite struct
  filler0: Field,
  filler1: Field,
  filler2: Field,
  filler3: Field,
  filler4: Field,
  filler5: Field,
  filler6: Field,
  filler7: Field,
  filler8: Field,
  filler9: Field
}) {}

const INCREMENT = { 
  isIncrement: Bool(true), 
  otherData: Field(0),
  // we use this fillers to test if we 
  // can have a big composite struct
  filler0: Field(0),
  filler1: Field(1),
  filler2: Field(2),
  filler3: Field(3),
  filler4: Field(4),
  filler5: Field(5),
  filler6: Field(6),
  filler7: Field(7),
  filler8: Field(8),
  filler9: Field(9), 
};

class CounterZkapp extends SmartContract {
  // the "reducer" field describes a type of action that we can dispatch, and reduce later
  reducer = Reducer({ actionType: MaybeIncrement });

  // on-chain version of our state. it will typically lag behind the
  // version that's implicitly represented by the list of actions
  @state(Field) counter = State<Field>();
  // helper field to store the point in the action history that our on-chain state is at
  @state(Field) actionState = State<Field>();

  @method incrementCounter() {
    this.reducer.dispatch(INCREMENT);
  }
  @method dispatchData(data: Field) {
    this.reducer.dispatch({ 
      isIncrement: Bool(false), otherData: data,
      filler0: Field(0), filler1: Field(0),
      filler2: Field(0), filler3: Field(0),
      filler4: Field(0), filler5: Field(0),
      filler6: Field(0), filler7: Field(0),
      filler8: Field(0), filler9: Field(0), 
     });
  }

  @method rollupIncrements() {
    // get previous counter & actions hash, assert that they're the same as on-chain values
    let counter = this.counter.get();
    this.counter.assertEquals(counter);
    let actionState = this.actionState.get();
    this.actionState.assertEquals(actionState);

    // compute the new counter and hash from pending actions
    let pendingActions = this.reducer.getActions({
      fromActionState: actionState,
    });

    let { state: newCounter, actionState: newActionState } =
      this.reducer.reduce(
        pendingActions,
        // state type
        Field,
        // function that says how to apply an action
        (state: Field, action: MaybeIncrement) => {
          // this has an error: 
          // return Provable.if(action.isIncrement, state.add(1), state);
          return Circuit.if(action.isIncrement, state.add(1), state);
        },
        { state: counter, actionState }
      );

    // update on-chain state
    this.counter.set(newCounter);
    this.actionState.set(newActionState);
  }
}


/**
 * Here we deploy this contract and return the zkApp instance.
 */
async function deployCounterZkapp(
  feePayer: { publicKey: PublicKey, privateKey: PrivateKey },
  doProofs: boolean
): Promise<CounterZkapp> {

  const initialCounter = Field(0);
  
  // the zkapp account
  let zkappKey = PrivateKey.fromBase58(
    'EKEQc95PPQZnMY9d9p1vq1MWLeDJKtvKj4V75UDG3rjnf32BerWD'
  );
  let zkappAddress = zkappKey.toPublicKey();
  let zkapp = new CounterZkapp(zkappAddress);
  if (doProofs) {
    console.log('compile');
    await CounterZkapp.compile();
  }
  
  console.log('deploy');
  let tx = await Mina.transaction(feePayer.publicKey, () => {
    AccountUpdate.fundNewAccount(feePayer.publicKey);
    zkapp.deploy();
    zkapp.counter.set(initialCounter);
    zkapp.actionState.set(Reducer.initialActionState);
  });
  await tx.sign([feePayer.privateKey, zkappKey]).send();

  return zkapp;
}

