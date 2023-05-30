import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Circuit
} from 'snarkyjs';

export class Square extends SmartContract {
  @state(Field) num = State<Field>();
  init() {
    super.init();
    this.num.set(Field(3));
  }

  @method update(square: Field) {
    const currentState = this.num.get();
    this.num.assertEquals(currentState);
    square.assertEquals(currentState.mul(currentState));
    // This does NOT WORK: Circuit.log(`Circuit.log currentState=${currentState}, square=${square}`);
    // This WORKS: 
    Circuit.log("Circuit.log currentState,square=",currentState, square);
    this.num.set(square);
  }
}
