import { randomUUID } from 'crypto';
import { 
  Field, 
  Struct,
  Bool,
  CircuitString,
  PublicKey,
  Poseidon
} from 'snarkyjs';

export { uuidToField, Org, testMe }


function uuidToField(uuid: string): Field {
  const hexWithoutHyphens = uuid.replace(/-/g, '');
  const hexWithPrefix = `0x${hexWithoutHyphens}`;
  // const bigvalue = BigInt(hexWithPrefix);
  return Field(hexWithPrefix);
}


class Org extends Struct({
  uid: Field,
  accountId: PublicKey,
  name: CircuitString,
  descr: CircuitString,
  acceptedTerms: Bool
}) {

  hash(): Field {
    const uids: Field[] = this.uid.toFields();
    //console.log("uids []=", uids);
    
    const keys: Field[] = this.accountId.toFields();
    //console.log("keys []=", keys);
    
    const strs: Field[] = CircuitString.fromString(this.name+this.descr).toFields();
    //console.log("strs []=", strs);
    
    const bools: Field[] = this.acceptedTerms.toFields();
    //console.log("bools []=", bools);
    
    let fields: Field[] = [];
    fields = fields.concat(uids).concat(keys).concat(strs).concat(bools);
    
    return Poseidon.hash(fields);
  }

  toJSON() {
    return {
      uid: this.uid.toString(),
      accountId: this.accountId.toBase58(),
      name: this.name.toString(),
      descr: this.descr.toString(),
      acceptedTerms: this.acceptedTerms.toBoolean()
    };
  }
}


// ** TEST ME PLEASE ** //

function testMe() {
  const suid = randomUUID();
  
  const vt = new Org({ 
    uid: uuidToField(suid),
    accountId: PublicKey.fromBase58('B62qpH9Z7wA4FWYEbhf48PNhjKgeYhboVmBZNKd1tLSkFuZUoEiqYAm'),
    name: "Some Org",
    descr: "A description for some Org",
    acceptedTerms: Bool(true)
  })
  console.log("toJSON=", vt.toJSON());
  console.log("hash=", vt.hash());
  console.log("hash string=", vt.hash().toString());
}
