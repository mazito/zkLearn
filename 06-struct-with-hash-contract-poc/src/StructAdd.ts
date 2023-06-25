import { 
  Field, 
  CircuitString,
  Struct,
  SmartContract, 
  state, 
  State, 
  method,
  Poseidon,
  Circuit
} from 'snarkyjs';

import { uuidToField, Org } from './organizations.js';


export class StructAdd extends SmartContract {
  @state(Field) commitedOrg = State<Field>();

  events = {
    'update-merkle-leaf': Struct({
      mapid: Field,
      hash: Field,
      key: Field,
    })
  };

  init() {
    super.init();
    this.commitedOrg.set(Field(0));
  }

  hashOrg(o: Org): Field {
    const uids: Field[] = o.uid.toFields();
    const keys: Field[] = o.accountId.toFields();
    const strs: Field[] = o.name.toFields().concat(o.descr.toFields());
    const bools: Field[] = o.acceptedTerms.toFields();

    let fields: Field[] = [];
    fields = fields.concat(uids).concat(keys).concat(strs).concat(bools);

    return Poseidon.hash(fields);
  }

  @method updateOrgLeaf(org: Org) {
    const hashed = this.hashOrg(org);
    const key = Field(org.uid);
    Circuit.log("StructAdd::updateOrgLeaf() > key=", key);
    Circuit.log("StructAdd::updateOrgLeaf() > hashed=", hashed);

    this.emitEvent("update-merkle-leaf", {
      mapid: Field(2),
      hash: hashed,
      key: key
    });  
    
    Circuit.log("StructAdd::updateOrgLeaf() > emitEvent=", "DONE!");
  }  

  @method updateOrgWithHash(org: Org) {
    const currentState = this.commitedOrg.get();
    this.commitedOrg.assertEquals(currentState);

    const hashed = this.hashOrg(org);
    Circuit.log("StructAdd::updateOrgWithHash() > hashedOrg=", hashed);

    this.commitedOrg.set(hashed);
  }

  @method updateOrgNoHash(org: Org) {
    const currentState = this.commitedOrg.get();
    this.commitedOrg.assertEquals(currentState);

    Circuit.log("StructAdd::updateOrgNoHash()");

    this.commitedOrg.set(Field(1));
  }
}
