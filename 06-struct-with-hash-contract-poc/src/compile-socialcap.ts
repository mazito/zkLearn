import { PublicKey } from "snarkyjs";
import { StructAdd } from "./StructAdd.js";

export { StructAddContract };

async function StructAddContract(zkappPublicKey: PublicKey)  {
   // 
  // We need to Verify the contract before deploying it,
  // and we need the generated verificationKey
  //
  console.log('\nCompiling and verifying smart contract ...');
  let { verificationKey } = await StructAdd.compile();

  console.log(
    'Verification key = ',
    JSON.stringify(verificationKey, null, 4)
  )

  //
  // Now we create the Zkapp instance we will deploy !
  //
  console.log('\nCreating the zkApp instance ...');
  let zkappInstance = new StructAdd(zkappPublicKey);

  return { zkappInstance, verificationKey }
}