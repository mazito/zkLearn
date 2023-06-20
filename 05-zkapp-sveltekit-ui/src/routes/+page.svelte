<script>
  // Ui components
  import { onMount } from 'svelte';
	import { Spinner, Icon, Button } from 'sveltestrap';
  import Welcome from '@components/Welcome.svelte';

  import { 
    loadSnarky, 
    berkeleyMinaStore, 
    deployedZkAppStore,
    auroWallet$, 
	  connectWallet,
	  updateAdd
  } from '$lib/contracts/helpers';
	import { PublicKey } from 'snarkyjs';

  let status;

  onMount(async () => {
    status = "Wait ... loading Snarky onMount()"
    await loadSnarky();
    status = "loadSnarky() done!";
  })

  const callLoader = async () => {
    status = 'Wait .... loading Snarky and compiling Add'
    await loadSnarky();
    status = "loadSnarky() done!";
  }

  const callWallet = async () => {
    status = 'Wait .... connecting Auro wallet'
    let res = await  connectWallet();
    status = res ? "Wallet connected" : "Wallet connection failed";
  }

  const callUpdate = async () => {
    status = 'Wait .... running Add.update() and send transaction'
    let res = await  updateAdd();
    status = res ? `<a href="https://berkeley.minaexplorer.com/transaction/${res}">Tx ${res}` : res;
  }
</script>

<div class="text-center">
  <Welcome />
  <h2>
    <!-- <Spinner color="danger" size="lg" type="grow"/> -->
    Welcome to the zkApp <Icon name="globe2" />
    <br/>
  </h2>
</div>

<p class="text-center p-1 fs-5">
  <b>Status = </b>
  {@html status || "Unknown ... Snarky not loaded"}
</p>

<p class="text-center p-1 fs-5">
  <b>Wallet </b>
  connected={$auroWallet$.connected} 
  publicKey={$auroWallet$?.publicKey || "?"}
</p>

<p class="text-center">
  <Button color="primary" on:click={callLoader}>
    Load Snarkyjs zkappInstance
  </Button>
</p>

<p class="text-center">
  <Button color="primary" on:click={callWallet}>
    Connect wallet
  </Button>
</p>

<p class="text-center">
    <Button color="primary" on:click={callUpdate}>
    Call update() method on contract Add
  </Button>
</p>
