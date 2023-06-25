/*
Use:

  node build/src/redeploy.js berkeley

*/
import { PublicKey } from "snarkyjs";
import { runDeploy } from "./deployment/run.js";

import { StructAddContract } from "./compile-socialcap.js";

const deployAlias = process.argv[2];

await runDeploy({
  deployAlias: deployAlias, 
  getInstance: StructAddContract
});
